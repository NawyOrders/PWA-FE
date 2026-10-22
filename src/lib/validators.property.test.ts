import { describe, expect, it } from "vitest";
import { fc, fcOptions } from "../../tests/utils/fc";
import {
  DISPLAY_NAME_MAX_LENGTH,
  DISPLAY_NAME_MIN_LENGTH,
  normalizeDisplayName,
  validateDisplayName,
} from "./validators";

/** Latin letters, Arabic letters, spaces and hyphens. */
const NAME_CHARS = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ\u0621\u0623\u0625\u0627\u0628\u0629\u062D\u062F\u0631\u0633\u0634\u0639\u063A\u0644\u0645\u0646\u0647\u0648\u064A -";

const nameArb = fc
  .array(fc.constantFrom(...NAME_CHARS.split("")), { minLength: 2, maxLength: 20 })
  .map((chars) => chars.join(""));

describe("property: validateDisplayName", () => {
  it("UT-NAME-P1 accepts every name of 2 to 40 letters and spaces", () => {
    fc.assert(
      fc.property(nameArb, (value) => {
        const trimmed = value.trim();
        if (trimmed.length < DISPLAY_NAME_MIN_LENGTH || trimmed.length > DISPLAY_NAME_MAX_LENGTH) {
          return;
        }
        expect(validateDisplayName(value)).toBeNull();
      }),
      fcOptions,
    );
  });

  it("UT-NAME-P2 rejects every name that contains a digit", () => {
    fc.assert(
      fc.property(
        nameArb,
        fc.integer({ min: 0, max: 9 }),
        (value, digit) => {
          const withDigit = `${value}${digit}`;
          expect(validateDisplayName(withDigit)).toBe("letters");
        },
      ),
      fcOptions,
    );
  });

  it("UT-NAME-P3 rejects a name that is too short or too long", () => {
    fc.assert(
      fc.property(
        fc.array(fc.constantFrom(...NAME_CHARS.split("")), { minLength: 0, maxLength: 60 }).map(
          (chars) => chars.join(""),
        ),
        (value) => {
          const normalized = normalizeDisplayName(value);
          if (normalized.length === 0) {
            expect(validateDisplayName(value)).toBe("required");
          } else if (normalized.length < DISPLAY_NAME_MIN_LENGTH) {
            expect(validateDisplayName(value)).toBe("short");
          } else if (normalized.length > DISPLAY_NAME_MAX_LENGTH) {
            expect(validateDisplayName(value)).toBe("long");
          }
        },
      ),
      fcOptions,
    );
  });

  it("UT-NAME-P4 never throws and always returns a known error", () => {
    fc.assert(
      fc.property(fc.string(), (value) => {
        const result = validateDisplayName(value);

        expect([null, "required", "short", "letters", "long"]).toContain(result);
      }),
      fcOptions,
    );
  });

  it("UT-NAME-P5 removes the zero width characters and the repeated spaces", () => {
    fc.assert(
      fc.property(nameArb, (value) => {
        const noisy = `\u200B${value}\u200D  `;
        const normalized = normalizeDisplayName(noisy);

        expect(normalized).not.toMatch(/[\u200B-\u200D\uFEFF]/);
        expect(normalized).not.toMatch(/\s{2,}/);
        expect(normalized).toBe(normalized.trim());
      }),
      fcOptions,
    );
  });
});
