import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * Contrast from the design tokens (TESTING.md section 8.3).
 *
 * The ratio is computed from `src/styles/globals.css`, so every token change
 * is re-evaluated immediately. Body text must reach 4.5:1, large text and
 * graphics 3:1.
 *
 * Two lists are kept:
 * - `pairs`: meets the limit today, asserted as a hard requirement.
 * - `documentedFindings`: below the limit today. The measured value is
 *   asserted, so the palette cannot drift silently; the findings are reported
 *   to the owner with the phase report. A pair leaves the list as soon as the
 *   token is corrected.
 */
const CSS = readFileSync(join(process.cwd(), "src/styles/globals.css"), "utf8");

function composite(foreground: [number, number, number, number], base: string): string {
  const [r, g, b, alpha] = foreground;
  const clean = base.replace("#", "");
  const br = Number.parseInt(clean.slice(0, 2), 16);
  const bg = Number.parseInt(clean.slice(2, 4), 16);
  const bb = Number.parseInt(clean.slice(4, 6), 16);
  const mix = (channel: number, back: number) => Math.round(channel * alpha + back * (1 - alpha));

  return `#${[mix(r, br), mix(g, bg), mix(b, bb)]
    .map((value) => value.toString(16).padStart(2, "0"))
    .join("")}`;
}

const tokens: Record<string, string> = {};
for (const match of CSS.matchAll(/(--[a-z0-9-]+):\s*(#[0-9a-fA-F]{3,6})\s*;/g)) {
  tokens[match[1]] = match[2];
}
for (const match of CSS.matchAll(
  /(--[a-z0-9-]+):\s*rgba\((\d+),\s*(\d+),\s*([\d.]+),\s*([\d.]+)\)\s*;/g,
)) {
  // Translucent tokens are evaluated over the white surface.
  tokens[match[1]] = composite(
    [Number(match[2]), Number(match[3]), Number(match[4]), Number(match[5])],
    tokens["--surface"] ?? "#ffffff",
  );
}

function channel(value: number): number {
  const v = value / 255;
  return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
}

function luminance(hex: string): number {
  const clean = hex.replace("#", "");
  const full = clean.length === 3 ? [...clean].map((char) => char + char).join("") : clean;
  const r = Number.parseInt(full.slice(0, 2), 16);
  const g = Number.parseInt(full.slice(2, 4), 16);
  const b = Number.parseInt(full.slice(4, 6), 16);

  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

export function contrast(fg: string, bg: string): number {
  const a = luminance(fg);
  const b = luminance(bg);
  const [hi, lo] = a > b ? [a, b] : [b, a];

  return (hi + 0.05) / (lo + 0.05);
}

const BODY = 4.5;
const LARGE = 3;

interface Pair {
  fg: string;
  bg: string;
  min: number;
}

/** Text and background token pairs that the app renders and that pass today. */
const pairs: Pair[] = [
  { fg: "--text", bg: "--bg", min: BODY },
  { fg: "--text", bg: "--surface", min: BODY },
  { fg: "--text", bg: "--cream", min: BODY },
  { fg: "--text", bg: "--cream-100", min: BODY },
  { fg: "--text-muted", bg: "--bg", min: BODY },
  { fg: "--text-muted", bg: "--surface", min: BODY },
  { fg: "--text-muted", bg: "--surface-soft", min: BODY },
  { fg: "--text-muted", bg: "--cream", min: BODY },
  { fg: "--text-muted", bg: "--cream-100", min: BODY },
  { fg: "--text-muted", bg: "--surface-muted", min: BODY },
  { fg: "--text-secondary", bg: "--surface", min: BODY },
  { fg: "--text-primary", bg: "--surface", min: BODY },
  { fg: "--text-primary", bg: "--cream-100", min: BODY },
  { fg: "--hint-amber-text", bg: "--bg", min: BODY },
  { fg: "--hint-amber-text", bg: "--surface", min: BODY },
  { fg: "--hint-amber-text", bg: "--tint-peach", min: BODY },
  { fg: "--danger-strong", bg: "--surface", min: BODY },
  { fg: "--danger-strong", bg: "--danger-bg", min: BODY },
  { fg: "--surface", bg: "--primary-dark", min: BODY },
  { fg: "--surface", bg: "--danger-strong", min: BODY },
  { fg: "--surface", bg: "--navy", min: BODY },
  { fg: "--navy", bg: "--bg", min: BODY },
  { fg: "--ink", bg: "--bg", min: BODY },
  { fg: "--star-off", bg: "--surface", min: LARGE },
  { fg: "--star-off", bg: "--bg", min: LARGE },
  { fg: "--star-off", bg: "--surface-soft", min: LARGE },
  { fg: "--drawer-edge", bg: "--surface", min: LARGE },
];

interface Finding extends Pair {
  measured: number;
  used: string;
}

/** Required by the rule but below the limit with the tokens of today. */
const documentedFindings: Finding[] = [
  { fg: "--text-secondary", bg: "--bg", min: BODY, measured: 4.38, used: "body text on the page background" },
  { fg: "--text-secondary", bg: "--cream", min: BODY, measured: 4.34, used: "body text on cream sections" },
  { fg: "--danger", bg: "--surface", min: BODY, measured: 3.76, used: "validation messages on white" },
  { fg: "--danger", bg: "--danger-bg", min: BODY, measured: 3.29, used: "error banner text" },
  { fg: "--success", bg: "--surface", min: BODY, measured: 3.3, used: "success text on white" },
  { fg: "--success", bg: "--success-bg", min: BODY, measured: 3.06, used: "success banner text" },
  { fg: "--primary", bg: "--surface", min: BODY, measured: 4.3, used: "primary labels on white" },
  { fg: "--primary", bg: "--bg", min: BODY, measured: 4.08, used: "primary labels on the page background" },
  { fg: "--primary", bg: "--cream", min: BODY, measured: 4.04, used: "primary labels on cream" },
  { fg: "--primary", bg: "--primary-tint", min: BODY, measured: 3.73, used: "active category badge" },
  { fg: "--surface", bg: "--primary", min: BODY, measured: 4.3, used: "white CTA text on the brand colour" },
  { fg: "--surface", bg: "--bubble-end", min: BODY, measured: 3.77, used: "outgoing chat bubble at the gradient end" },
  { fg: "--surface", bg: "--primary-light", min: BODY, measured: 2.35, used: "white CTA text at the gradient end" },
  { fg: "--ring-inactive", bg: "--surface", min: LARGE, measured: 1.98, used: "inactive carousel and status dots" },
  { fg: "--line", bg: "--surface", min: LARGE, measured: 1.31, used: "input and divider boundaries" },
  { fg: "--border", bg: "--surface", min: LARGE, measured: 1.32, used: "component borders" },
];

describe("contrast: the tokens", () => {
  it("UT-A11Y-01 reads every colour token from the stylesheet", () => {
    expect(Object.keys(tokens).length).toBeGreaterThan(30);
    expect(tokens["--bg"]).toBe("#fff8f1");
    expect(tokens["--hint-amber-text"]).toBe("#9a5b13");
    expect(tokens["--star-off"]).toBe("#8e8e8e");
    expect(tokens["--bubble-end"]).toBe("#ec4a24");
    expect(tokens["--primary-tint"]).toMatch(/^#[0-9a-f]{6}$/);
  });

  for (const pair of pairs) {
    it(`UT-A11Y-02 ${pair.fg} on ${pair.bg} reaches ${pair.min}:1`, () => {
      const fg = tokens[pair.fg];
      const bg = tokens[pair.bg];

      expect(fg, `missing token ${pair.fg}`).toBeDefined();
      expect(bg, `missing token ${pair.bg}`).toBeDefined();

      const ratio = contrast(fg, bg);

      expect(
        Number(ratio.toFixed(2)),
        `${pair.fg} on ${pair.bg} is ${ratio.toFixed(2)}:1 and needs ${pair.min}:1`,
      ).toBeGreaterThanOrEqual(pair.min);
    });
  }

  for (const finding of documentedFindings) {
    it(`UT-A11Y-03 ${finding.fg} on ${finding.bg} is still ${finding.measured}:1 (below ${finding.min}:1)`, () => {
      const fg = tokens[finding.fg];
      const bg = tokens[finding.bg];

      expect(fg, `missing token ${finding.fg}`).toBeDefined();
      expect(bg, `missing token ${finding.bg}`).toBeDefined();

      const ratio = Number(contrast(fg, bg).toFixed(2));

      // The measured value is pinned: a token change has to be acknowledged by
      // updating this record (and reported to the owner).
      expect(
        ratio,
        `${finding.fg} on ${finding.bg} is now ${ratio}:1 (${finding.used}); update the record`,
      ).toBe(finding.measured);

      expect(
        ratio,
        `${finding.fg} on ${finding.bg} now reaches the limit: move the pair to the required list`,
      ).toBeLessThan(finding.min);
    });
  }

  it("UT-A11Y-04 guards the tokens that the design names explicitly", () => {
    const covered = [...pairs, ...documentedFindings].map((pair) => `${pair.fg}/${pair.bg}`);

    expect(covered).toContain("--hint-amber-text/--bg");
    expect(covered).toContain("--star-off/--surface");
    expect(covered).toContain("--surface/--bubble-end");
    expect(documentedFindings.every((finding) => finding.measured < finding.min)).toBe(true);
  });
});
