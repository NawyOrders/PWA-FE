// Arabic-aware text helpers for the FAQ live search (DESIGN.md 12.7).
// Normalization removes diacritics and tatweel, unifies alef/yeh/teh-marbuta
// variants and lower-cases Latin, so "الاسئله" matches "الأسئلة".

const DIACRITICS = /[\u064B-\u0652\u0670\u06D6-\u06DC\u06DF-\u06E8\u06EA-\u06ED]/g;
const TATWEEL = "\u0640";

function foldChar(char: string): string {
  if (char === "أ" || char === "إ" || char === "آ" || char === "ٱ") return "ا";
  if (char === "ى") return "ي";
  if (char === "ة") return "ه";
  return char.toLowerCase();
}

export function normalize(input: string): string {
  return input
    .replace(DIACRITICS, "")
    .replaceAll(TATWEEL, "")
    .split("")
    .map(foldChar)
    .join("")
    .trim();
}

export function normalizeTokens(query: string): string[] {
  return normalize(query).split(/\s+/).filter(Boolean);
}

export function matchesQuery(haystack: string, tokens: string[]): boolean {
  if (tokens.length === 0) return true;
  const text = normalize(haystack);
  return tokens.every((token) => text.includes(token));
}

export interface HighlightSegment {
  value: string;
  match: boolean;
}

function normalizeWithMap(input: string): { text: string; map: number[] } {
  const text: string[] = [];
  const map: number[] = [];
  for (let index = 0; index < input.length; index += 1) {
    const char = input[index];
    DIACRITICS.lastIndex = 0;
    if (DIACRITICS.test(char) || char === TATWEEL) continue;
    text.push(foldChar(char));
    map.push(index);
  }
  return { text: text.join(""), map };
}

export function highlightSegments(text: string, tokens: string[]): HighlightSegment[] {
  if (tokens.length === 0) return [{ value: text, match: false }];

  const { text: flat, map } = normalizeWithMap(text);
  const ranges: Array<[number, number]> = [];
  for (const token of tokens) {
    let from = 0;
    while (token.length > 0 && from <= flat.length - token.length) {
      const found = flat.indexOf(token, from);
      if (found === -1) break;
      ranges.push([found, found + token.length - 1]);
      from = found + 1;
    }
  }
  if (ranges.length === 0) return [{ value: text, match: false }];

  ranges.sort((a, b) => a[0] - b[0]);
  const merged: Array<[number, number]> = [];
  for (const range of ranges) {
    const last = merged[merged.length - 1];
    if (last && range[0] <= last[1] + 1) {
      last[1] = Math.max(last[1], range[1]);
    } else {
      merged.push([range[0], range[1]]);
    }
  }

  const segments: HighlightSegment[] = [];
  let cursor = 0;
  for (const [start, end] of merged) {
    const startIndex = map[start];
    const endIndex = map[end] + 1;
    if (startIndex > cursor) {
      segments.push({ value: text.slice(cursor, startIndex), match: false });
    }
    segments.push({ value: text.slice(startIndex, endIndex), match: true });
    cursor = endIndex;
  }
  if (cursor < text.length) segments.push({ value: text.slice(cursor), match: false });
  return segments;
}
