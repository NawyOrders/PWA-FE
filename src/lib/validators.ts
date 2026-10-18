export const DISPLAY_NAME_MIN_LENGTH = 2;
export const DISPLAY_NAME_MAX_LENGTH = 40;

export type DisplayNameError = "required" | "short" | "letters" | "long";

const DISPLAY_NAME_PATTERN = /^[A-Za-zء-ي\s'-]+$/;

export function normalizeDisplayName(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

export function validateDisplayName(value: string): DisplayNameError | null {
  const normalized = normalizeDisplayName(value);
  if (!normalized) return "required";
  if (normalized.length < DISPLAY_NAME_MIN_LENGTH) return "short";
  if (normalized.length > DISPLAY_NAME_MAX_LENGTH) return "long";
  if (!DISPLAY_NAME_PATTERN.test(normalized)) return "letters";
  return null;
}
