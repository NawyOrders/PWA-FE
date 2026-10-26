import { describe, expect, it, vi } from "vitest";
import type { CacheLike, CacheStorageLike, FetchLike } from "@/sw/cache-types";
import {
  CACHED_AT_HEADER,
  FONT_CACHE,
  IMAGE_CACHE,
  collectPrecacheWarnings,
  handleActivate,
  handleFont,
  handleImage,
  handleMessage,
  handleNavigation,
  isCacheableResponse,
  isIgnoredPath,
  localeFromPathname,
  shouldIntercept,
  staleWhileRevalidate,
} from "@/sw/strategies";

function keyOf(request: Request | string): string {
  return typeof request === "string" ? request : request.url;
}

class FakeCache implements CacheLike {
  readonly entries = new Map<string, Response>();

  async match(request: Request | string): Promise<Response | undefined> {
    return this.entries.get(keyOf(request))?.clone();
  }

  async put(request: Request | string, response: Response): Promise<void> {
    this.entries.set(keyOf(request), response.clone());
  }

  async keys(): Promise<ReadonlyArray<Request>> {
    return Array.from(this.entries.keys(), (url) => new Request(url));
  }

  async delete(request: Request | string): Promise<boolean> {
    return this.entries.delete(keyOf(request));
  }

  async addAll(requests: ReadonlyArray<string | Request>): Promise<void> {
    for (const request of requests) {
      await this.put(request, new Response("cached"));
    }
  }
}

class FakeCaches implements CacheStorageLike {
  readonly stores = new Map<string, FakeCache>();

  async open(name: string): Promise<CacheLike> {
    let cache = this.stores.get(name);
    if (!cache) {
      cache = new FakeCache();
      this.stores.set(name, cache);
    }
    return cache;
  }

  async keys(): Promise<string[]> {
    return Array.from(this.stores.keys());
  }

  async delete(name: string): Promise<boolean> {
    return this.stores.delete(name);
  }
}

function response(body: string, init: ResponseInit = {}): Response {
  return new Response(body, { status: 200, ...init });
}

function setup(fetchImpl: FetchLike, now = () => 1_000) {
  const caches = new FakeCaches();
  const fetch = vi.fn(fetchImpl);
  return { caches, fetch, deps: { caches, fetch, now } };
}

describe("PWA: request routing", () => {
  const origin = "https://shop.test";

  it("UT-SW-01 intercepts same-origin GET requests only", () => {
    const url = new URL(`${origin}/ar/menu`);
    expect(shouldIntercept(url, "GET", origin, "document")).toBe(true);
    expect(shouldIntercept(url, "POST", origin, "document")).toBe(false);
    expect(shouldIntercept(new URL("https://other.test/ar"), "GET", origin, "document")).toBe(false);
  });

  it("UT-SW-02 ignores Next.js internals, the API and the worker", () => {
    for (const path of [
      "/_next/static/chunk.js",
      "/_next/data/build/ar.json",
      "/api/orders",
      "/sw.js",
      "/ar/manifest.webmanifest",
    ]) {
      expect(isIgnoredPath(path), path).toBe(true);
      expect(shouldIntercept(new URL(origin + path), "GET", origin, "image")).toBe(false);
    }
    expect(isIgnoredPath("/images/burger.jpg")).toBe(false);
  });

  it("UT-SW-03 maps paths to the offline locale", () => {
    expect(localeFromPathname("/en")).toBe("en");
    expect(localeFromPathname("/en/menu")).toBe("en");
    expect(localeFromPathname("/ar/menu")).toBe("ar");
    expect(localeFromPathname("/unknown")).toBe("ar");
  });
});

describe("PWA: navigation strategy", () => {
  it("UT-SW-04 returns the network HTML without caching it", async () => {
    const { deps, caches } = setup(() => Promise.resolve(response("<h1>network</h1>")));
    const result = await handleNavigation(new Request("https://shop.test/ar"), deps, {
      timeoutMs: 50,
      renderOffline: () => "<h1>offline</h1>",
    });

    expect(await result.text()).toBe("<h1>network</h1>");
    expect(await caches.keys()).toEqual([]);
  });

  it("UT-SW-05 uses navigation preload when the browser provides it", async () => {
    const { deps, fetch } = setup(() => Promise.resolve(response("fallback")));
    const result = await handleNavigation(new Request("https://shop.test/en"), deps, {
      timeoutMs: 50,
      preload: Promise.resolve(response("preloaded")),
      renderOffline: () => "offline",
    });

    expect(await result.text()).toBe("preloaded");
    expect(fetch).not.toHaveBeenCalled();
  });

  it("UT-SW-06 falls back to the inline offline page after the timeout", async () => {
    const { deps } = setup(() => new Promise(() => undefined));
    const result = await handleNavigation(new Request("https://shop.test/en/menu"), deps, {
      timeoutMs: 5,
      renderOffline: (locale) => `<h1>offline-${locale}</h1>`,
    });

    expect(await result.text()).toBe("<h1>offline-en</h1>");
    expect(result.headers.get("cache-control")).toBe("no-store");
    expect(result.headers.get("content-type")).toContain("text/html");
  });
});

describe("PWA: image strategy", () => {
  it("UT-SW-07 caches a fresh image and stamps it", async () => {
    const { deps, caches } = setup(() => Promise.resolve(response("image")), () => 1234);
    const request = new Request("https://shop.test/images/burger.jpg");
    const result = await handleImage(request, deps);
    const cache = await caches.open(IMAGE_CACHE);
    const cached = await cache.match(request);

    expect(await result.text()).toBe("image");
    expect(cached?.headers.get(CACHED_AT_HEADER)).toBe("1234");
  });

  it("UT-SW-08 serves a fresh cached image while revalidating in the background", async () => {
    const { deps, caches, fetch } = setup(() => Promise.resolve(response("new")));
    const cache = await caches.open(IMAGE_CACHE);
    const request = new Request("https://shop.test/images/burger.webp");
    const cached = response("old");
    cached.headers.set(CACHED_AT_HEADER, "1000");
    await cache.put(request, cached);

    const result = await handleImage(request, deps);

    expect(await result.text()).toBe("old");
    expect(fetch).toHaveBeenCalledTimes(1);
    await vi.waitFor(async () => {
      expect(await (await cache.match(request))?.text()).toBe("new");
    });
  });

  it("UT-SW-09 drops an expired image when revalidation fails", async () => {
    const { deps, caches } = setup(() => Promise.reject(new Error("offline")));
    const cache = await caches.open(IMAGE_CACHE);
    const request = new Request("https://shop.test/images/burger.png");
    const cached = response("old");
    cached.headers.set(CACHED_AT_HEADER, "1");
    await cache.put(request, cached);

    const result = await handleImage(request, deps);

    expect(result.status).toBe(504);
  });

  it("UT-SW-10 trims the image cache to its entry limit", async () => {
    const { deps } = setup(() => Promise.resolve(response("image")));
    for (const name of ["a", "b", "c"]) {
      await staleWhileRevalidate(
        new Request(`https://shop.test/images/${name}.jpg`),
        deps,
        IMAGE_CACHE,
        2,
      );
    }
    const cache = await deps.caches.open(IMAGE_CACHE);
    expect((await cache.keys()).length).toBe(2);
  });

  it("UT-SW-11 never caches opaque or error responses", async () => {
    expect(isCacheableResponse(response("ok"))).toBe(true);
    expect(isCacheableResponse(response("missing", { status: 404 }))).toBe(false);
    expect(isCacheableResponse(response("no", { headers: { "cache-control": "no-store" } }))).toBe(
      false,
    );
  });
});

describe("PWA: font strategy", () => {
  it("UT-SW-12 caches fonts on first use and serves them cache-first", async () => {
    const { deps, fetch } = setup(() => Promise.resolve(response("font")));
    const request = new Request("https://shop.test/fonts/cairo.woff2");

    expect(await (await handleFont(request, deps)).text()).toBe("font");
    expect(await (await handleFont(request, deps)).text()).toBe("font");
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(await (await deps.caches.open(FONT_CACHE)).match(request)).toBeDefined();
  });
});

describe("PWA: lifecycle helpers", () => {
  it("UT-SW-13 deletes old Karam caches on activate but keeps the current ones", async () => {
    const caches = new FakeCaches();
    await caches.open("karam-static-old");
    await caches.open("karam-static-new");
    await caches.open("karam-images-v1");
    await caches.open("unrelated-cache");
    const removed = await handleActivate({ caches, fetch: vi.fn(), now: () => 0 }, [
      "karam-static-new",
      "karam-images-v1",
    ]);

    expect(removed).toEqual(["karam-static-old"]);
    expect(await caches.keys()).toEqual(
      expect.arrayContaining(["karam-static-new", "karam-images-v1", "unrelated-cache"]),
    );
  });

  it("UT-SW-14 skips waiting only for the expected message", async () => {
    const skipWaiting = vi.fn();

    expect(await handleMessage({ type: "OTHER" }, skipWaiting)).toBe(false);
    expect(await handleMessage(null, skipWaiting)).toBe(false);
    expect(await handleMessage({ type: "SKIP_WAITING" }, skipWaiting)).toBe(true);
    expect(skipWaiting).toHaveBeenCalledTimes(1);
  });

  it("UT-SW-15 reports missing precache files", () => {
    const warnings = collectPrecacheWarnings(
      ["/icons/logo.png", "/icons/missing.png"],
      (path) => path !== "public/icons/missing.png",
    );

    expect(warnings).toEqual(["/icons/missing.png"]);
  });
});
