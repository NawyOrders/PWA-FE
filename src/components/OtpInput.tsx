"use client";

import { useRef, type ClipboardEvent, type KeyboardEvent } from "react";
import { cn } from "@/lib/cn";
import { toAsciiDigits } from "@/lib/digits";

interface OtpInputProps {
  value: string;
  onChange: (value: string) => void;
  error?: boolean;
  length?: number;
  ariaLabel: string;
  disabled?: boolean;
}

function toChars(value: string, length: number): string[] {
  const chars: string[] = [];
  for (let index = 0; index < length; index += 1) chars[index] = value[index] ?? "";
  return chars;
}

export function OtpInput({
  value,
  onChange,
  error = false,
  length = 6,
  ariaLabel,
  disabled = false,
}: OtpInputProps) {
  const refs = useRef<Array<HTMLInputElement | null>>([]);

  const focusAt = (index: number) => {
    const clamped = Math.max(0, Math.min(length - 1, index));
    refs.current[clamped]?.focus();
    refs.current[clamped]?.select();
  };

  const commit = (chars: string[]) => {
    onChange(chars.join("").slice(0, length));
  };

  const handleInput = (index: number, raw: string) => {
    const digits = toAsciiDigits(raw);
    const chars = toChars(value, length);
    if (!digits) {
      chars[index] = "";
      commit(chars);
      return;
    }
    let cursor = index;
    for (const digit of digits) {
      if (cursor >= length) break;
      chars[cursor] = digit;
      cursor += 1;
    }
    commit(chars);
    focusAt(cursor);
  };

  const handleKeyDown = (index: number, event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Backspace") {
      event.preventDefault();
      const chars = toChars(value, length);
      if (chars[index]) {
        chars[index] = "";
        commit(chars);
        return;
      }
      let target = index - 1;
      while (target >= 0 && !chars[target]) target -= 1;
      if (target >= 0) {
        chars[target] = "";
        commit(chars);
        focusAt(target);
      }
      return;
    }
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      focusAt(index - 1);
    }
    if (event.key === "ArrowRight") {
      event.preventDefault();
      focusAt(index + 1);
    }
  };

  const handlePaste = (event: ClipboardEvent<HTMLInputElement>) => {
    const text = toAsciiDigits(event.clipboardData.getData("text")).slice(0, length);
    if (!text) return;
    event.preventDefault();
    commit(toChars(text, length));
    focusAt(text.length);
  };

  return (
    <div
      dir="ltr"
      role="group"
      aria-label={ariaLabel}
      className={cn("flex w-full justify-center gap-1.5 sm:gap-2", error && "animate-shake")}
    >
      {Array.from({ length }).map((_, index) => {
        const char = value[index] ?? "";
        return (
          <input
            key={index}
            ref={(element) => {
              refs.current[index] = element;
            }}
            value={char}
            onChange={(event) => handleInput(index, event.target.value)}
            onKeyDown={(event) => handleKeyDown(index, event)}
            onPaste={handlePaste}
            onFocus={(event) => event.target.select()}
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={1}
            disabled={disabled}
            aria-label={`${ariaLabel} ${index + 1}`}
            aria-invalid={error}
            className={cn(
              "h-14 w-full min-w-0 max-w-[3rem] flex-1 basis-0 rounded-image border-[1.5px] bg-surface text-center text-[1.25rem] font-bold outline-none transition-colors disabled:cursor-not-allowed",
              char ? "border-primary text-primary" : "border-line text-title",
              "focus:border-2 focus:border-title",
              disabled && "opacity-60",
            )}
          />
        );
      })}
    </div>
  );
}
