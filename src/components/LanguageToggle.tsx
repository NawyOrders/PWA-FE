"use client";

import { cn } from "@/lib/cn";
import { TranslateIcon } from "@/components/icons";
import type { Locale } from "@/lib/i18n/types";

interface LanguageToggleProps {
  label: string;
  locale: Locale;
  onChange: (locale: Locale) => void;
}

export function LanguageToggle({ label, locale, onChange }: LanguageToggleProps) {
  return (
    <div className="flex items-center gap-2">
      <TranslateIcon className="h-4 w-4 text-muted" />
      <span className="text-[0.875rem] font-bold text-title">{label}</span>
      <div className="ms-auto flex items-center gap-1 rounded-full border border-line p-1">
        <button
          type="button"
          onClick={() => onChange("en")}
          aria-pressed={locale === "en"}
          className={cn(
            "h-8 rounded-full px-3 text-[0.8125rem] font-bold transition-colors",
            locale === "en" ? "bg-primary text-white" : "text-muted",
          )}
        >
          ENG
        </button>
        <button
          type="button"
          onClick={() => onChange("ar")}
          aria-pressed={locale === "ar"}
          className={cn(
            "h-8 rounded-full px-3 text-[0.8125rem] font-bold transition-colors",
            locale === "ar" ? "bg-primary text-white" : "text-muted",
          )}
        >
          عربي
        </button>
      </div>
    </div>
  );
}
