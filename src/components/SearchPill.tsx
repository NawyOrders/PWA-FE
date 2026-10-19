"use client";

import { SearchIcon, CloseIcon } from "@/components/icons";
import { cn } from "@/lib/cn";

interface SearchPillProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  placeholder: string;
  buttonLabel: string;
  clearLabel?: string;
  size?: "md" | "lg";
}

export function SearchPill({
  value,
  onChange,
  onSubmit,
  placeholder,
  buttonLabel,
  clearLabel,
  size = "md",
}: SearchPillProps) {
  const large = size === "lg";

  return (
    <form
      role="search"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
      className={cn(
        "flex items-center gap-2 border-2 border-line bg-surface",
        large
          ? "h-[72px] rounded-[28px] ps-5 pe-2 focus-within:border-hint-amber"
          : "h-[3.75rem] rounded-full ps-4 pe-2",
      )}
    >
      {large ? null : <SearchIcon className="h-5 w-5 shrink-0 text-muted" />}
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        dir="auto"
        enterKeyHint="search"
        className="h-full min-w-0 flex-1 bg-transparent text-[16px] text-title outline-none placeholder:text-muted"
      />
      {value ? (
        <button
          type="button"
          onClick={() => onChange("")}
          aria-label={clearLabel}
          className={cn(
            "flex shrink-0 items-center justify-center rounded-full text-muted transition-colors hover:bg-surface-muted hover:text-title",
            large ? "h-10 w-10" : "h-9 w-9",
          )}
        >
          <CloseIcon className={large ? "h-5 w-5" : "h-4 w-4"} />
        </button>
      ) : null}
      {large ? (
        <button
          type="submit"
          aria-label={buttonLabel}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] bg-primary-gradient text-white shadow-cta transition-transform active:scale-95"
        >
          <SearchIcon className="h-5 w-5" />
        </button>
      ) : (
        <button
          type="submit"
          className="h-11 shrink-0 rounded-full bg-surface-muted px-5 text-[0.9375rem] font-bold text-title transition-transform active:scale-95"
        >
          {buttonLabel}
        </button>
      )}
    </form>
  );
}
