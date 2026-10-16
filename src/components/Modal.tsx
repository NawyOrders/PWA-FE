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
  className?: string;
}

export function Modal({ open, onClose, children, labelledBy, className }: ModalProps) {
  const { dict } = useI18n();
  const ref = useRef<HTMLDivElement>(null);
  useFocusTrap(ref, open, onClose);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-6">
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
          "relative w-full max-w-[30rem] rounded-modal bg-surface p-6 shadow-floating animate-modal-in",
          className,
        )}
      >
        {children}
      </div>
    </div>
  );
}
