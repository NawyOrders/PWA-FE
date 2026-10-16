import { getDictionary } from "./i18n";
import type { Locale } from "./i18n/types";

export function formatPrice(value: number, locale: Locale): string {
  const amount = Math.round(value / 100);
  const digits = new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 0,
  }).format(amount);
  const { currency } = getDictionary(locale).common;
  return `${digits} ${currency}`;
}
