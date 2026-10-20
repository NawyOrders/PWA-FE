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
    const timer = setTimeout(hideToast, toast.duration ?? 2400);
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
          "pointer-events-auto flex max-w-app items-center justify-center gap-3 rounded-full px-5 py-3 text-center text-[0.875rem] font-bold shadow-floating animate-fade-in",
          tones[toast.tone],
        )}
      >
        <span>{toast.message}</span>
        {toast.action ? (
          <button
            type="button"
            onClick={() => {
              toast.action?.onAction();
              hideToast();
            }}
            className="shrink-0 font-extrabold underline underline-offset-2"
          >
            {toast.action.label}
          </button>
        ) : null}
      </div>
    </div>
  );
}
