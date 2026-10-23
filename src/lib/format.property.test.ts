import { describe, expect, it } from "vitest";
import { fc, fcOptions } from "../../tests/utils/fc";
import { formatPrice } from "./format";
import { locales } from "./i18n";

const LATIN_DIGITS = /^[0-9,]+(\.[0-9]{1,2})?$/;
const ARABIC_INDIC = /[\u0660-\u0669\u06F0-\u06F9]/;

describe("property: formatPrice", () => {
  it("UT-PRICE-P1 never throws for a non-negative amount", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 1_000_000_000 }),
        fc.constantFrom(...locales),
        (value, locale) => {
          expect(() => formatPrice(value, locale)).not.toThrow();
        },
      ),
      fcOptions,
    );
  });

  it("UT-PRICE-P2 writes the amount with Latin digits only", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 1_000_000_000 }),
        fc.constantFrom(...locales),
        (value, locale) => {
          const output = formatPrice(value, locale);
          const amount = output.slice(0, output.indexOf(" "));

          expect(amount).toMatch(LATIN_DIGITS);
          expect(output).not.toMatch(ARABIC_INDIC);
        },
      ),
      fcOptions,
    );
  });

  it("UT-PRICE-P3 parses the output back to the original value in pounds", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 1_000_000 }).map((piasters) => piasters * 100),
        fc.constantFrom(...locales),
        (value, locale) => {
          const output = formatPrice(value, locale);
          const pounds = Number(output.slice(0, output.indexOf(" ")).replace(/,/g, ""));

          expect(pounds).toBe(value / 100);
        },
      ),
      fcOptions,
    );
  });

  it("UT-PRICE-P4 never renders a negative amount", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: -1_000_000, max: 0 }),
        fc.constantFrom(...locales),
        (value, locale) => {
          expect(formatPrice(value, locale)).toBe(formatPrice(0, locale));
        },
      ),
      fcOptions,
    );
  });
});
