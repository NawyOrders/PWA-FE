"use client";

import { createContext, useContext, type ReactNode } from "react";
import { dictionaries, type MessageKey } from "./dictionary";
import { localizedHref } from "./anchors";
import type { Locale } from "./config";

type I18nValue = {
  locale: Locale;
  direction: "rtl" | "ltr";
  t: (key: MessageKey) => string;
  href: (path: string) => string;
};

const I18nContext = createContext<I18nValue | null>(null);

export function I18nProvider({
  locale,
  children,
}: {
  locale: Locale;
  children: ReactNode;
}) {
  const dictionary = dictionaries[locale];
  const value: I18nValue = {
    locale,
    direction: locale === "ar" ? "rtl" : "ltr",
    t: (key) => dictionary[key],
    href: (path) => localizedHref(locale, path),
  };

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const value = useContext(I18nContext);
  if (!value) {
    throw new Error("useI18n must be used inside I18nProvider");
  }
  return value;
}

export { localizedHref } from "./anchors";
export { defaultLocale, isLocale, locales, type Locale } from "./config";
export type { MessageKey } from "./dictionary";
