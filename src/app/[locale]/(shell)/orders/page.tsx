"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useI18n } from "@/lib/i18n/DictionaryProvider";
import { useCartStore } from "@/store/cartStore";
import { useOrdersStore } from "@/store/ordersStore";
import { useUiStore } from "@/store/uiStore";
import { useAuthGuard } from "@/lib/useAuthGuard";
import { useLoadingDelay } from "@/lib/useLoadingDelay";
import { formatPrice } from "@/lib/format";
import { dishImage } from "@/lib/image";
import { getDish } from "@/data/dishes";
import type { OrderStatus } from "@/data/orders";
import { ScreenHeader } from "@/components/ScreenHeader";
import { FilterChip } from "@/components/FilterChip";
import { StatusBadge } from "@/components/StatusBadge";
import { PrimaryButton } from "@/components/PrimaryButton";
import { EmptyState } from "@/components/EmptyState";
import { CartIcon } from "@/components/icons";

type Filter = "all" | OrderStatus;

export default function OrdersPage() {
  const { locale, dict, pick, t } = useI18n();
  const router = useRouter();
  const loading = useLoadingDelay();
  const [filter, setFilter] = useState<Filter>("all");
  const orders = useOrdersStore((state) => state.orders);
  const addToCart = useCartStore((state) => state.add);
  const showToast = useUiStore((state) => state.showToast);
  const openDrawer = useUiStore((state) => state.openDrawer);
  const guard = useAuthGuard();

  const filtered = useMemo(
    () => (filter === "all" ? orders : orders.filter((order) => order.status === filter)),
    [filter, orders],
  );

  const handleReorder = (orderId: string) => {
    guard(() => {
      const order = orders.find((item) => item.id === orderId);
      if (!order) return;
      order.items.forEach((item) => {
        for (let index = 0; index < item.quantity; index += 1) {
          addToCart(item.dishId);
        }
      });
      showToast(dict.toast.addedToCart, "success");
      router.push(`/${locale}/cart`);
    });
  };

  const formatDate = (value: string) =>
    new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" }).format(
      new Date(value),
    );

  return (
    <main className="min-h-dvh w-full">
      <div className="container-x">
        <ScreenHeader
          kicker={dict.orders.kicker}
          title={dict.orders.title}
          action="menu"
          onAction={openDrawer}
          actionLabel={dict.common.menu}
          closeAction={() => router.replace(`/${locale}`)}
          closeLabel={dict.common.close}
        />

        <div className="no-scrollbar flex gap-3 overflow-x-auto pt-4">
          <FilterChip active={filter === "all"} onClick={() => setFilter("all")}>
            {dict.orders.filterAll}
          </FilterChip>
          <FilterChip active={filter === "delivered"} onClick={() => setFilter("delivered")}>
            {dict.orders.filterDelivered}
          </FilterChip>
          <FilterChip active={filter === "cancelled"} onClick={() => setFilter("cancelled")}>
            {dict.orders.filterCancelled}
          </FilterChip>
        </div>

        <div className="pt-5 pb-8">
          {loading ? (
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:gap-6">
              <div className="skeleton h-[9.375rem] rounded-card" />
              <div className="skeleton h-[9.375rem] rounded-card" />
            </div>
          ) : filtered.length > 0 ? (
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:gap-6">
              {filtered.map((order) => {
                const total =
                  order.items.reduce((sum, item) => {
                    const dish = getDish(item.dishId);
                    return sum + (dish ? dish.price * item.quantity : 0);
                  }, 0) +
                  order.deliveryFee -
                  (order.discount ?? 0);
                const itemsCount = order.items.reduce((sum, item) => sum + item.quantity, 0);

                return (
                  <article key={order.id} className="space-y-3 rounded-card bg-surface p-4 shadow-card">
                    <div className="flex items-start justify-between gap-2">
                      <div className="text-start">
                        <p className="text-[1rem] font-extrabold text-title">
                          #{order.number}
                        </p>
                        <p className="mt-0.5 text-[0.8125rem] text-muted">{formatDate(order.date)}</p>
                      </div>
                      <StatusBadge status={order.status} label={dict.orders[order.status]} />
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1">
                        {order.items.slice(0, 3).map((item) => {
                          const dish = getDish(item.dishId);
                          if (!dish) return null;
                          return (
                            <div
                              key={item.dishId}
                              className="relative h-11 w-11 overflow-hidden rounded-full border-2 border-surface"
                            >
                              <Image
                                src={dishImage(dish.image, "thumb")}
                                alt={pick(dish.name)}
                                fill
                                sizes="44px"
                                quality={78}
                                className="object-cover"
                              />
                            </div>
                          );
                        })}
                      </div>
                      <div className="text-end">
                        <p className="text-[0.75rem] text-muted">
                          {t(dict.orders.itemsCount, { count: itemsCount })}
                        </p>
                        <p className="text-[1.125rem] font-extrabold text-primary">
                          {formatPrice(total, locale)}
                        </p>
                      </div>
                    </div>

                    <PrimaryButton
                      variant="outline"
                      onClick={() => handleReorder(order.id)}
                    >
                      {dict.orders.reorder}
                    </PrimaryButton>
                  </article>
                );
              })}
            </div>
          ) : (
            <EmptyState
              icon={<CartIcon className="h-8 w-8" />}
              title={dict.orders.empty}
              hint={dict.orders.emptyHint}
              actionLabel={dict.favorites.browse}
              onAction={() => router.push(`/${locale}/menu`)}
            />
          )}
        </div>
      </div>
    </main>
  );
}
