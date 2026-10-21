export const DISPLAY_NAME_MIN_LENGTH = 2;
export const DISPLAY_NAME_MAX_LENGTH = 40;

export type DisplayNameError = "required" | "short" | "letters" | "long";

// Latin letters, Arabic letters (U+0621..U+064A), Arabic diacritics
// (U+064B..U+0652, U+0670, U+06D6..U+06ED), spaces, hyphens and apostrophes.
const DISPLAY_NAME_PATTERN = /^[A-Za-zء-يً-ٰٟۖ-ۭ\s'-]+$/;

// Zero width space, zero width non-joiner, zero width joiner and the
// zero width no-break space (BOM).
const ZERO_WIDTH = /[\u200B-\u200D\uFEFF]/g;

export function normalizeDisplayName(value: string): string {
  return value.replace(ZERO_WIDTH, "").replace(/\s+/g, " ").trim();
}

export function validateDisplayName(value: string): DisplayNameError | null {
  const normalized = normalizeDisplayName(value);
  if (!normalized) return "required";
  if (normalized.length < DISPLAY_NAME_MIN_LENGTH) return "short";
  if (normalized.length > DISPLAY_NAME_MAX_LENGTH) return "long";
  if (!DISPLAY_NAME_PATTERN.test(normalized)) return "letters";
  return null;
}
