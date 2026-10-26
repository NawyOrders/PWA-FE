"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useI18n } from "@/lib/i18n/DictionaryProvider";
import {
  getSessionCount,
  hasAddedToCart,
  isInstallAvailable,
  isInstallSnoozed,
  isIosSafari,
  promptInstall,
  snoozeInstall,
} from "@/lib/pwa";
import { CloudUploadIcon, CloseIcon } from "@/components/icons";
import { usePwaStore } from "@/store/pwaStore";
import { IosInstallSheet } from "./IosInstallSheet";

export function InstallBanner() {
  const { locale, dict } = useI18n();
  const pathname = usePathname();
  const hydrated = usePwaStore((state) => state.hydrated);
  const installed = usePwaStore((state) => state.installed);
  const promptEvent = usePwaStore((state) => state.installPromptEvent);
  const setInstalled = usePwaStore((state) => state.setInstalled);
  const setInstallPromptEvent = usePwaStore((state) => state.setInstallPromptEvent);
  const [eligible, setEligible] = useState(false);
  const [iosOpen, setIosOpen] = useState(false);

  useEffect(() => {
    setEligible((getSessionCount() >= 2 || hasAddedToCart()) && !isInstallSnoozed());
  }, []);

  const ios = isIosSafari();
  const onHomeOrMenu = pathname === `/${locale}` || pathname === `/${locale}/menu`;

  if (
    !hydrated ||
    !eligible ||
    !onHomeOrMenu ||
    !isInstallAvailable(installed, promptEvent, ios)
  ) {
    return null;
  }

  const install = async () => {
    if (!promptEvent) {
      setIosOpen(true);
      return;
    }
    const outcome = await promptInstall(promptEvent);
    setInstallPromptEvent(null);
    setEligible(false);
    if (outcome === "accepted") {
      setInstalled(true);
    } else {
      snoozeInstall();
    }
  };

  const dismiss = () => {
    snoozeInstall();
    setEligible(false);
  };

  return (
    <>
      <aside
        role="region"
        aria-label={dict.pwa.installApp}
        className="fixed inset-x-3 bottom-[calc(1rem+env(safe-area-inset-bottom))] z-40 mx-auto flex max-w-sm items-center gap-3 rounded-2xl border border-line bg-surface p-3 shadow-lg"
      >
        <span
          aria-hidden
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-tint text-primary"
        >
          <CloudUploadIcon className="h-5 w-5" />
        </span>
        <p className="min-w-0 flex-1 text-[13px] font-bold leading-snug text-title">
          {dict.pwa.installApp}
        </p>
        <button
          type="button"
          onClick={install}
          className="h-9 shrink-0 rounded-full bg-primary px-4 text-[12px] font-bold text-white"
        >
          {dict.pwa.installApp}
        </button>
        <button
          type="button"
          onClick={dismiss}
          aria-label={dict.pwa.notNow}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-muted"
        >
          <CloseIcon className="h-4 w-4" />
        </button>
      </aside>
      {iosOpen ? <IosInstallSheet onClose={() => setIosOpen(false)} /> : null}
    </>
  );
}
