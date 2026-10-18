"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Dish } from "@/data/dishes";
import { useI18n } from "@/lib/i18n/DictionaryProvider";
import { formatPrice } from "@/lib/format";
import { dishImage } from "@/lib/image";
import { cn } from "@/lib/cn";
import { CircleIconButton } from "@/components/CircleIconButton";
import { ChevronIcon, PlusIcon } from "@/components/icons";
import { anchors, localizedHref } from "@/lib/i18n/anchors";

interface FeaturedCarouselProps {
  dishes: Dish[];
  onAdd: (dish: Dish) => void;
}

export function FeaturedCarousel({ dishes, onAdd }: FeaturedCarouselProps) {
  const { locale, dict, pick } = useI18n();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const count = dishes.length;

  const go = useCallback(
    (next: number) => setIndex(((next % count) + count) % count),
    [count],
  );

  useEffect(() => {
    if (paused || count <= 1) return;
    const timer = setInterval(() => setIndex((value) => (value + 1) % count), 5000);
    return () => clearInterval(timer);
  }, [paused, count]);

  if (count === 0) return null;
  const dish = dishes[Math.min(index, count - 1)] ?? dishes[0];
  const itemHref = localizedHref(locale, anchors.item(dish.id));

  return (
    <section
      aria-roledescription="carousel"
      aria-label={dict.home.featured}
      onPointerDown={() => setPaused(true)}
      onPointerUp={() => setPaused(false)}
      onPointerLeave={() => setPaused(false)}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="relative overflow-hidden rounded-feature bg-feature-gradient">
        <div className="grid gap-4 p-5 pb-6 md:gap-6 md:p-7 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-10 lg:py-12 lg:ps-16 lg:pe-10">
          <div className="order-2 flex min-w-0 flex-col items-start gap-5 text-start lg:order-1 lg:gap-7">
            <div className="min-w-0">
              <p className="text-[0.8125rem] font-bold text-accent md:text-[0.9375rem] lg:text-[1rem]">
                {dict.home.featured}
              </p>
              <h2 className="mt-1 text-[1.5rem] font-extrabold leading-snug text-title md:text-[1.875rem] lg:mt-3 lg:text-[2.75rem] lg:leading-[1.12]">
                <Link href={itemHref} className="rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary">
                  {pick(dish.name)}
                </Link>
              </h2>
              <p className="mt-3 max-w-[30rem] text-[0.875rem] leading-relaxed text-muted md:text-[0.9375rem] lg:text-[1rem]">
                {pick(dish.description)}
              </p>
            </div>

            <div className="flex w-full max-w-[28rem] items-center justify-between gap-3 rounded-full bg-surface p-2 shadow-card md:pe-5 lg:justify-center">
              <CircleIconButton
                label={dict.product.addToCart}
                variant="primary"
                onClick={() => onAdd(dish)}
                className="lg:hidden"
              >
                <PlusIcon className="h-5 w-5" />
              </CircleIconButton>
              <div className="flex items-baseline gap-2 pe-2 text-end">
                {dish.oldPrice ? (
                  <span className="text-[0.8125rem] text-muted md:text-[0.9375rem]">
                    {dict.product.oldPricePrefix}{" "}
                    <span className="line-through">{formatPrice(dish.oldPrice, locale)}</span>
                  </span>
                ) : null}
                <span className="text-[1.5rem] font-extrabold leading-none text-primary md:text-[1.75rem] lg:text-[1.875rem]">
                  {formatPrice(dish.price, locale)}
                </span>
              </div>
            </div>
          </div>

          <Link href={itemHref} aria-label={pick(dish.name)} className="relative order-1 mx-auto block h-[13rem] w-full max-w-[26rem] sm:h-[16rem] md:h-[19rem] lg:order-2 lg:mx-0 lg:h-[26rem] lg:max-w-none">
            <Image
              src={dishImage(dish.image, "large")}
              alt={pick(dish.name)}
              fill
              priority={index === 0}
              sizes="(max-width: 1023px) 80vw, 40rem"
              quality={64}
              className="animate-float object-contain drop-shadow-xl"
            />
            {dish.tag ? (
              <span className="absolute bottom-1 start-1 rounded-full bg-surface px-3 py-1.5 text-[0.75rem] font-bold text-title shadow-card md:text-[0.8125rem] lg:bottom-4 lg:start-4">
                {pick(dish.tag)}
              </span>
            ) : null}
          </Link>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-center gap-4 md:mt-5">
        <button
          type="button"
          onClick={() => go(index - 1)}
          aria-label={dict.common.prev}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-surface text-title shadow-card transition-transform active:scale-90 lg:hidden"
        >
          <ChevronIcon className="h-4 w-4 rotate-180 rtl:rotate-0" />
        </button>

        <div className="flex items-center gap-2">
          {dishes.map((item, dotIndex) => (
            <button
              key={item.id}
              type="button"
              aria-label={dict.carousel.goTo.replace("{index}", String(dotIndex + 1))}
              aria-current={dotIndex === index}
              onClick={() => setIndex(dotIndex)}
              className={cn(
                "h-2 rounded-full transition-all duration-300",
                dotIndex === index ? "w-6 bg-primary" : "w-2 bg-ring-inactive",
              )}
            />
          ))}
        </div>

        <button
          type="button"
          onClick={() => go(index + 1)}
          aria-label={dict.common.next}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-surface text-title shadow-card transition-transform active:scale-90 lg:hidden"
        >
          <ChevronIcon className="h-4 w-4 rtl:rotate-180" />
        </button>
      </div>
    </section>
  );
}
