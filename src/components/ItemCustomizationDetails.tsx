"use client";

import { useI18n } from "@/lib/i18n/DictionaryProvider";
import { dictionaries as legacyDictionaries } from "@/lib/i18n/dictionary";

const ADDON_LABEL_KEYS = {
  lettuce: "addonLettuce",
  tomato: "addonTomato",
  onion: "addonOnion",
  cheese: "addonCheese",
  pickles: "addonPickles",
} as const;

interface ItemCustomizationDetailsProps {
  addonIds?: string[];
  note?: string;
  className?: string;
}

export function ItemCustomizationDetails({
  addonIds = [],
  note = "",
  className = "",
}: ItemCustomizationDetailsProps) {
  const { locale, dict } = useI18n();
  const selectedAddonNames = addonIds.flatMap((addonId) => {
    const key = ADDON_LABEL_KEYS[addonId as keyof typeof ADDON_LABEL_KEYS];
    return key ? [legacyDictionaries[locale][key]] : [];
  });
  const details = [
    selectedAddonNames.length > 0
      ? `${dict.cart.addonsLabel}: ${selectedAddonNames.join(locale === "ar" ? "، " : ", ")}`
      : "",
    note.trim() ? `${dict.cart.specialNotesLabel}: ${note.trim()}` : "",
  ].filter(Boolean).join(" · ");

  if (!details) return null;

  return (
    <p className={`text-[0.7rem] leading-5 text-muted ${className}`} dir="auto">
      {details}
    </p>
  );
}
