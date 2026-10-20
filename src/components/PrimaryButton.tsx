"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";
import { SpinnerIcon } from "@/components/icons";

type PrimaryButtonSize = "md" | "lg";

interface PrimaryButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "gradient" | "outline";
  size?: PrimaryButtonSize;
  fullWidth?: boolean;
  icon?: ReactNode;
  loading?: boolean;
}

const sizes: Record<PrimaryButtonSize, string> = {
  md: "h-[3.375rem] text-[1rem] font-bold",
  lg: "h-[60px] text-[17px] font-extrabold",
};

export function PrimaryButton({
  variant = "gradient",
  size = "md",
  fullWidth = true,
  icon,
  loading = false,
  className,
  children,
  disabled,
  ...props
}: PrimaryButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <button
      type="button"
      disabled={isDisabled}
      aria-busy={loading || undefined}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-full px-6 transition-transform duration-200 active:scale-[0.98] disabled:cursor-not-allowed",
        sizes[size],
        fullWidth && "w-full",
        variant === "gradient" && !isDisabled && "bg-primary-gradient text-white shadow-cta",
        variant === "outline" && !isDisabled && "border-[1.5px] border-line bg-surface text-title",
        isDisabled && "bg-disabled text-white shadow-none",
        className,
      )}
      {...props}
    >
      {loading ? <SpinnerIcon className="h-5 w-5 animate-spin" /> : null}
      {!loading ? icon : null}
      {!loading ? children : null}
    </button>
  );
}
