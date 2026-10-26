import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { brand } from "@/lib/brand";
import { buildManifest } from "@/lib/pwa-manifest";
import { getPwaColors } from "@/lib/pwa-tokens";
import { renderOfflinePage } from "@/sw/offline";

const root = process.cwd();

function readToken(name: string): string {
  const css = readFileSync(join(root, "src/styles/globals.css"), "utf8");
  const match = css.match(new RegExp(`${name}\\s*:\\s*(#[0-9a-fA-F]{3,8})`));
  if (!match) throw new Error(`missing ${name}`);
  return match[1];
}

describe("PWA: the per-locale manifest", () => {
  it("UT-PWA-01 uses the brand name, short name and description", () => {
    for (const locale of ["ar", "en"] as const) {
      const manifest = buildManifest(locale);
      expect(manifest.name).toBe(brand.name[locale]);
      expect(manifest.short_name).toBe(brand.shortName[locale]);
      expect(manifest.description).toBe(brand.description[locale]);
      expect(manifest.short_name.length).toBeLessThanOrEqual(12);
    }
  });

  it("UT-PWA-02 sets language, direction and app scope per locale", () => {
    const ar = buildManifest("ar");
    const en = buildManifest("en");

    expect(ar.lang).toBe("ar");
    expect(ar.dir).toBe("rtl");
    expect(en.lang).toBe("en");
    expect(en.dir).toBe("ltr");
    expect(ar.start_url).toBe("/ar?source=pwa");
    expect(en.start_url).toBe("/en?source=pwa");
    expect(ar.id).toBe("/");
    expect(ar.scope).toBe("/");
    expect(ar.display).toBe("standalone");
    expect(ar.orientation).toBe("any");
  });

  it("UT-PWA-03 keeps theme and background colours on the design tokens", () => {
    const manifest = buildManifest("ar");
    const colors = getPwaColors();

    expect(manifest.background_color.toUpperCase()).toBe(readToken("--bg-splash").toUpperCase());
    expect(manifest.theme_color.toUpperCase()).toBe(readToken("--bg").toUpperCase());
    expect(colors.bg).toBe(readToken("--bg"));
  });

  it("UT-PWA-04 declares versioned 192, 512 and maskable icons", () => {
    const manifest = buildManifest("ar");
    const sizes = manifest.icons.map((icon) => icon.sizes);

    expect(sizes).toEqual(["192x192", "512x512", "512x512"]);
    expect(manifest.icons.some((icon) => icon.purpose === "maskable")).toBe(true);
    expect(manifest.icons.every((icon) => icon.type === "image/png")).toBe(true);
    expect(manifest.icons.every((icon) => icon.src.includes("?v="))).toBe(true);
  });

  it("UT-PWA-05 links the three shortcuts to localized routes", () => {
    const manifest = buildManifest("en");

    expect(manifest.shortcuts.map((shortcut) => shortcut.url)).toEqual([
      "/en/menu",
      "/en/cart",
      "/en/orders",
    ]);
    expect(manifest.shortcuts.every((shortcut) => shortcut.icons[0].sizes === "96x96")).toBe(true);
    expect(manifest.screenshots).toBeUndefined();
  });
});

describe("PWA: generated assets", () => {
  it("UT-PWA-06 ships the icon set referenced by the manifest", () => {
    const manifest = buildManifest("ar");
    for (const icon of manifest.icons) {
      const path = join(root, "public", icon.src.split("?")[0]);
      expect(existsSync(path), path).toBe(true);
    }
    expect(existsSync(join(root, "public/icons/apple-touch-icon.png"))).toBe(true);
    expect(existsSync(join(root, "public/icons/favicon.ico"))).toBe(true);
  });

  it("UT-PWA-07 writes a multi-resolution favicon.ico", () => {
    const ico = readFileSync(join(root, "public/icons/favicon.ico"));
    expect(ico.readUInt16LE(0)).toBe(0);
    expect(ico.readUInt16LE(2)).toBe(1);
    expect(ico.readUInt16LE(4)).toBe(3);
  });
});

describe("PWA: the offline page", () => {
  const theme = getPwaColors();

  it("UT-PWA-08 renders Arabic right-to-left without external requests", () => {
    const html = renderOfflinePage("ar", theme);

    expect(html.toLowerCase()).toContain("<!doctype html>");
    expect(html).toContain('lang="ar"');
    expect(html).toContain('dir="rtl"');
    expect(html).toContain(brand.logo.ar);
    expect(html).not.toContain("<script src");
    expect(html).not.toMatch(/https?:\/\//);
  });

  it("UT-PWA-09 renders the English offline copy", () => {
    const html = renderOfflinePage("en", theme);

    expect(html).toContain('lang="en"');
    expect(html).toContain('dir="ltr"');
    expect(html).toContain("You are offline");
  });
});
