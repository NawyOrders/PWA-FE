import { expect } from "vitest";
import { axe } from "vitest-axe";
import type { AxeResults } from "axe-core";

/**
 * Rules that cannot be judged in jsdom and are covered by the Playwright
 * a11y phase (TESTING.md section 8.3) in a real browser:
 *
 * - `color-contrast`: jsdom has no layout and no real text rendering.
 * - `region`: a rule for the whole page, not for a rendered fragment.
 */
const jsdomOnlyRules = {
  "color-contrast": { enabled: false },
  region: { enabled: false },
};

export interface AxeSummary {
  violations: string[];
  incomplete: string[];
  passes: number;
}

/** Runs `axe-core` on a rendered container and returns the raw results. */
export async function runAxe(container: Element): Promise<AxeResults> {
  return axe(container, { rules: jsdomOnlyRules });
}

/**
 * Runs `axe-core` on a rendered container and asserts that no violation was
 * found. Returns a short summary so a test can assert on the result.
 */
export async function expectNoAxeViolations(container: Element): Promise<AxeSummary> {
  const results = await runAxe(container);

  expect(results).toHaveNoViolations();

  return {
    violations: results.violations.map((violation) => violation.id),
    incomplete: results.incomplete.map((violation) => violation.id),
    passes: results.passes.length,
  };
}
