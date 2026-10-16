"use client";

import { useEffect } from "react";
import { useUiStore, type ToastTone } from "@/store/uiStore";
import { cn } from "@/lib/cn";

const tones: Record<ToastTone, string> = {
  default: "bg-title text-white",
  success: "bg-success text-white",
  danger: "bg-danger text-white",
};

export function Toast() {
  const toast = useUiStore((state) => state.toast);
  const hideToast = useUiStore((state) => state.hideToast);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(hideToast, 2400);
    return () => clearTimeout(timer);
  }, [toast, hideToast]);

  if (!toast) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-6 z-[60] flex justify-center px-6">
      <div
        key={toast.id}
        role="status"
        aria-live="polite"
        className={cn(
          "pointer-events-auto max-w-app rounded-full px-5 py-3 text-center text-[0.875rem] font-bold shadow-floating animate-fade-in",
          tones[toast.tone],
        )}
      >
        {toast.message}
      </div>
    </div>
  );
}
