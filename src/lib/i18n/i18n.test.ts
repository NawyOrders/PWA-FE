import { describe, expect, it } from "vitest";
import { ar, en, getDictionary, interpolate, isLocale, pickLocalized } from "./index";
import { dictionaries } from "./dictionary";
import { localizedHref, anchors } from "./anchors";
import { defaultLocale, locales } from "./config";

describe("locale configuration", () => {
  it("UT-I18N-01 exposes the Arabic and English locales", () => {
    expect(locales).toEqual(["ar", "en"]);
    expect(defaultLocale).toBe("ar");
  });

  it("UT-I18N-02 recognizes a supported locale", () => {
    expect(isLocale("ar")).toBe(true);
    expect(isLocale("en")).toBe(true);
  });

  it("UT-I18N-03 rejects an unsupported locale", () => {
    expect(isLocale("fr")).toBe(false);
    expect(isLocale("")).toBe(false);
  });
});

describe("getDictionary", () => {
  it("UT-I18N-04 returns the Arabic dictionary", () => {
    expect(getDictionary("ar")).toBe(ar);
  });

  it("UT-I18N-05 returns the English dictionary", () => {
    expect(getDictionary("en")).toBe(en);
  });

  it("UT-I18N-06 falls back to the default locale for an unknown locale", () => {
    expect(getDictionary("fr" as "ar")).toBe(ar);
  });
});

describe("interpolate", () => {
  it("UT-I18N-07 replaces a placeholder with its value", () => {
    expect(interpolate("مرحبا {name}", { name: "جميل" })).toBe("مرحبا جميل");
  });

  it("UT-I18N-08 replaces every occurrence of a placeholder", () => {
    expect(interpolate("{a} and {a}", { a: "x" })).toBe("x and x");
  });

  it("UT-I18N-09 keeps an unknown placeholder untouched", () => {
    expect(interpolate("مرحبا {name}", { other: "x" })).toBe("مرحبا {name}");
  });

  it("UT-I18N-10 returns the template when there are no parameters", () => {
    expect(interpolate("مرحبا {name}")).toBe("مرحبا {name}");
  });

  it("UT-I18N-11 converts a numeric value to a string", () => {
    expect(interpolate("{count} ثانية", { count: 59 })).toBe("59 ثانية");
  });
});

describe("pickLocalized", () => {
  it("UT-I18N-12 picks the Arabic text", () => {
    expect(pickLocalized({ ar: "عربي", en: "english" }, "ar")).toBe("عربي");
  });

  it("UT-I18N-13 picks the English text", () => {
    expect(pickLocalized({ ar: "عربي", en: "english" }, "en")).toBe("english");
  });
});

describe("localizedHref", () => {
  it("UT-I18N-14 points the root path at the locale", () => {
    expect(localizedHref("ar", "/")).toBe("/ar");
    expect(localizedHref("en", "/")).toBe("/en");
  });

  it("UT-I18N-15 prefixes a path with the locale", () => {
    expect(localizedHref("ar", "/cart")).toBe("/ar/cart");
    expect(localizedHref("en", "/profile/help/faq")).toBe("/en/profile/help/faq");
  });

  it("UT-I18N-16 adds the missing leading slash", () => {
    expect(localizedHref("en", "cart")).toBe("/en/cart");
  });

  it("UT-I18N-17 encodes an item slug", () => {
    expect(anchors.item("crack burger")).toBe("/item/crack%20burger");
    expect(localizedHref("ar", anchors.item("crack burger"))).toBe("/ar/item/crack%20burger");
  });
});

describe("legacy dictionaries", () => {
  it("UT-I18N-18 exposes a dictionary per locale", () => {
    expect(dictionaries.ar).toBeDefined();
    expect(dictionaries.en).toBeDefined();
  });

  it("UT-I18N-19 has no empty legacy value", () => {
    const empty = Object.entries(dictionaries.ar).filter(([, value]) => value.trim() === "");
    expect(empty).toEqual([]);
  });
});
