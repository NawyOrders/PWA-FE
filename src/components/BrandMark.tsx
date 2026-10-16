import { brand } from "@/lib/brand";
import { cn } from "@/lib/cn";
import type { Locale } from "@/lib/i18n/types";

interface BrandMarkProps {
  locale: Locale;
  className?: string;
  showName?: boolean;
}

export function BrandMark({ locale, className, showName = true }: BrandMarkProps) {
  const name = brand.name[locale];

  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <span
        aria-hidden
        className="grid h-9 w-9 shrink-0 place-items-center rounded-2xl bg-primary-gradient text-[1rem] font-black text-white shadow-cta"
      >
        {name.slice(0, 1)}
      </span>
      {showName ? (
        <span className="text-[1.125rem] font-extrabold tracking-tight text-title">
          {brand.name[locale]}
        </span>
      ) : null}
    </span>
  );
}
