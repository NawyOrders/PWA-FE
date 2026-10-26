"use client";

import { useI18n } from "@/lib/i18n/DictionaryProvider";
import { usePwaStore } from "@/store/pwaStore";

export function OfflineBanner() {
  const { dict, locale } = useI18n();
  const hydrated = usePwaStore((state) => state.hydrated);
  const online = usePwaStore((state) => state.online);

  if (!hydrated || online) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      lang={locale}
      className="fixed inset-x-0 top-0 z-[70] bg-ink py-2 text-center text-[13px] font-bold text-white"
    >
      {dict.pwa.offline}
    </div>
  );
}
