"use client";

import { useEffect } from "react";
import { isBeforeInstallPromptEvent, isStandalone } from "@/lib/pwa";
import { usePwaStore } from "@/store/pwaStore";

export function PwaProvider() {
  const setHydrated = usePwaStore((state) => state.setHydrated);
  const setInstalled = usePwaStore((state) => state.setInstalled);
  const setInstallPromptEvent = usePwaStore((state) => state.setInstallPromptEvent);

  useEffect(() => {
    setHydrated();
    setInstalled(isStandalone());

    const onBeforeInstallPrompt = (event: Event) => {
      if (!isBeforeInstallPromptEvent(event)) return;
      event.preventDefault();
      setInstallPromptEvent(event);
    };
    const onInstalled = () => {
      setInstalled(true);
      setInstallPromptEvent(null);
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, [setHydrated, setInstallPromptEvent, setInstalled]);

  return null;
}
