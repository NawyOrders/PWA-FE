"use client";

import type { ReactNode } from "react";
import { PrimaryButton } from "@/components/PrimaryButton";

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  hint: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ icon, title, hint, actionLabel, onAction }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-glow text-primary">
        {icon}
      </div>
      <h2 className="text-[1.125rem] font-extrabold text-title">{title}</h2>
      <p className="max-w-[16.25rem] text-[0.875rem] text-muted">{hint}</p>
      {actionLabel && onAction ? (
        <div className="mt-2 w-full max-w-[13.75rem]">
          <PrimaryButton onClick={onAction}>{actionLabel}</PrimaryButton>
        </div>
      ) : null}
    </div>
  );
}
