"use client";

import Image from "next/image";
import { dishImage } from "@/lib/image";
import { cn } from "@/lib/cn";

interface CategoryCircleProps {
  label: string;
  image: string;
  active: boolean;
  onClick: () => void;
}

export function CategoryCircle({ label, image, active, onClick }: CategoryCircleProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className="flex w-[4.875rem] shrink-0 flex-col items-center gap-2 lg:w-[6.75rem] lg:gap-3"
    >
      <span
        className={cn(
          "relative h-[4.25rem] w-[4.25rem] overflow-hidden rounded-full bg-surface ring-[3px] transition-colors lg:h-[6rem] lg:w-[6rem]",
          active ? "ring-primary" : "ring-ring-inactive",
        )}
      >
        <Image
          src={dishImage(image, "small")}
          alt=""
          fill
          sizes="(max-width: 1023px) 68px, 96px"
          quality={78}
          className="object-cover"
        />
      </span>
      <span
        className={cn(
          "text-[0.8125rem] lg:text-[0.9375rem]",
          active ? "font-bold text-primary" : "font-medium text-muted",
        )}
      >
        {label}
      </span>
    </button>
  );
}
