"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { defaultLocale, type Locale } from "@/lib/i18n";

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
    { name: "nawy-language", skipHydration: true },
  ),
);
