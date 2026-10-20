"use client";

import { useRef, type ReactNode } from "react";
import { useFocusTrap } from "@/lib/useFocusTrap";
import { useI18n } from "@/lib/i18n/DictionaryProvider";

interface DrawerProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  labelledBy?: string;
}

export function Drawer({ open, onClose, children, labelledBy }: DrawerProps) {
  const { dict } = useI18n();
  const ref = useRef<HTMLElement>(null);
  useFocusTrap(ref, open, onClose);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <button
        type="button"
        aria-label={dict.common.close}
        onClick={onClose}
        className="absolute inset-0 cursor-default bg-overlay animate-fade-in"
      />
      <aside
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        tabIndex={-1}
        className="absolute inset-y-0 start-0 flex w-[72%] max-w-[26.25rem] flex-col overflow-y-auto rounded-e-sheet bg-surface py-6 shadow-floating animate-drawer-in"
      >
        <span aria-hidden className="absolute inset-y-0 start-0 w-1 bg-drawer-edge" />
        {children}
      </aside>
    </div>
  );
}
