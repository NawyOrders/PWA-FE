import { describe, expect, it } from "vitest";
import {
  highlightSegments,
  matchesQuery,
  normalize,
  normalizeTokens,
} from "./text";
import {
  ARABIC_QUESTION_VARIANTS,
  EMOJI,
  VERY_LONG_WORD,
  XSS_PAYLOADS,
} from "../../tests/data/arabic-pool";

describe("normalize", () => {
  it("UT-TEXT-01 removes Arabic diacritics", () => {
    expect(normalize("جَمِيل")).toBe("جميل");
  });

  it("UT-TEXT-02 removes the tatweel", () => {
    expect(normalize("محـمد")).toBe("محمد");
  });

  it("UT-TEXT-03 unifies the alef variants", () => {
    expect(normalize("أحمد")).toBe("احمد");
    expect(normalize("إسلام")).toBe("اسلام");
    expect(normalize("آمن")).toBe("امن");
  });

  it("UT-TEXT-04 turns alef maksura into yeh", () => {
    expect(normalize("موسى")).toBe("موسي");
  });

  it("UT-TEXT-05 turns teh marbuta into heh", () => {
    expect(normalize("مدرسة")).toBe("مدرسه");
  });

  it("UT-TEXT-06 lower-cases Latin letters", () => {
    expect(normalize("Delivery Time")).toBe("delivery time");
  });

  it("UT-TEXT-07 trims the edges", () => {
    expect(normalize("   توصيل   ")).toBe("توصيل");
  });

  it("UT-TEXT-08 keeps digits and emoji", () => {
    expect(normalize(`${EMOJI} 123`)).toBe(`${EMOJI} 123`);
  });

  it("UT-TEXT-09 returns an empty string for an empty input", () => {
    expect(normalize("")).toBe("");
  });

  it("UT-TEXT-10 is idempotent", () => {
    const samples = ["جَمِيل جَمَال", "الأسئلة الشائعة", "Delivery", VERY_LONG_WORD, EMOJI];
    for (const sample of samples) {
      expect(normalize(normalize(sample))).toBe(normalize(sample));
    }
  });

  it("UT-TEXT-11 is never longer than the input", () => {
    const samples = ["جَمِيل", "الأسئلة", VERY_LONG_WORD, EMOJI];
    for (const sample of samples) {
      expect(normalize(sample).length).toBeLessThanOrEqual(sample.length);
    }
  });
});

describe("normalizeTokens", () => {
  it("UT-TEXT-12 splits the query into normalized tokens", () => {
    expect(normalizeTokens("  الاسئله  الشائعة ")).toEqual(["الاسئله", "الشائعه"]);
  });

  it("UT-TEXT-13 drops empty tokens", () => {
    expect(normalizeTokens("   ")).toEqual([]);
    expect(normalizeTokens("a  b")).toEqual(["a", "b"]);
  });
});

describe("matchesQuery", () => {
  it("UT-TEXT-14 matches every token as a substring", () => {
    const tokens = normalizeTokens("الاسئله الشائعة");
    expect(matchesQuery("الأسئلة الشائعة الأكثر طلباً", tokens)).toBe(true);
  });

  it("UT-TEXT-15 fails when one token is missing", () => {
    const tokens = normalizeTokens("الاسئله telepathy");
    expect(matchesQuery("الأسئلة الشائعة", tokens)).toBe(false);
  });

  it("UT-TEXT-16 matches the Arabic variant without a hamza", () => {
    const tokens = normalizeTokens(ARABIC_QUESTION_VARIANTS.withoutHamza);
    expect(matchesQuery("الأسئلة الشائعة", tokens)).toBe(true);
  });

  it("UT-TEXT-17 matches the question and the answer", () => {
    const tokens = normalizeTokens("توصيل");
    expect(matchesQuery("كم يستغرق توصيل الطلب في المتوسط؟", tokens)).toBe(true);
    expect(matchesQuery("يتم توصيل معظم الطلبات خلال 25 دقيقة", tokens)).toBe(true);
  });

  it("UT-TEXT-18 returns true for an empty token list", () => {
    expect(matchesQuery("أي نص", [])).toBe(true);
  });

  it("UT-TEXT-19 never throws for a very long input", () => {
    expect(() => matchesQuery(VERY_LONG_WORD, normalizeTokens(VERY_LONG_WORD))).not.toThrow();
  });
});

describe("highlightSegments", () => {
  it("UT-TEXT-20 returns the whole text when there are no tokens", () => {
    expect(highlightSegments("الأسئلة", [])).toEqual([{ value: "الأسئلة", match: false }]);
  });

  it("UT-TEXT-21 marks the matched range only", () => {
    const segments = highlightSegments("الأسئلة الشائعة", normalizeTokens("الشائعه"));
    expect(segments).toEqual([
      { value: "الأسئلة ", match: false },
      { value: "الشائعة", match: true },
    ]);
  });

  it("UT-TEXT-22 keeps the original characters of the matched range", () => {
    const segments = highlightSegments("جَمِيل جَمَال", normalizeTokens("جميل"));
    expect(segments).toEqual([
      { value: "جَمِيل", match: true },
      { value: " جَمَال", match: false },
    ]);
  });

  it("UT-TEXT-23 returns a single unmatched segment when nothing matches", () => {
    expect(highlightSegments("الأسئلة", normalizeTokens("xyz"))).toEqual([
      { value: "الأسئلة", match: false },
    ]);
  });

  it("UT-TEXT-24 merges overlapping ranges", () => {
    const segments = highlightSegments("abcabc", normalizeTokens("abca"));
    expect(segments).toEqual([{ value: "abca", match: true }, { value: "bc", match: false }]);
  });

  it("UT-TEXT-25 never injects HTML into the segments", () => {
    for (const payload of XSS_PAYLOADS) {
      const segments = highlightSegments(payload, normalizeTokens("script"));
      const joined = segments.map((segment) => segment.value).join("");
      expect(joined).toBe(payload);
      expect(joined).not.toContain("<mark>");
    }
  });

  it("UT-TEXT-26 rebuilds the original text from the segments", () => {
    const text = "الأسئلة الشائعة عن التوصيل";
    const segments = highlightSegments(text, normalizeTokens("التوصيل"));
    expect(segments.map((segment) => segment.value).join("")).toBe(text);
  });
});
