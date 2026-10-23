/**
 * Arabic data pool used by the unit tests (TESTING.md section 4).
 * It covers the tricky inputs the validators and the search helpers must
 * survive: Arabic names, Latin names, Arabic-Indic digits, emoji, very long
 * words and empty or whitespace-only strings.
 */

/** Pure Arabic names. */
export const ARABIC_NAMES = ["جميل جمال", "محمد", "عبد الرحمن"] as const;

/** Latin and mixed names. */
export const MIXED_NAMES = ["Mohamed O'Brien", "Anne-Marie", "O'Brien"] as const;

/** Names with Arabic diacritics (tashkeel) and a tatweel. */
export const DIACRITIC_NAMES = ["جَمِيل جَمَال", "مُحَمَّد", "عبد‌الرحمن"] as const;

/** Arabic-Indic digits and the extended Arabic-Indic digits. */
export const ARABIC_INDIC_DIGITS = "٠١٠١٢٣٤٥٦٧٨٩" as const;
export const EXTENDED_ARABIC_INDIC_DIGITS = "۰۱۲۳۴۵۶۷۸۹" as const;

/** Emoji and a zero-width-joiner sequence. */
export const EMOJI = "🍔" as const;
export const EMOJI_SEQUENCE = "👨‍👩‍👧‍👦" as const;

/** A single word that is longer than the 40 character name limit. */
export const VERY_LONG_WORD = "مطعمكرمالشامالامانيالابناطولالتخصصي" as const;

/** A 10,000 character string used for the input fuzzing. */
export function veryLongText(length = 10_000): string {
  return "ا".repeat(length);
}

/** Empty and whitespace-only strings. */
export const EMPTY_STRING = "" as const;
export const WHITESPACE_ONLY = "   " as const;

/** Arabic question variants used by the FAQ search. */
export const ARABIC_QUESTION_VARIANTS = {
  withHamza: "الأسئلة",
  withoutHamza: "الاسئله",
  withTashkeel: "الأَسْئِلَة",
  withTatweel: "الأسئلـة",
} as const;

/** Zero-width and bidi control characters used by the security tests. */
export const ZERO_WIDTH = "‌‍﻿" as const;
export const RTL_MARKS = "‪‫‬‭‮" as const;

/** Script injection payloads used by the security tests. */
export const XSS_PAYLOADS = [
  '<img src=x onerror="alert(1)">',
  "<script>alert(1)</script>",
  'javascript:alert(1)',
  '<a href="javascript:alert(1)">x</a>',
  "<svg/onload=alert(1)>",
  "&lt;script&gt;alert(1)&lt;/script&gt;",
] as const;
