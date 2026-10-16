const ARABIC_INDIC = /[\u0660-\u0669]/g;
const EXTENDED_ARABIC_INDIC = /[\u06f0-\u06f9]/g;

export function normalizeDigits(value: string): string {
  return value
    .replace(ARABIC_INDIC, (digit) => String(digit.charCodeAt(0) - 0x0660))
    .replace(EXTENDED_ARABIC_INDIC, (digit) => String(digit.charCodeAt(0) - 0x06f0));
}

export function toAsciiDigits(value: string): string {
  return normalizeDigits(value).replace(/\D/g, "");
}
