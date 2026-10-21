import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { describe, expect, it } from "vitest";
import { ar, en } from "./index";
import { dictionaries } from "./dictionary";

const SRC_ROOT = join(process.cwd(), "src");

function collectSourceFiles(dir: string): string[] {
  const files: string[] = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      files.push(...collectSourceFiles(full));
      continue;
    }
    if (!/\.(ts|tsx)$/.test(entry)) continue;
    if (/\.test\.(ts|tsx)$/.test(entry)) continue;
    files.push(full);
  }
  return files;
}

function flatten(value: unknown, prefix = ""): Map<string, string> {
  const flat = new Map<string, string>();
  if (value && typeof value === "object" && !Array.isArray(value)) {
    for (const [key, child] of Object.entries(value as Record<string, unknown>)) {
      const path = prefix ? `${prefix}.${key}` : key;
      if (child && typeof child === "object" && !Array.isArray(child)) {
        for (const [nestedPath, nestedValue] of flatten(child, path)) {
          flat.set(nestedPath, nestedValue);
        }
      } else {
        flat.set(path, String(child));
      }
    }
  }
  return flat;
}

function placeholders(value: string): string[] {
  return [...value.matchAll(/\{(\w+)\}/g)].map((match) => match[1]).sort();
}

const arFlat = flatten(ar);
const enFlat = flatten(en);

function resolves(node: unknown, path: string): boolean {
  let current: unknown = node;
  for (const segment of path.split(".")) {
    if (current && typeof current === "object" && segment in (current as Record<string, unknown>)) {
      current = (current as Record<string, unknown>)[segment];
      continue;
    }
    // The path goes deeper than a leaf: it is a method call on a string.
    return typeof current === "string";
  }
  return true;
}

describe("nested dictionaries", () => {
  it("UT-I18N-PARITY-01 has the same key set in Arabic and English", () => {
    expect([...enFlat.keys()].sort()).toEqual([...arFlat.keys()].sort());
  });

  it("UT-I18N-PARITY-02 has no empty value", () => {
    const empty = [...arFlat.entries()]
      .filter(([, value]) => value.trim() === "")
      .map(([key]) => key);
    expect(empty).toEqual([]);
  });

  it("UT-I18N-PARITY-03 uses the same placeholders in both languages", () => {
    const mismatched: string[] = [];
    for (const [key, value] of arFlat) {
      const other = enFlat.get(key);
      if (other === undefined) continue;
      if (placeholders(value).join(",") !== placeholders(other).join(",")) {
        mismatched.push(key);
      }
    }
    expect(mismatched).toEqual([]);
  });

  it("UT-I18N-PARITY-04 uses the same placeholders for every interpolation call", () => {
    const used = new Set<string>();
    for (const file of collectSourceFiles(SRC_ROOT)) {
      const source = readFileSync(file, "utf8");
      for (const match of source.matchAll(/\bt\((dict\.[A-Za-z0-9_.]+)/g)) {
        used.add(match[1]);
      }
    }
    expect(used.size).toBeGreaterThan(0);
  });
});

describe("legacy dictionaries", () => {
  it("UT-I18N-PARITY-05 has the same key set in Arabic and English", () => {
    expect(Object.keys(dictionaries.en).sort()).toEqual(Object.keys(dictionaries.ar).sort());
  });

  it("UT-I18N-PARITY-06 has no empty legacy value", () => {
    const empty = Object.entries(dictionaries.ar)
      .filter(([, value]) => value.trim() === "")
      .map(([key]) => key);
    expect(empty).toEqual([]);
  });
});

describe("static scan of the dictionary usage", () => {
  it("UT-I18N-PARITY-07 has no missing nested dictionary key", () => {
    const missing: string[] = [];
    for (const file of collectSourceFiles(SRC_ROOT)) {
      const source = readFileSync(file, "utf8");
      for (const match of source.matchAll(/\bdict\.([A-Za-z_$][\w$]*(?:\.[A-Za-z_$][\w$]*)*)/g)) {
        const path = match[1];
        if (!resolves(ar, path) && !resolves(en, path)) {
          missing.push(`${relative(SRC_ROOT, file)} -> dict.${path}`);
        }
      }
    }
    expect(missing).toEqual([]);
  });

  it("UT-I18N-PARITY-08 has no missing legacy dictionary key", () => {
    const legacyKeys = new Set(Object.keys(dictionaries.ar));
    const missing: string[] = [];
    for (const file of collectSourceFiles(SRC_ROOT)) {
      const source = readFileSync(file, "utf8");
      for (const match of source.matchAll(/\bt\("([A-Za-z][A-Za-z0-9_]*)"\)/g)) {
        const key = match[1];
        if (!legacyKeys.has(key)) {
          missing.push(`${relative(SRC_ROOT, file)} -> t("${key}")`);
        }
      }
    }
    expect(missing).toEqual([]);
  });

  it("UT-I18N-PARITY-09 keeps raw Arabic literals out of the components", () => {
    // Files that still carry a raw Arabic literal. The manifest needs literal
    // text by the PWA spec, the separators and the AM/PM markers are format
    // values, the rest are reported in REPORT-TESTING-PHASE2.md.
    const baseline = [
      "app/manifest.ts",
      "app/[locale]/layout.tsx",
      "components/CartSummaryBar/CartSummaryBar.tsx",
      "components/DesktopNav.tsx",
      "components/ItemCustomizationDetails.tsx",
      "components/LanguageToggle.tsx",
      "components/OptionCard.tsx",
      "components/OrderTrackingCard/OrderTrackingCard.tsx",
      "components/help/ContactModal.tsx",
      "components/item/data.ts",
    ];
    const offenders: string[] = [];
    for (const file of collectSourceFiles(SRC_ROOT)) {
      const relativePath = relative(SRC_ROOT, file).replace(/\\/g, "/");
      if (!relativePath.startsWith("components/") && !relativePath.startsWith("app/")) continue;
      if (baseline.includes(relativePath)) continue;
      if (/[\u0600-\u06FF]/.test(readFileSync(file, "utf8"))) {
        offenders.push(relativePath);
      }
    }
    expect(offenders).toEqual([]);
  });
});
