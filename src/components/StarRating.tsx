"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { cn } from "@/lib/cn";
import { StarIcon } from "@/components/icons";
import "./StarRating.css";

interface StarRatingProps {
  id: string;
  label: string;
  value: number;
  onChange: (value: number) => void;
  starLabels: string[];
  hints?: string[];
  chooseHint?: string;
  error?: string | null;
  disabled?: boolean;
  onBlur?: () => void;
  className?: string;
}

export function StarRating({
  id,
  label,
  value,
  onChange,
  starLabels,
  hints,
  chooseHint,
  error,
  disabled,
  onBlur,
  className,
}: StarRatingProps) {
  const [hover, setHover] = useState(0);
  const [hoverable, setHoverable] = useState(false);
  const refs = useRef<Array<HTMLButtonElement | null>>([]);

  useEffect(() => {
    const media = window.matchMedia("(hover: hover)");
    const update = () => setHoverable(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  const preview = hover > 0 ? hover : value;
  const hint = value > 0 ? hints?.[value - 1] ?? "" : chooseHint ?? "";
  const labelId = `${id}-label`;
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const rtl = document.documentElement.dir === "rtl";
    let next: number;
    if (event.key === "ArrowRight") next = index + (rtl ? -1 : 1);
    else if (event.key === "ArrowLeft") next = index + (rtl ? 1 : -1);
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = 4;
    else return;
    event.preventDefault();
    const clamped = Math.min(4, Math.max(0, next));
    setHover(0);
    onChange(clamped + 1);
    refs.current[clamped]?.focus();
  };

  return (
    <div className={className}>
      <p id={labelId} className="text-[16px] font-extrabold leading-[1.4] text-title">
        {label}
      </p>
      <div
        role="radiogroup"
        aria-labelledby={labelId}
        aria-describedby={error ? `${hintId} ${errorId}` : hintId}
        aria-invalid={error ? true : undefined}
        onBlur={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget as Node | null)) onBlur?.();
        }}
        className="mt-[16px] flex items-center justify-center gap-[12px]"
      >
        {starLabels.map((starLabel, index) => {
          const star = index + 1;
          const selected = value === star;
          const filled = preview >= star;
          return (
            <button
              key={star}
              ref={(element) => {
                refs.current[index] = element;
              }}
              type="button"
              role="radio"
              aria-checked={selected}
              aria-label={starLabel}
              tabIndex={selected || (value === 0 && index === 0) ? 0 : -1}
              disabled={disabled}
              data-filled={filled ? "true" : "false"}
              onClick={() => onChange(star)}
              onKeyDown={(event) => handleKeyDown(event, index)}
              onMouseEnter={() => {
                if (hoverable) setHover(star);
              }}
              onMouseLeave={() => setHover(0)}
              className="fb-star"
            >
              <span
                key={selected ? `selected-${value}` : "idle"}
                className={cn("fb-star-glyph", selected && "fb-star-pop")}
              >
                <StarIcon filled className="h-[24px] w-[24px]" />
              </span>
            </button>
          );
        })}
      </div>
      <p id={hintId} aria-live="polite" className="mt-[12px] text-center text-[14px] leading-[1.5] text-muted">
        {hint}
      </p>
      {error ? (
        <p id={errorId} aria-live="polite" className="mt-[8px] text-center text-[12px] font-medium text-danger">
          {error}
        </p>
      ) : null}
    </div>
  );
}
