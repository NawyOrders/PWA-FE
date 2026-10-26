import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();
const SRC_ROOT = join(ROOT, "src");
const TOKEN_FILE = join(SRC_ROOT, "styles", "globals.css");
const DESIGN_FILE = join(ROOT, "DESIGN.md");

// Tokens added by the v2.x screen intakes (DESIGN.md 12.1, 12.5, 12.6, 12.8, 12.9).
const V2X_TOKENS = [
  "--surface-soft",
  "--hint-amber",
  "--hint-amber-text",
  "--tint-peach",
  "--star-off",
  "--coral",
  "--bubble-end",
  "--header-h",
];

// Files that still carry hardcoded hex colors. They are legacy marketing
// surfaces that predate the token file; each one is reported in
// REPORT-TESTING-PHASE2.md. The scan fails on any new offender.
const HEX_BASELINE = [
  "app/[locale]/address/address.css",
  "app/[locale]/delivery/delivery.css",
  "app/[locale]/item/item.css",
  "app/[locale]/layout.tsx",
  "app/[locale]/payConfirmation/payConfirmation.css",
  "app/[locale]/payment/payment.css",
  "app/[locale]/restLocation/restLocation.css",
  "app/[locale]/tracking/tracking.css",
  "components/aboutNawyOrders/aboutNawyOrders.css",
  "components/aboutRestaurant/aboutRestaurant.css",
  "components/aboutSpaceTech/aboutSpaceTech.css",
  "components/address/MapView.tsx",
  "components/item/data.ts",
  "components/CartSummaryBar/CartSummaryBar.css",
  "components/CartSummaryBar/CartSummaryBar.tsx",
  "components/OrderTrackingCard/OrderTrackingCard.css",
  "components/OrderTrackingCard/OrderTrackingCard.tsx",
  "components/privacyPolicy/privacyPolicy.css",
  "styles/motion.css",
];

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

function readTokens(file: string): Set<string> {
  const source = readFileSync(file, "utf8");
  return new Set([...source.matchAll(/(--[a-z0-9-]+)\s*:/g)].map((match) => match[1]));
}

function readDesignTokens(): Set<string> {
  const design = readFileSync(DESIGN_FILE, "utf8");
  const start = design.indexOf("### 3.1 Colors");
  const end = design.indexOf("### 3.2", start);
  const section = design.slice(start, end === -1 ? undefined : end);
  return new Set([...section.matchAll(/`(--[a-z0-9-]+)`/g)].map((match) => match[1]));
}

describe("design tokens", () => {
  it("UT-TOKEN-01 defines every color token of DESIGN.md section 3.1", () => {
    const tokens = readTokens(TOKEN_FILE);
    const missing = [...readDesignTokens()].filter((token) => !tokens.has(token));
    expect(missing).toEqual([]);
  });

  it("UT-TOKEN-02 defines every token added by the v2.x screen intakes", () => {
    const tokens = readTokens(TOKEN_FILE);
    const missing = V2X_TOKENS.filter((token) => !tokens.has(token));
    expect(missing).toEqual([]);
  });

  it("UT-TOKEN-03 defines the header height token with a responsive value", () => {
    const source = readFileSync(TOKEN_FILE, "utf8");
    expect(source).toMatch(/--header-h:\s*64px/);
    expect(source).toMatch(/@media \(min-width: 1024px\)[\s\S]*--header-h:\s*72px/);
  });

  it("UT-TOKEN-04 keeps hex colors out of the component files", () => {
    const offenders: string[] = [];
    for (const file of collectSourceFiles(SRC_ROOT)) {
      const relativePath = relative(SRC_ROOT, file).replace(/\\/g, "/");
      if (relativePath === "styles/globals.css") continue;
      if (HEX_BASELINE.includes(relativePath)) continue;
      if (/#[0-9a-fA-F]{3,8}\b/.test(readFileSync(file, "utf8"))) {
        offenders.push(relativePath);
      }
    }
    expect(offenders).toEqual([]);
  });

  it("UT-TOKEN-05 uses the token colors in the web app manifest", () => {
    const manifest = readFileSync(join(SRC_ROOT, "app", "manifest.ts"), "utf8");
    const tokens = readFileSync(TOKEN_FILE, "utf8");
    const theme = tokens.match(/--primary:\s*(#[0-9a-fA-F]{6})/)?.[1];
    const splash = tokens.match(/--bg-splash:\s*(#[0-9a-fA-F]{6})/)?.[1];
    expect(theme).toBeDefined();
    expect(splash).toBeDefined();
    expect(manifest.toLowerCase()).toContain(theme!.toLowerCase());
    expect(manifest.toLowerCase()).toContain(splash!.toLowerCase());
  });
});
