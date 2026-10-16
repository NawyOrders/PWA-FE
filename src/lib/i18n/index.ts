import { ar } from "./ar";
import { en } from "./en";
import type { Dictionary, Locale, LocalizedText } from "./types";

export const locales: Locale[] = ["ar", "en"];
export const defaultLocale: Locale = "ar";

const dictionaries: Record<Locale, Dictionary> = { ar, en };

export function isLocale(value: string): value is Locale {
  return (locales as string[]).includes(value);
}

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale] ?? dictionaries[defaultLocale];
}

export function interpolate(
  template: string,
  params?: Record<string, string | number>,
): string {
  if (!params) return template;
  return template.replace(/\{(\w+)\}/g, (_, key: string) =>
    key in params ? String(params[key]) : `{${key}}`,
  );
}

export function pickLocalized(text: LocalizedText, locale: Locale): string {
  return text[locale];
}

export { ar, en };
export type { Dictionary, Locale, LocalizedText };
export { I18nProvider, useI18n } from "./LegacyProvider";
export { localizedHref } from "./anchors";
export type { MessageKey } from "./dictionary";
