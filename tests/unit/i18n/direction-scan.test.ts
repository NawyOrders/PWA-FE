import { describe, expect, it } from "vitest";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

/**
 * Static scan for physical direction classes (TESTING.md section 8.4).
 *
 * The app must be written with logical utilities (`ps-`, `pe-`, `ms-`, `me-`,
 * `start-`, `end-`, `rtl:` variants) so a single class works in both readings.
 * Every entry of the allowlist needs a reason in the pull request.
 */
const ROOT = join(process.cwd(), "src");

/** file → reason why a physical class is acceptable there. */
const allowlist: Record<string, string> = {};

const CLASS_TOKEN = /[A-Za-z0-9:/_.%#[\]!()-]+/g;

const PHYSICAL_PATTERNS: RegExp[] = [
  /^-?m[lr]-/,
  /^-?p[lr]-/,
  /^-?(left|right)-/,
  /^-?text-(left|right)$/,
  /^-?rounded-[lr](-|$)/,
  /^-?border-[lr](-|$)/,
  /^-?divide-[lr](-|$)/,
  /^-?space-[lr](-|$)/,
];

function isPhysicalClass(token: string): boolean {
  return PHYSICAL_PATTERNS.some((pattern) => pattern.test(token));
}

function collectSources(directory: string, files: string[] = []): string[] {
  for (const entry of readdirSync(directory)) {
    const fullPath = join(directory, entry);
    if (statSync(fullPath).isDirectory()) {
      collectSources(fullPath, files);
    } else if (/\.(ts|tsx)$/.test(entry)) {
      files.push(fullPath);
    }
  }
  return files;
}

describe("direction: static scan", () => {
  const sources = collectSources(ROOT);

  it("UT-RTL-01 scans every TypeScript file under src", () => {
    expect(sources.length).toBeGreaterThan(100);
  });

  it("UT-RTL-02 never uses a physical left or right class", () => {
    const failures: string[] = [];

    for (const file of sources) {
      const relativePath = relative(process.cwd(), file);
      if (relativePath in allowlist) continue;

      const content = readFileSync(file, "utf8");
      const tokens = content.match(CLASS_TOKEN) ?? [];
      const physical = [...new Set(tokens.filter(isPhysicalClass))];

      if (physical.length > 0) {
        failures.push(`${relativePath}: ${physical.join(", ")}`);
      }
    }

    expect(failures).toEqual([]);
  });
});
