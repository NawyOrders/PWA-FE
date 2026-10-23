import { describe, expect, it } from "vitest";
import {
  DISPLAY_NAME_MAX_LENGTH,
  DISPLAY_NAME_MIN_LENGTH,
  normalizeDisplayName,
  validateDisplayName,
} from "./validators";
import { ARABIC_NAMES, DIACRITIC_NAMES, MIXED_NAMES, ZERO_WIDTH } from "../../tests/data/arabic-pool";

describe("normalizeDisplayName", () => {
  it("UT-VALID-01 collapses repeated spaces", () => {
    expect(normalizeDisplayName("جميل    جمال")).toBe("جميل جمال");
  });

  it("UT-VALID-02 trims the edges", () => {
    expect(normalizeDisplayName("   Mohamed   ")).toBe("Mohamed");
  });

  it("UT-VALID-03 strips zero-width characters", () => {
    expect(normalizeDisplayName(`جميل${ZERO_WIDTH}جمال`)).toBe("جميلجمال");
  });
});

describe("validateDisplayName", () => {
  it("UT-VALID-04 accepts an Arabic name", () => {
    expect(validateDisplayName("جميل جمال")).toBeNull();
  });

  it("UT-VALID-05 accepts a Latin name with a hyphen and an apostrophe", () => {
    expect(validateDisplayName("Anne-Marie O'Brien")).toBeNull();
  });

  it("UT-VALID-06 reports an empty value as required", () => {
    expect(validateDisplayName("")).toBe("required");
    expect(validateDisplayName("    ")).toBe("required");
  });

  it("UT-VALID-07 reports one character as too short", () => {
    expect(validateDisplayName("a")).toBe("short");
    expect(validateDisplayName("م")).toBe("short");
  });

  it("UT-VALID-08 rejects a name longer than the maximum length", () => {
    const tooLong = "a".repeat(DISPLAY_NAME_MAX_LENGTH + 1);
    expect(validateDisplayName(tooLong)).toBe("long");
  });

  it("UT-VALID-09 accepts a name of exactly the maximum length", () => {
    const exact = "a".repeat(DISPLAY_NAME_MAX_LENGTH);
    expect(validateDisplayName(exact)).toBeNull();
  });

  it("UT-VALID-10 accepts a name of exactly the minimum length", () => {
    expect(validateDisplayName("ab")).toBeNull();
  });

  it("UT-VALID-11 rejects digits", () => {
    expect(validateDisplayName("جميل1")).toBe("letters");
    expect(validateDisplayName("1234")).toBe("letters");
  });

  it("UT-VALID-12 rejects symbols", () => {
    expect(validateDisplayName("جميل!")).toBe("letters");
    expect(validateDisplayName("<script>")).toBe("letters");
    expect(validateDisplayName("name@site")).toBe("letters");
  });

  it("UT-VALID-13 accepts Arabic diacritics", () => {
    for (const name of DIACRITIC_NAMES) {
      expect(validateDisplayName(name)).toBeNull();
    }
  });

  it("UT-VALID-14 ignores zero-width characters when validating", () => {
    expect(validateDisplayName(`جميل${ZERO_WIDTH}جمال`)).toBeNull();
  });

  it("UT-VALID-15 treats a name made only of zero-width characters as required", () => {
    expect(validateDisplayName(ZERO_WIDTH)).toBe("required");
  });

  it("UT-VALID-16 accepts every name of the Arabic data pool", () => {
    for (const name of ARABIC_NAMES) {
      expect(validateDisplayName(name)).toBeNull();
    }
  });

  it("UT-VALID-17 accepts every mixed name of the data pool", () => {
    for (const name of MIXED_NAMES) {
      expect(validateDisplayName(name)).toBeNull();
    }
  });

  it("UT-VALID-18 uses the documented minimum and maximum lengths", () => {
    expect(DISPLAY_NAME_MIN_LENGTH).toBe(2);
    expect(DISPLAY_NAME_MAX_LENGTH).toBe(40);
  });
});
