"use client";

import { SearchIcon, CloseIcon } from "@/components/icons";

interface SearchPillProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  placeholder: string;
  buttonLabel: string;
  clearLabel?: string;
}

export function SearchPill({
  value,
  onChange,
  onSubmit,
  placeholder,
  buttonLabel,
  clearLabel,
}: SearchPillProps) {
  return (
    <form
      role="search"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
      className="flex h-[3.75rem] items-center gap-2 rounded-full border-2 border-line bg-surface ps-4 pe-2"
    >
      <SearchIcon className="h-5 w-5 shrink-0 text-muted" />
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
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-muted transition-colors hover:bg-surface-muted hover:text-title"
        >
          <CloseIcon className="h-4 w-4" />
        </button>
      ) : null}
      <button
        type="submit"
        className="h-11 shrink-0 rounded-full bg-surface-muted px-5 text-[0.9375rem] font-bold text-title transition-transform active:scale-95"
      >
        {buttonLabel}
      </button>
    </form>
  );
}
