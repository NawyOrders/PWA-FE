import type { CacheLike, CacheStorageLike, FetchLike } from "./cache-types";

export const CACHE_PREFIX = "karam-";
export const IMAGE_CACHE = "karam-images-v1";
export const FONT_CACHE = "karam-fonts-v1";
export const STATIC_CACHE_PREFIX = "karam-static-";
export const NAV_TIMEOUT_MS = 3000;
export const IMAGE_CACHE_LIMIT = 60;
export const IMAGE_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000;
export const CACHED_AT_HEADER = "x-karam-cached-at";

const IMAGE_EXTENSIONS = /\.(png|webp|avif|jpe?g|svg|gif)$/i;
const FONT_EXTENSIONS = /\.(woff2|woff)$/i;
const IGNORED_PREFIXES = ["/_next/static", "/_next/data", "/api"];
const IGNORED_PATHS = ["/sw.js", "/manifest.webmanifest"];

export interface StrategyDeps {
  caches: CacheStorageLike;
  fetch: FetchLike;
  now: () => number;
}

export type WorkerLocale = "ar" | "en";

export interface NavigationOptions {
  timeoutMs?: number;
  preload?: Promise<Response | undefined>;
  renderOffline: (locale: WorkerLocale) => string;
}

export function localeFromPathname(pathname: string): WorkerLocale {
  return pathname === "/en" || pathname.startsWith("/en/") ? "en" : "ar";
}

export function isIgnoredPath(pathname: string): boolean {
  if (IGNORED_PATHS.includes(pathname)) return true;
  if (pathname.endsWith("/manifest.webmanifest")) return true;
  return IGNORED_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

export function shouldIntercept(
  url: URL,
  method: string,
  origin: string,
  destination: RequestDestination | "",
): boolean {
  if (method !== "GET") return false;
  if (url.origin !== origin) return false;
  if (isIgnoredPath(url.pathname)) return false;
  if (destination === "document" && isIgnoredPath(url.pathname)) return false;
  return true;
}

export function isImageRequest(url: URL, destination: RequestDestination | ""): boolean {
  if (destination === "image") return true;
  if (url.pathname === "/_next/image") return true;
  return IMAGE_EXTENSIONS.test(url.pathname);
}

export function isFontRequest(url: URL, destination: RequestDestination | ""): boolean {
  if (destination === "font") return true;
  return FONT_EXTENSIONS.test(url.pathname);
}

function cacheControl(response: Response): string {
  return response.headers.get("cache-control")?.toLowerCase() ?? "";
}

export function isCacheableResponse(response: Response): boolean {
  if (response.status !== 200) return false;
  if (response.type === "opaque") return false;
  return !cacheControl(response).includes("no-store");
}

function isExpired(response: Response, now: number, maxAgeMs: number): boolean {
  const stamped = response.headers.get(CACHED_AT_HEADER);
  const date = response.headers.get("date");
  const parsed = stamped ? Number.parseInt(stamped, 10) : date ? Date.parse(date) : Number.NaN;
  if (!Number.isFinite(parsed)) return false;
  return now - parsed > maxAgeMs;
}

async function stampResponse(response: Response, now: number): Promise<Response> {
  const headers = new Headers(response.headers);
  headers.set(CACHED_AT_HEADER, String(now));
  const body = await response.clone().arrayBuffer();
  return new Response(body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

async function trimCache(cache: CacheLike, maxEntries: number): Promise<void> {
  const keys = await cache.keys();
  if (keys.length <= maxEntries) return;
  const removed = keys.slice(0, keys.length - maxEntries);
  await Promise.all(removed.map((key) => cache.delete(key)));
}

export async function handleActivate(deps: StrategyDeps, keep: ReadonlyArray<string>): Promise<string[]> {
  const keys = await deps.caches.keys();
  const keepSet = new Set(keep);
  const stale = keys.filter((key) => key.startsWith(CACHE_PREFIX) && !keepSet.has(key));
  await Promise.all(stale.map((key) => deps.caches.delete(key)));
  return stale;
}

function hasMessageType(value: unknown): value is { type?: unknown } {
  return typeof value === "object" && value !== null;
}

export async function handleMessage(
  data: unknown,
  skipWaiting: () => Promise<void> | void,
): Promise<boolean> {
  if (!hasMessageType(data) || data.type !== "SKIP_WAITING") return false;
  await skipWaiting();
  return true;
}

export async function handleNavigation(
  request: Request,
  deps: StrategyDeps,
  options: NavigationOptions,
): Promise<Response> {
  const timeoutMs = options.timeoutMs ?? NAV_TIMEOUT_MS;
  const network = options.preload
    ? options.preload.then((preload) => preload ?? deps.fetch(request))
    : deps.fetch(request);

  let timeoutHandle: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<"timeout">((resolve) => {
    timeoutHandle = setTimeout(() => resolve("timeout"), timeoutMs);
  });

  try {
    const networkResult = network.then(
      (response) => ({ kind: "response" as const, response }),
      () => ({ kind: "error" as const }),
    );
    const result = await Promise.race([
      networkResult,
      timeout.then((value) => ({ kind: "timeout" as const, value })),
    ]);

    if (result.kind === "response") {
      return result.response;
    }
  } finally {
    if (timeoutHandle) clearTimeout(timeoutHandle);
  }

  const locale = localeFromPathname(new URL(request.url).pathname);
  const html = options.renderOffline(locale);
  return new Response(html, {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}

export async function staleWhileRevalidate(
  request: Request,
  deps: StrategyDeps,
  cacheName: string,
  maxEntries = IMAGE_CACHE_LIMIT,
  maxAgeMs = IMAGE_MAX_AGE_MS,
): Promise<Response> {
  const cache = await deps.caches.open(cacheName);
  const cached = await cache.match(request);

  const network = deps
    .fetch(request)
    .then(async (response) => {
      if (isCacheableResponse(response)) {
        await cache.put(request, await stampResponse(response, deps.now()));
        await trimCache(cache, maxEntries);
      }
      return response;
    })
    .catch(() => undefined);

  if (cached && !isExpired(cached, deps.now(), maxAgeMs)) {
    void network;
    return cached;
  }

  const response = await network;
  if (response) return response;
  return new Response(null, { status: 504, statusText: "Gateway Timeout" });
}

export async function cacheFirst(
  request: Request,
  deps: StrategyDeps,
  cacheName: string,
): Promise<Response> {
  const cache = await deps.caches.open(cacheName);
  const cached = await cache.match(request);
  if (cached) return cached;

  try {
    const response = await deps.fetch(request);
    if (isCacheableResponse(response)) {
      await cache.put(request, await stampResponse(response, deps.now()));
    }
    return response;
  } catch {
    return new Response(null, { status: 504, statusText: "Gateway Timeout" });
  }
}

export async function handleImage(request: Request, deps: StrategyDeps): Promise<Response> {
  return staleWhileRevalidate(request, deps, IMAGE_CACHE);
}

export async function handleFont(request: Request, deps: StrategyDeps): Promise<Response> {
  return cacheFirst(request, deps, FONT_CACHE);
}

export function collectPrecacheWarnings(urls: ReadonlyArray<string>, exists: (path: string) => boolean): string[] {
  return urls.filter((url) => !exists(`public${url}`));
}
