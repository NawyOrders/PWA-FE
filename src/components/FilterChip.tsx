"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

interface FilterChipProps {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}

export function FilterChip({ active, onClick, children }: FilterChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "h-11 shrink-0 rounded-full px-5 text-[0.9375rem] font-bold transition-colors",
        active ? "bg-primary-gradient text-white shadow-cta" : "bg-surface text-muted",
      )}
    >
      {children}
    </button>
  );
}
