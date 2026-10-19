"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { useI18n } from "@/lib/i18n/DictionaryProvider";
import "./OptionCard.css";

export interface OptionCardStatus {
  open: boolean;
  label: string;
}

interface OptionCardProps {
  icon: ReactNode;
  title: string;
  subtitle: string;
  status?: OptionCardStatus;
  href?: string;
  onClick?: () => void;
  className?: string;
}

export function OptionCard({ icon, title, subtitle, status, href, onClick, className }: OptionCardProps) {
  const { locale } = useI18n();
  // Accessible name is the title plus the subtitle (or the live status when present).
  const accessibleName = `${title}${locale === "ar" ? "، " : ", "}${status ? status.label : subtitle}`;

  const content = (
    <>
      <span
        aria-hidden
        className="flex h-[56px] w-[56px] shrink-0 items-center justify-center rounded-[17px] bg-primary-gradient shadow-[0_4px_12px_var(--primary-soft)] text-white"
      >
        <span className="[&>svg]:h-[28px] [&>svg]:w-[28px]">{icon}</span>
      </span>
      <span className="mt-[16px] block text-[16px] font-extrabold leading-[1.4] text-title">
        {title}
      </span>
      {status ? (
        <span role="status" className="mt-[4px] flex items-center gap-[6px] text-[13px] leading-[1.5] text-muted">
          <span
            aria-hidden
            className={cn(
              "h-[8px] w-[8px] shrink-0 rounded-full",
              status.open ? "bg-success" : "bg-ring-inactive",
            )}
          />
          {status.label}
        </span>
      ) : (
        <span className="mt-[4px] block text-[13px] leading-[1.5] text-muted">{subtitle}</span>
      )}
    </>
  );

  const classes = cn(
    "oc-card flex min-h-[170px] w-full flex-col items-start rounded-[32px] bg-surface p-[24px] text-start shadow-card transition-[transform,opacity] duration-200 ease-smooth hover:-translate-y-[2px] hover:shadow-floating active:scale-[0.98]",
    className,
  );

  if (href) {
    return (
      <Link href={href} aria-label={accessibleName} className={classes}>
        {content}
      </Link>
    );
  }

  return (
    <button type="button" aria-label={accessibleName} onClick={onClick} className={classes}>
      {content}
    </button>
  );
}
