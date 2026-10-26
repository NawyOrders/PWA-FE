"use client";

import { useState } from "react";
import { useI18n } from "@/lib/i18n/DictionaryProvider";
import { isIosSafari, isInstallAvailable, promptInstall, snoozeInstall } from "@/lib/pwa";
import { PlusIcon } from "@/components/icons";
import { usePwaStore } from "@/store/pwaStore";
import { IosInstallSheet } from "./IosInstallSheet";

export function InstallButton({ variant = "menu" }: { variant?: "menu" | "footer" }) {
  const { dict } = useI18n();
  const hydrated = usePwaStore((state) => state.hydrated);
  const installed = usePwaStore((state) => state.installed);
  const promptEvent = usePwaStore((state) => state.installPromptEvent);
  const setInstalled = usePwaStore((state) => state.setInstalled);
  const setInstallPromptEvent = usePwaStore((state) => state.setInstallPromptEvent);
  const [iosOpen, setIosOpen] = useState(false);

  const ios = isIosSafari();
  if (!hydrated || !isInstallAvailable(installed, promptEvent, ios)) return null;

  const start = async () => {
    if (!promptEvent) {
      setIosOpen(true);
      return;
    }
    const outcome = await promptInstall(promptEvent);
    setInstallPromptEvent(null);
    if (outcome === "accepted") {
      setInstalled(true);
    } else {
      snoozeInstall();
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={start}
        className={
          variant === "footer"
            ? "text-start text-[0.875rem] font-medium text-muted transition-colors hover:text-primary"
            : "flex h-12 items-center justify-between gap-3 rounded-2xl px-2 text-start transition-colors hover:bg-surface-muted"
        }
      >
        <span className={variant === "footer" ? "" : "text-[0.9375rem] font-bold text-title"}>
          {dict.pwa.installApp}
        </span>
        {variant === "footer" ? null : (
          <span className="text-primary">
            <PlusIcon className="h-5 w-5" />
          </span>
        )}
      </button>
      {iosOpen ? <IosInstallSheet onClose={() => setIosOpen(false)} /> : null}
    </>
  );
}
