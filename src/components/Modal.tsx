"use client";

import { useRef, type ReactNode } from "react";
import { useFocusTrap } from "@/lib/useFocusTrap";
import { useI18n } from "@/lib/i18n/DictionaryProvider";
import { cn } from "@/lib/cn";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  labelledBy?: string;
  bottomSheet?: boolean;
  className?: string;
}

export function Modal({ open, onClose, children, labelledBy, bottomSheet, className }: ModalProps) {
  const { dict } = useI18n();
  const ref = useRef<HTMLDivElement>(null);
  useFocusTrap(ref, open, onClose);

  if (!open) return null;

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 flex justify-center",
        bottomSheet ? "items-end px-0 md:items-center md:px-6" : "items-center px-6",
      )}
    >
      <button
        type="button"
        aria-label={dict.common.close}
        onClick={onClose}
        className="absolute inset-0 cursor-default bg-overlay animate-fade-in"
      />
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        tabIndex={-1}
        className={cn(
          "relative w-full max-w-[30rem] rounded-modal bg-surface p-6 shadow-floating",
          bottomSheet
            ? "max-h-[85dvh] overflow-y-auto rounded-b-none pb-[calc(1.5rem+env(safe-area-inset-bottom))] animate-sheet-in md:rounded-b-modal md:pb-6"
            : "animate-modal-in",
          className,
        )}
      >
        {children}
      </div>
    </div>
  );
}
