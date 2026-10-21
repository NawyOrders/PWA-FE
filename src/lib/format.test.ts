import { describe, expect, it } from "vitest";
import { formatPrice } from "./format";
import { getDictionary } from "./i18n";

const ar = getDictionary("ar");
const en = getDictionary("en");

describe("formatPrice", () => {
  it("UT-FORMAT-01 renders a whole amount without decimals in Arabic", () => {
    expect(formatPrice(12000, "ar")).toBe(`120 ${ar.common.currency}`);
  });

  it("UT-FORMAT-02 renders a whole amount without decimals in English", () => {
    expect(formatPrice(12000, "en")).toBe(`120 ${en.common.currency}`);
  });

  it("UT-FORMAT-03 renders two decimals when the amount is not a whole pound", () => {
    expect(formatPrice(12050, "ar")).toBe(`120.50 ${ar.common.currency}`);
    expect(formatPrice(12050, "en")).toBe(`120.50 ${en.common.currency}`);
  });

  it("UT-FORMAT-04 renders zero", () => {
    expect(formatPrice(0, "ar")).toBe(`0 ${ar.common.currency}`);
    expect(formatPrice(0, "en")).toBe(`0 ${en.common.currency}`);
  });

  it("UT-FORMAT-05 clamps a negative amount to zero", () => {
    expect(formatPrice(-1, "ar")).toBe(`0 ${ar.common.currency}`);
    expect(formatPrice(-999999, "en")).toBe(`0 ${en.common.currency}`);
  });

  it("UT-FORMAT-06 always uses Latin digits in both languages", () => {
    expect(formatPrice(12000, "ar")).not.toMatch(/[٠-٩]/);
    expect(formatPrice(12000, "en")).not.toMatch(/[٠-٩]/);
    expect(formatPrice(12000, "ar")).toMatch(/[0-9]/);
  });

  it("UT-FORMAT-07 formats very large amounts without losing precision", () => {
    expect(formatPrice(100_000_000, "en")).toBe(`1,000,000 ${en.common.currency}`);
  });

  it("UT-FORMAT-08 never rounds off by one piaster", () => {
    expect(formatPrice(12099, "en")).toBe(`120.99 ${en.common.currency}`);
    expect(formatPrice(12001, "en")).toBe(`120.01 ${en.common.currency}`);
    expect(formatPrice(1, "en")).toBe(`0.01 ${en.common.currency}`);
    expect(formatPrice(99, "en")).toBe(`0.99 ${en.common.currency}`);
  });
});
