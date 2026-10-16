"use client";

import { memo } from "react";
import Image from "next/image";
import type { Dish } from "@/data/dishes";
import { useI18n } from "@/lib/i18n/DictionaryProvider";
import { formatPrice } from "@/lib/format";
import { dishImage } from "@/lib/image";
import { QuantityStepper } from "@/components/QuantityStepper";
import { SwipeToDelete } from "@/components/SwipeToDelete";

interface CartItemCardProps {
  dish: Dish;
  quantity: number;
  onIncrement: () => void;
  onDecrement: () => void;
  onDelete: () => void;
}

function CartItemCardBase({
  dish,
  quantity,
  onIncrement,
  onDecrement,
  onDelete,
}: CartItemCardProps) {
  const { locale, dict, pick } = useI18n();

  return (
    <SwipeToDelete onDelete={onDelete} deleteLabel={dict.common.delete}>
      <article className="flex items-center gap-3 rounded-card bg-surface p-3 shadow-card">
        <div className="flex min-w-0 flex-1 flex-col text-start">
          <h3 className="truncate text-[1rem] font-bold text-title">{pick(dish.name)}</h3>
          <p className="mt-0.5 text-[1.375rem] font-extrabold text-primary">
            {formatPrice(dish.price, locale)}
          </p>
          <div className="mt-2">
            <QuantityStepper
              quantity={quantity}
              onIncrement={onIncrement}
              onDecrement={onDecrement}
              decreaseLabel={dict.product.decrease}
              increaseLabel={dict.product.increase}
            />
          </div>
        </div>
        <div className="relative h-[4.5rem] w-[4.5rem] shrink-0 overflow-hidden rounded-image bg-bg">
          <Image
            src={dishImage(dish.image, "small")}
            alt={pick(dish.name)}
            fill
            sizes="72px"
            quality={78}
            className="object-cover"
          />
        </div>
      </article>
    </SwipeToDelete>
  );
}

export const CartItemCard = memo(CartItemCardBase);
