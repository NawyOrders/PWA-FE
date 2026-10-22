import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import manifest from "@/app/manifest";

const SW = readFileSync(join(process.cwd(), "public/sw.js"), "utf8");
const CSS = readFileSync(join(process.cwd(), "src/styles/globals.css"), "utf8");
const OFFLINE = readFileSync(join(process.cwd(), "public/offline.html"), "utf8");

function tokenValue(name: string): string | undefined {
  const match = CSS.match(new RegExp(`${name}:\\s*(#[0-9a-fA-F]{3,6})`));
  return match?.[1];
}

describe("PWA: the manifest", () => {
  const value = manifest();

  it("UT-PWA-01 uses the brand name and short name", () => {
    expect(value.name).toContain("Karam El Sham");
    expect(value.short_name).toBeTruthy();
    expect(value.short_name!.length).toBeLessThanOrEqual(12);
  });

  it("UT-PWA-02 is Arabic and right to left", () => {
    expect(value.lang).toBe("ar");
    expect(value.dir).toBe("rtl");
  });

  it("UT-PWA-03 starts at the Arabic home inside the app scope", () => {
    expect(value.start_url).toBe("/ar");
    expect(value.scope).toBe("/");
    expect(value.display).toBe("standalone");
  });

  it("UT-PWA-04 keeps background and theme colours on the design tokens", () => {
    expect(value.background_color?.toUpperCase()).toBe(tokenValue("--bg-splash")!.toUpperCase());
    expect(value.theme_color?.toUpperCase()).toBe(tokenValue("--primary")!.toUpperCase());
  });

  it("UT-PWA-05 declares the 192, 512 and maskable icons", () => {
    const icons = value.icons ?? [];
    const sizes = icons.map((icon) => icon.sizes);

    expect(sizes).toContain("192x192");
    expect(sizes).toContain("512x512");
    expect(icons.some((icon) => icon.purpose === "maskable")).toBe(true);
    expect(icons.every((icon) => icon.type === "image/png")).toBe(true);
  });
});

describe("PWA: the service worker source", () => {
  it("UT-PWA-06 never caches the Next.js static bundle", () => {
    expect(SW).toContain("/_next/static");
    // The guard returns before any cache write for that prefix.
    expect(SW).toMatch(/pathname\.startsWith\("\/_next\/static"\)\) return/);
  });

  it("UT-PWA-07 falls back to the offline page after a timeout", () => {
    expect(SW).toContain("NAV_TIMEOUT_MS");
    expect(SW).toContain("AbortController");
    expect(SW).toContain("OFFLINE_URL");
    expect(SW).toMatch(/mode === "navigate"/);
  });

  it("UT-PWA-08 serves the images cache-first then revalidates", () => {
    expect(SW).toContain("staleWhileRevalidate");
    expect(SW).toContain("IMAGE_CACHE_LIMIT");
    expect(SW).toContain("/images/");
    expect(SW).toContain("/_next/image");
  });

  it("UT-PWA-09 deletes the old caches on activate", () => {
    expect(SW).toMatch(/addEventListener\("activate"/);
    expect(SW).toContain("caches.delete(key)");
    expect(SW).toContain("self.clients.claim()");
  });

  it("UT-PWA-10 ignores non-GET and cross-origin requests", () => {
    expect(SW).toMatch(/request\.method !== "GET"\) return/);
    expect(SW).toMatch(/url\.origin !== self\.location\.origin/);
  });

  it("UT-PWA-11 precaches the offline routes on install", () => {
    expect(SW).toMatch(/addEventListener\("install"/);
    expect(SW).toContain("cache.addAll");
    expect(SW).toContain('["/ar/offline", "/en/offline"]');
  });

  it("UT-PWA-12 ships an offline page with Arabic copy", () => {
    expect(OFFLINE.toLowerCase()).toContain("<!doctype html>");
    expect(OFFLINE).toMatch(/lang="ar"/);
    expect(OFFLINE).toMatch(/dir="rtl"/);
  });
});
