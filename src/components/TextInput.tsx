"use client";

import { useId } from "react";
import { cn } from "@/lib/cn";

interface TextInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  helper?: string;
  error?: string;
  required?: boolean;
  type?: string;
  inputMode?: "text" | "tel" | "numeric" | "email";
  autoComplete?: string;
}

export function TextInput({
  label,
  value,
  onChange,
  placeholder,
  helper,
  error,
  required,
  type = "text",
  inputMode = "text",
  autoComplete,
}: TextInputProps) {
  const id = useId();
  const helperId = `${id}-helper`;
  const errorId = `${id}-error`;
  const describedBy = error ? errorId : helper ? helperId : undefined;

  return (
    <div className="text-start">
      <label htmlFor={id} className="mb-2 block text-[0.875rem] font-bold text-title">
        {label}
        {required ? <span className="text-danger"> *</span> : null}
      </label>
      <input
        id={id}
        type={type}
        inputMode={inputMode}
        autoComplete={autoComplete}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        required={required}
        aria-invalid={Boolean(error)}
        aria-describedby={describedBy}
        className={cn(
          "h-14 w-full rounded-input border-[1.5px] bg-surface px-4 text-[16px] text-title outline-none transition-colors placeholder:text-muted focus:border-title",
          error ? "border-danger" : "border-line",
        )}
      />
      {helper ? (
        <p id={helperId} className="mt-1.5 text-end text-[0.75rem] font-medium text-danger">
          {helper}
        </p>
      ) : null}
      {error ? (
        <p id={errorId} className="mt-1.5 text-end text-[0.75rem] font-medium text-danger" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
