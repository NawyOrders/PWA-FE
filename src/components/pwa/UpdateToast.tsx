"use client";

import { useState } from "react";
import { useI18n } from "@/lib/i18n/DictionaryProvider";
import {
  PWA_RELOAD_FLAG,
  PWA_SKIP_WAITING,
  hasDirtyForm,
  writeSession,
} from "@/lib/pwa";
import { usePwaStore } from "@/store/pwaStore";

export function UpdateToast() {
  const { dict } = useI18n();
  const updateReady = usePwaStore((state) => state.updateReady);
  const waitingWorker = usePwaStore((state) => state.waitingWorker);
  const setUpdateReady = usePwaStore((state) => state.setUpdateReady);
  const [blocked, setBlocked] = useState(false);

  if (!updateReady) return null;

  const update = () => {
    if (hasDirtyForm()) {
      setBlocked(true);
      return;
    }
    setBlocked(false);
    writeSession(PWA_RELOAD_FLAG, "1");
    if (waitingWorker) {
      waitingWorker.postMessage({ type: PWA_SKIP_WAITING });
    }
  };

  const dismiss = () => {
    setBlocked(false);
    setUpdateReady(false);
  };

  return (
    <aside
      role="status"
      aria-live="polite"
      className="fixed inset-x-3 bottom-[calc(1rem+env(safe-area-inset-bottom))] z-[90] mx-auto flex max-w-sm flex-col gap-2 rounded-2xl border border-line bg-surface p-4 shadow-lg"
    >
      <p className="text-[14px] font-bold text-title">{dict.pwa.updateAvailable}</p>
      {blocked ? <p className="text-[12px] text-danger">{dict.pwa.updateBlocked}</p> : null}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={update}
          className="h-9 flex-1 rounded-full bg-primary px-4 text-[12px] font-bold text-white"
        >
          {dict.pwa.updateNow}
        </button>
        <button
          type="button"
          onClick={dismiss}
          className="h-9 rounded-full px-4 text-[12px] font-bold text-muted"
        >
          {dict.pwa.dismiss}
        </button>
      </div>
    </aside>
  );
}
