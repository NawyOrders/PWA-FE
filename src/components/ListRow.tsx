"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { ChevronIcon } from "@/components/icons";

interface ListRowProps {
  icon: ReactNode;
  iconClassName?: string;
  title: string;
  subtitle?: string;
  onClick?: () => void;
}

export function ListRow({ icon, iconClassName, title, subtitle, onClick }: ListRowProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex min-h-[6.25rem] w-full items-center gap-3 rounded-card bg-surface p-4 text-start shadow-card transition-transform active:scale-[0.99]"
    >
      <span
        className={cn(
          "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl",
          iconClassName,
        )}
      >
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[0.9375rem] font-bold text-title">{title}</span>
        {subtitle ? (
          <span className="mt-0.5 block truncate text-[0.8125rem] text-muted">{subtitle}</span>
        ) : null}
      </span>
      <ChevronIcon className="h-5 w-5 shrink-0 text-muted rtl:rotate-180" />
    </button>
  );
}
