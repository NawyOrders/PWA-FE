"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { defaultLocale, isLocale, type Locale } from "@/lib/i18n";

interface LanguageState {
  locale: Locale;
  setLocale: (locale: Locale) => void;
}

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set) => ({
      locale: defaultLocale,
      setLocale: (locale) => {
        set({ locale });
        if (typeof document !== "undefined") {
          document.cookie = `locale=${locale}; path=/; max-age=31536000; samesite=lax`;
        }
      },
    }),
    {
      name: "nawy-language",
      skipHydration: true,
      // An unknown stored locale must not break the app: keep the current one.
      merge: (persisted, current) => {
        const stored = persisted as Partial<LanguageState> | undefined;
        const locale = stored?.locale;
        return {
          ...current,
          ...stored,
          locale: locale && isLocale(locale) ? locale : current.locale,
        };
      },
    },
  ),
);
