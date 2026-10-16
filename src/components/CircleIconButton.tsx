"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

type CircleVariant = "white" | "muted" | "primary" | "danger";
type CircleSize = "sm" | "md" | "lg";

interface CircleIconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  variant?: CircleVariant;
  size?: CircleSize;
  children: ReactNode;
}

const sizes: Record<CircleSize, string> = {
  sm: "h-11 w-11",
  md: "h-11 w-11",
  lg: "h-12 w-12",
};

const variants: Record<CircleVariant, string> = {
  white: "bg-surface text-title shadow-card",
  muted: "bg-surface-muted text-title",
  primary: "bg-primary text-white shadow-cta",
  danger: "bg-danger-bg text-danger",
};

export function CircleIconButton({
  label,
  variant = "white",
  size = "md",
  className,
  children,
  ...props
}: CircleIconButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full transition-transform duration-200 active:scale-90 disabled:cursor-not-allowed disabled:opacity-50",
        sizes[size],
        variants[variant],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
