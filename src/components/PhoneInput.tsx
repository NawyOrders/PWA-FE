"use client";

import { useId } from "react";
import { cn } from "@/lib/cn";
import { toAsciiDigits } from "@/lib/digits";

interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  sendLabel: string;
  ariaLabel?: string;
  placeholder?: string;
  countdown?: number | null;
  countdownLabel?: string;
  error?: string;
}

export function PhoneInput({
  value,
  onChange,
  onSend,
  sendLabel,
  ariaLabel,
  placeholder = "1XXXXXXXXX",
  countdown = null,
  countdownLabel,
  error,
}: PhoneInputProps) {
  const valid = /^\d{10}$/.test(value);
  const errorId = useId();

  return (
    <div className="text-start">
      <div
        className={cn(
          "flex h-14 items-center gap-2 rounded-input border-[1.5px] bg-surface ps-2 pe-2 transition-colors",
          error ? "border-danger" : "border-line",
        )}
      >
        <span className="flex shrink-0 items-center gap-1 rounded-full bg-surface-muted px-3 py-2 text-[0.875rem] font-bold text-title">
          <span aria-hidden>🇪🇬</span>
          <span dir="ltr">+20</span>
        </span>
        <input
          value={value}
          onChange={(event) => onChange(toAsciiDigits(event.target.value).slice(0, 10))}
          inputMode="numeric"
          autoComplete="tel-national"
          dir="ltr"
          aria-label={ariaLabel}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : undefined}
          placeholder={placeholder}
          className="min-w-0 flex-1 bg-transparent text-[16px] tracking-widest text-title outline-none placeholder:tracking-normal placeholder:text-muted"
        />
        <button
          type="button"
          onClick={onSend}
          disabled={!valid}
          className={cn(
            "h-11 shrink-0 rounded-full px-5 text-[0.9375rem] font-bold text-white transition-transform active:scale-95",
            valid ? "bg-primary" : "bg-disabled",
          )}
        >
          {sendLabel}
        </button>
      </div>
      {error ? (
        <p id={errorId} className="mt-1.5 text-end text-[0.75rem] font-medium text-danger">
          {error}
        </p>
      ) : null}
      {countdown !== null && countdownLabel ? (
        <p className="mt-2 text-start text-[0.8125rem] font-bold text-primary" aria-live="polite">
          {countdownLabel}
        </p>
      ) : null}
    </div>
  );
}
