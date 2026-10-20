"use client";

import { CircleIconButton } from "@/components/CircleIconButton";
import { MinusIcon, PlusIcon } from "@/components/icons";

interface QuantityStepperProps {
  quantity: number;
  onIncrement: () => void;
  onDecrement: () => void;
  decreaseLabel: string;
  increaseLabel: string;
}

export function QuantityStepper({
  quantity,
  onIncrement,
  onDecrement,
  decreaseLabel,
  increaseLabel,
}: QuantityStepperProps) {
  return (
    <div className="flex items-center gap-3">
      <CircleIconButton label={increaseLabel} variant="primary" size="sm" onClick={onIncrement}>
        <PlusIcon className="h-5 w-5" />
      </CircleIconButton>
      <span
        className="min-w-[1.25rem] text-center text-[1rem] font-bold text-title"
        aria-live="polite"
      >
        {quantity}
      </span>
      <CircleIconButton label={decreaseLabel} variant="muted" size="sm" onClick={onDecrement}>
        <MinusIcon className="h-5 w-5" />
      </CircleIconButton>
    </div>
  );
}
