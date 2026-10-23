import { describe, expect, it } from "vitest";
import { fc, fcOptions } from "../../tests/utils/fc";
import { normalizeDigits, toAsciiDigits } from "./digits";

const ARABIC_INDIC_DIGITS = ["\u0660", "\u0661", "\u0662", "\u0663", "\u0664", "\u0665", "\u0666", "\u0667", "\u0668", "\u0669"];

/** The phone rule of the app: ten digits, no separators. */
function canonicalPhone(value: string): string {
  return toAsciiDigits(value).slice(0, 10);
}

describe("property: the phone number", () => {
  it("UT-PHONE-P1 strips spaces, dashes and Arabic-Indic digits to the same value", () => {
    fc.assert(
      fc.property(
        fc.array(fc.integer({ min: 0, max: 9 }), { minLength: 10, maxLength: 10 }),
        fc.array(fc.constantFrom(" ", "-", "\u2013", "\u00A0"), { maxLength: 6 }),
        (digits, separators) => {
          const canonical = digits.join("");
          const noisy = digits
            .map((digit, index) => {
              const separator = separators[index % (separators.length + 1)];
              const arabic = ARABIC_INDIC_DIGITS[digit];
              return `${separator ?? ""}${index % 2 === 0 ? arabic : digit}`;
            })
            .join("");

          expect(canonicalPhone(noisy)).toBe(canonical);
        },
      ),
      fcOptions,
    );
  });

  it("UT-PHONE-P2 never throws and never returns a non-digit", () => {
    fc.assert(
      fc.property(fc.string(), (value) => {
        const result = toAsciiDigits(value);

        expect(result).toMatch(/^[0-9]*$/);
        expect(result.length).toBeLessThanOrEqual(value.length);
      }),
      fcOptions,
    );
  });

  it("UT-PHONE-P3 converts the Arabic-Indic digits to the Latin ones", () => {
    fc.assert(
      fc.property(
        fc.array(fc.integer({ min: 0, max: 9 }), { minLength: 1, maxLength: 10 }),
        (digits) => {
          const arabic = digits.map((digit) => ARABIC_INDIC_DIGITS[digit]).join("");

          expect(normalizeDigits(arabic)).toBe(digits.join(""));
        },
      ),
      fcOptions,
    );
  });

  it("UT-PHONE-P4 keeps a valid number of ten digits valid", () => {
    fc.assert(
      fc.property(
        fc.array(fc.integer({ min: 0, max: 9 }), { minLength: 10, maxLength: 10 }),
        (digits) => {
          const canonical = canonicalPhone(digits.join(""));

          expect(canonical).toHaveLength(10);
          expect(canonical).toMatch(/^\d{10}$/);
        },
      ),
      fcOptions,
    );
  });
});
