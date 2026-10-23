import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { describe, expect, it } from "vitest";
import { brand } from "./brand";

const SRC_ROOT = join(process.cwd(), "src");
const BRAND_FILE = join(SRC_ROOT, "lib", "brand.ts");

function collectSourceFiles(dir: string): string[] {
  const files: string[] = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      files.push(...collectSourceFiles(full));
      continue;
    }
    if (!/\.(ts|tsx|css)$/.test(entry)) continue;
    if (/\.test\.(ts|tsx)$/.test(entry)) continue;
    files.push(full);
  }
  return files;
}

describe("brand config", () => {
  it("UT-BRAND-01 exposes the localized brand name", () => {
    expect(brand.name.ar).toBe("كرم الشام");
    expect(brand.name.en).toBe("Karam El Sham");
  });

  it("UT-BRAND-02 exposes a demo phone number in E.164 format", () => {
    expect(brand.support.phone).toMatch(/^\+201[0125]\d{8}$/);
  });

  it("UT-BRAND-03 builds a dialable tel link from the phone number", () => {
    expect(`tel:${brand.support.phone}`).toBe("tel:+201000000000");
  });

  it("UT-BRAND-04 exposes the same digits in the WhatsApp link", () => {
    expect(brand.support.whatsapp).toBe(`https://wa.me/${brand.support.phone.replace("+", "")}`);
  });

  it("UT-BRAND-05 exposes a brand email on the brand domain", () => {
    expect(brand.support.email).toMatch(/^[\w.+-]+@nawyorders\.com$/);
  });

  it("UT-BRAND-06 exposes social links on https", () => {
    for (const link of Object.values(brand.social)) {
      expect(link.startsWith("https://")).toBe(true);
    }
  });

  it("UT-BRAND-07 keeps the support hours inside a single day", () => {
    expect(brand.support.hours.opensAt).toBeLessThan(brand.support.hours.closesAt);
    expect(brand.support.hours.opensAt).toBeGreaterThanOrEqual(0);
    expect(brand.support.hours.closesAt).toBeLessThanOrEqual(24 * 60);
  });

  it("UT-BRAND-08 uses valid week days", () => {
    for (const day of brand.support.hours.days) {
      expect(day).toBeGreaterThanOrEqual(0);
      expect(day).toBeLessThanOrEqual(6);
    }
  });

  it("UT-BRAND-09 has no hardcoded contact data outside the config", () => {
    const values = [
      brand.support.phone,
      brand.support.phoneDisplay,
      brand.support.email,
      brand.support.whatsapp,
      brand.support.whatsapp.replace("https://wa.me/", ""),
    ];
    const offenders: string[] = [];
    for (const file of collectSourceFiles(SRC_ROOT)) {
      if (file === BRAND_FILE) continue;
      const source = readFileSync(file, "utf8");
      if (values.some((value) => value.length > 3 && source.includes(value))) {
        offenders.push(relative(SRC_ROOT, file));
      }
    }
    expect(offenders).toEqual([]);
  });
});
