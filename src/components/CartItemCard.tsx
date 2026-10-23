"use client";

import { memo } from "react";
import Image from "next/image";
import type { Dish } from "@/data/dishes";
import type { ItemAvailability } from "@/lib/checkout";
import { useI18n } from "@/lib/i18n/DictionaryProvider";
import { formatPrice } from "@/lib/format";
import { dishImage } from "@/lib/image";
import { ItemCustomizationDetails } from "@/components/ItemCustomizationDetails";
import { QuantityStepper } from "@/components/QuantityStepper";
import { SwipeToDelete } from "@/components/SwipeToDelete";

interface CartItemCardProps {
  dish: Dish;
  quantity: number;
  unitPrice: number;
  previousUnitPrice?: number;
  availability?: ItemAvailability;
  addonIds: string[];
  note: string;
  editLabel: string;
  onEdit: () => void;
  onIncrement: () => void;
  onDecrement: () => void;
  onDelete: () => void;
}

function CartItemCardBase({
  dish,
  quantity,
  unitPrice,
  previousUnitPrice,
  availability,
  addonIds,
  note,
  editLabel,
  onEdit,
  onIncrement,
  onDecrement,
  onDelete,
}: CartItemCardProps) {
  const { locale, dict, pick } = useI18n();
  const unavailable =
    availability === "out-of-stock" ||
    availability === "inactive" ||
    availability === "missing";
  const availabilityLabel =
    availability === "out-of-stock"
      ? dict.cart.outOfStock
      : availability === "missing"
        ? dict.cart.missingItem
        : dict.cart.inactive;

  return (
    <SwipeToDelete onDelete={onDelete} deleteLabel={dict.common.delete}>
      <article
        className={`flex items-center gap-3 rounded-card bg-surface p-3 shadow-card${unavailable ? " ring-1 ring-danger" : ""}`}
      >
        <div className="flex min-w-0 flex-1 flex-col text-start">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="truncate text-[1rem] font-bold text-title">{pick(dish.name)}</h3>
            {unavailable ? (
              <span className="rounded-full bg-danger-bg px-2 py-0.5 text-[0.6875rem] font-bold text-danger">
                {availabilityLabel}
              </span>
            ) : null}
          </div>
          <div className="mt-0.5 flex min-w-0 flex-wrap items-baseline gap-x-2">
            <p
              className={`shrink-0 text-[1.375rem] font-extrabold ${unavailable ? "text-muted line-through" : "text-primary"}`}
            >
              {formatPrice(unitPrice * quantity, locale)}
            </p>
            <ItemCustomizationDetails
              addonIds={addonIds}
              note={note}
              className="min-w-0 flex-1"
            />
          </div>
          {typeof previousUnitPrice === "number" && previousUnitPrice !== unitPrice ? (
            <p className="mt-0.5 text-[0.75rem] font-bold text-hint-amber-text" role="status">
              {dict.cart.priceChanged}: <s>{formatPrice(previousUnitPrice * quantity, locale)}</s>
            </p>
          ) : null}
          {unavailable ? (
            <p className="mt-1 text-[0.75rem] font-semibold text-danger">
              {dict.cart.removeUnavailable}
            </p>
          ) : null}
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
        <div className="flex shrink-0 flex-col items-center gap-1.5">
          <div className="relative h-[4.5rem] w-[4.5rem] overflow-hidden rounded-image bg-bg">
            <Image
              src={dishImage(dish.image, "small")}
              alt={pick(dish.name)}
              fill
              sizes="72px"
              quality={78}
              className="object-cover"
            />
          </div>
          <button
            type="button"
            onClick={onEdit}
            className="min-h-8 rounded-full px-2 text-[0.75rem] font-bold text-primary underline-offset-2 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            {editLabel}
          </button>
        </div>
      </article>
    </SwipeToDelete>
  );
}

export const CartItemCard = memo(CartItemCardBase);
