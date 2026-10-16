"use client";

import { cn } from "@/lib/cn";
import { CircleIconButton } from "@/components/CircleIconButton";
import { ChevronIcon, CloseIcon, MenuIcon } from "@/components/icons";

type HeaderAction = "menu" | "close" | "back";

interface ScreenHeaderProps {
  kicker?: string;
  title: string;
  counter?: string;
  action?: HeaderAction;
  onAction?: () => void;
  actionLabel?: string;
  closeAction?: () => void;
  closeLabel?: string;
  className?: string;
}

export function ScreenHeader({
  kicker,
  title,
  counter,
  action = "menu",
  onAction,
  actionLabel,
  closeAction,
  closeLabel,
  className,
}: ScreenHeaderProps) {
  const leading = action === "close" || action === "back";

  const mainButton = (
    <CircleIconButton
      label={actionLabel ?? (action === "menu" ? "menu" : "close")}
      onClick={onAction}
      variant={action === "menu" ? "white" : "muted"}
      className="lg:hidden"
    >
      {action === "menu" && <MenuIcon className="h-5 w-5" />}
      {action === "close" && <CloseIcon className="h-5 w-5" />}
      {action === "back" && <ChevronIcon className="h-5 w-5 rotate-180 rtl:rotate-0" />}
    </CircleIconButton>
  );

  const closeButton =
    closeAction && !leading ? (
      <CircleIconButton
        label={closeLabel ?? "close"}
        onClick={closeAction}
        variant="muted"
        className="lg:hidden"
      >
        <CloseIcon className="h-5 w-5" />
      </CircleIconButton>
    ) : null;

  return (
    <header className={cn("flex items-start gap-3 pt-4 md:pt-6 lg:pt-10", className)}>
      {closeButton}
      {leading && mainButton}
      <div className="min-w-0 flex-1 text-start">
        {kicker && (
          <p className="text-[0.8125rem] font-medium text-muted md:text-[0.875rem]">{kicker}</p>
        )}
        <h1 className="truncate text-[1.375rem] font-extrabold leading-tight text-title md:text-[1.625rem] lg:text-[1.75rem]">
          {title}
        </h1>
        {counter && (
          <p className="mt-0.5 text-[0.8125rem] font-bold text-accent md:text-[0.875rem]">{counter}</p>
        )}
      </div>
      {!leading && mainButton}
    </header>
  );
}
