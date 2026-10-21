import { getDictionary } from "./i18n";
import type { Locale } from "./i18n/types";

export function formatPrice(value: number, locale: Locale): string {
  const amount = Math.max(0, value) / 100;
  const isWhole = Number.isInteger(amount);
  const digits = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: isWhole ? 0 : 2,
    maximumFractionDigits: isWhole ? 0 : 2,
  }).format(amount);
  const { currency } = getDictionary(locale).common;
  return `${digits} ${currency}`;
}
