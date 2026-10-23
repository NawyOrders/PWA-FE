import { describe, expect, it } from "vitest";
import { fc, fcOptions } from "../../tests/utils/fc";
import { normalize, normalizeTokens } from "./text";

const DIACRITICS = /[\u064B-\u0652\u0670\u06D6-\u06DC\u06DF-\u06E8\u06EA-\u06ED]/;
const TATWEEL = "\u0640";

describe("property: normalize (Arabic)", () => {
  it("UT-NORM-P1 is idempotent", () => {
    fc.assert(
      fc.property(fc.string(), (value) => {
        const once = normalize(value);
        expect(normalize(once)).toBe(once);
      }),
      fcOptions,
    );
  });

  it("UT-NORM-P2 never returns a longer string than the input", () => {
    fc.assert(
      fc.property(fc.string(), (value) => {
        expect(normalize(value).length).toBeLessThanOrEqual(value.length);
      }),
      fcOptions,
    );
  });

  it("UT-NORM-P3 removes the diacritics and the tatweel", () => {
    fc.assert(
      fc.property(fc.string(), (value) => {
        const output = normalize(value);

        expect(output).not.toMatch(DIACRITICS);
        expect(output).not.toContain(TATWEEL);
      }),
      fcOptions,
    );
  });

  it("UT-NORM-P4 splits into tokens that are all part of the normalized text", () => {
    fc.assert(
      fc.property(fc.string(), (value) => {
        const tokens = normalizeTokens(value);
        const normalized = normalize(value);

        expect(tokens.length).toBeGreaterThanOrEqual(0);
        for (const token of tokens) {
          expect(normalized).toContain(token);
          expect(token).not.toMatch(DIACRITICS);
        }
      }),
      fcOptions,
    );
  });
});
