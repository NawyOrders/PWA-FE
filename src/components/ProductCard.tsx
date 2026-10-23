"use client";

import { memo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Dish } from "@/data/dishes";
import { useI18n } from "@/lib/i18n/DictionaryProvider";
import { formatPrice } from "@/lib/format";
import { dishImage, dishBlur } from "@/lib/image";
import { cn } from "@/lib/cn";
import { CircleIconButton } from "@/components/CircleIconButton";
import { HeartIcon, PlusIcon } from "@/components/icons";
import { anchors, localizedHref } from "@/lib/i18n/anchors";

interface ProductCardProps {
  dish: Dish;
  isFavorite: boolean;
  onAdd: () => void;
  onToggleFavorite: () => void;
}

function ProductCardBase({ dish, isFavorite, onAdd, onToggleFavorite }: ProductCardProps) {
  const { locale, dict, pick } = useI18n();
  const itemHref = localizedHref(locale, anchors.item(dish.id));
  const [heartPop, setHeartPop] = useState(false);
  const [addPulse, setAddPulse] = useState(false);

  return (
    <article className="group relative flex items-stretch gap-3 rounded-card bg-surface p-3 shadow-card transition-shadow duration-300 hover:shadow-floating lg:flex-col lg:gap-0 lg:overflow-hidden lg:p-0">
      <Link
        href={itemHref}
        aria-label={pick(dish.name)}
        className="absolute inset-0 z-0 rounded-card focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      />
      <div className="pointer-events-none relative z-10 flex min-w-0 flex-1 flex-col text-start lg:p-4">
        <h2 className="truncate text-[1rem] font-bold text-title lg:text-[1.0625rem]">
          {pick(dish.name)}
        </h2>
        <p className="mt-0.5 line-clamp-1 text-[0.8125rem] text-muted lg:line-clamp-2">
          {pick(dish.description)}
        </p>

        <div className="mt-auto flex items-end justify-between gap-2 pt-2 lg:pt-4">
          <div className="min-w-0">
            {dish.oldPrice ? (
              <p className="truncate text-[0.8125rem] text-muted">
                {dict.product.oldPricePrefix}{" "}
                <span className="line-through">{formatPrice(dish.oldPrice, locale)}</span>
              </p>
            ) : null}
            <p className="text-[1.375rem] font-extrabold leading-none text-primary">
              {formatPrice(dish.price, locale)}
            </p>
          </div>

          <div className="pointer-events-auto relative z-10 flex shrink-0 items-center gap-2">
            <CircleIconButton
              label={isFavorite ? dict.product.unfavorite : dict.product.favorite}
              variant="muted"
              size="sm"
              onClick={() => {
                setHeartPop(true);
                onToggleFavorite();
              }}
            >
              <span
                className={cn("inline-flex", heartPop && "animate-pop")}
                onAnimationEnd={() => setHeartPop(false)}
              >
                <HeartIcon
                  filled={isFavorite}
                  className={cn("h-5 w-5", isFavorite ? "text-primary" : "text-muted")}
                />
              </span>
            </CircleIconButton>
            <CircleIconButton
              label={dict.product.addToCart}
              variant="primary"
              size="sm"
              onClick={() => {
                setAddPulse(true);
                onAdd();
              }}
            >
              <span
                className={cn("inline-flex", addPulse && "animate-pulse-scale")}
                onAnimationEnd={() => setAddPulse(false)}
              >
                <PlusIcon className="h-5 w-5" />
              </span>
            </CircleIconButton>
          </div>
        </div>
      </div>

      <div className="pointer-events-none relative z-10 aspect-square w-[40%] shrink-0 overflow-hidden rounded-image bg-bg lg:order-first lg:aspect-[4/3] lg:w-full lg:rounded-none">
        <Image
          src={dishImage(dish.image, "large")}
          alt=""
          fill
          sizes="(max-width: 1023px) 40vw, 300px"
          quality={72}
          placeholder={dishBlur(dish.image) ? "blur" : "empty"}
          blurDataURL={dishBlur(dish.image)}
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>
    </article>
  );
}

export const ProductCard = memo(ProductCardBase);
