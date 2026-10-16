"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

interface PrimaryButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "gradient" | "outline";
  fullWidth?: boolean;
  icon?: ReactNode;
}

export function PrimaryButton({
  variant = "gradient",
  fullWidth = true,
  icon,
  className,
  children,
  disabled,
  ...props
}: PrimaryButtonProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      className={cn(
        "inline-flex h-[3.375rem] items-center justify-center gap-2 rounded-full px-6 text-[1rem] font-bold transition-transform duration-200 active:scale-[0.98] disabled:cursor-not-allowed",
        fullWidth && "w-full",
        variant === "gradient" && "bg-primary-gradient text-white shadow-cta",
        variant === "outline" && "border-[1.5px] border-line bg-surface text-title",
        disabled && "bg-disabled text-white shadow-none",
        className,
      )}
      {...props}
    >
      {icon}
      {children}
    </button>
  );
}
