import { describe, expect, it } from "vitest";
import { normalizeDigits, toAsciiDigits } from "./digits";
import {
  ARABIC_INDIC_DIGITS,
  EXTENDED_ARABIC_INDIC_DIGITS,
} from "../../tests/data/arabic-pool";

describe("normalizeDigits", () => {
  it("UT-DIGITS-01 converts Arabic-Indic digits to Latin digits", () => {
    expect(normalizeDigits(ARABIC_INDIC_DIGITS)).toBe("010123456789");
  });

  it("UT-DIGITS-02 converts the extended Arabic-Indic digits", () => {
    expect(normalizeDigits(EXTENDED_ARABIC_INDIC_DIGITS)).toBe("0123456789");
  });

  it("UT-DIGITS-03 keeps Latin digits untouched", () => {
    expect(normalizeDigits("01012345678")).toBe("01012345678");
  });

  it("UT-DIGITS-04 keeps the other characters untouched", () => {
    expect(normalizeDigits("منزل ٢ شقة ٣")).toBe("منزل 2 شقة 3");
  });

  it("UT-DIGITS-05 returns an empty string unchanged", () => {
    expect(normalizeDigits("")).toBe("");
  });
});

describe("toAsciiDigits", () => {
  it("UT-DIGITS-06 strips every non-digit character", () => {
    expect(toAsciiDigits("+20 (010) 123-4567")).toBe("200101234567");
  });

  it("UT-DIGITS-07 converts Arabic-Indic digits and strips the rest", () => {
    expect(toAsciiDigits("٠١٠١٢٣٤٥٦٧٨")).toBe("01012345678");
  });

  it("UT-DIGITS-08 returns an empty string when there is no digit", () => {
    expect(toAsciiDigits("abc")).toBe("");
  });

  it("UT-DIGITS-09 keeps the digit order", () => {
    expect(toAsciiDigits("1a2b3")).toBe("123");
  });
});
