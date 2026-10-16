"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";
import { interpolate } from "./index";
import type { Dictionary, Locale, LocalizedText } from "./types";

interface I18nValue {
  locale: Locale;
  dict: Dictionary;
  dir: "rtl" | "ltr";
  t: (template: string, params?: Record<string, string | number>) => string;
  pick: (text: LocalizedText) => string;
}

const I18nContext = createContext<I18nValue | null>(null);

export function I18nProvider({
  locale,
  dict,
  children,
}: {
  locale: Locale;
  dict: Dictionary;
  children: ReactNode;
}) {
  const value = useMemo<I18nValue>(
    () => ({
      locale,
      dict,
      dir: locale === "ar" ? "rtl" : "ltr",
      t: (template, params) => interpolate(template, params),
      pick: (text) => text[locale],
    }),
    [locale, dict],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nValue {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    throw new Error("useI18n must be used within an I18nProvider");
  }
  return ctx;
}
