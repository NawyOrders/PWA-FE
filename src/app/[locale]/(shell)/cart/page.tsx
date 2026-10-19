"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useI18n } from "@/lib/i18n/DictionaryProvider";
import {
  COUPON_CODE,
  getCartCount,
  getCartItemKey,
  getCartTotals,
  useCartStore,
} from "@/store/cartStore";
import { useUiStore } from "@/store/uiStore";
import { useAuthGuard } from "@/lib/useAuthGuard";
import { useLoadingDelay } from "@/lib/useLoadingDelay";
import { formatPrice } from "@/lib/format";
import { dishImage } from "@/lib/image";
import { getDish } from "@/data/dishes";
import { ScreenHeader } from "@/components/ScreenHeader";
import { CartItemCard } from "@/components/CartItemCard";
import { PrimaryButton } from "@/components/PrimaryButton";
import { EmptyState } from "@/components/EmptyState";
import { Modal } from "@/components/Modal";
import { ArrowEndIcon, CartIcon, CouponIcon } from "@/components/icons";
import { cn } from "@/lib/cn";

export default function CartPage() {
  const { locale, dict, t } = useI18n();
  const router = useRouter();
  const loading = useLoadingDelay();
  const items = useCartStore((state) => state.items);
  const coupon = useCartStore((state) => state.coupon);
  const increment = useCartStore((state) => state.increment);
  const decrement = useCartStore((state) => state.decrement);
  const remove = useCartStore((state) => state.remove);
  const clear = useCartStore((state) => state.clear);
  const applyCoupon = useCartStore((state) => state.applyCoupon);
  const showToast = useUiStore((state) => state.showToast);
  const openDrawer = useUiStore((state) => state.openDrawer);
  const guard = useAuthGuard();

  const [couponInput, setCouponInput] = useState("");
  const [couponMessage, setCouponMessage] = useState<{ tone: "success" | "danger"; text: string } | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const count = getCartCount(items);
  const { subtotal, discount, total } = getCartTotals(items, coupon);
  const resolved = items
    .map((item) => ({ item, dish: getDish(item.dishId) }))
    .filter((entry): entry is { item: typeof entry.item; dish: NonNullable<typeof entry.dish> } =>
      Boolean(entry.dish),
    );

  const handleApplyCoupon = () => {
    const success = applyCoupon(couponInput);
    setCouponMessage({
      tone: success ? "success" : "danger",
      text: success ? dict.cart.couponSuccess : dict.cart.couponError,
    });
  };

  const handleCheckout = () => {
    guard(() => {
      if (items.length === 0) return;
      router.push(`/${locale}/delivery`);
    });
  };

  return (
    <main className="min-h-dvh w-full pb-40 lg:pb-16">
      <div className="container-x">
        <ScreenHeader
          kicker={dict.cart.kicker}
          title={dict.cart.title}
          counter={t(dict.cart.count, { count })}
          action="menu"
          onAction={openDrawer}
          actionLabel={dict.common.menu}
          closeAction={() => router.replace(`/${locale}`)}
          closeLabel={dict.common.close}
        />

        {loading ? (
          <div className="space-y-3 pt-5">
            <div className="skeleton h-[6.25rem] rounded-card" />
            <div className="skeleton h-[6.25rem] rounded-card" />
            <div className="skeleton h-[11.25rem] rounded-card" />
          </div>
        ) : resolved.length === 0 ? (
          <EmptyState
            icon={<CartIcon className="h-8 w-8" />}
            title={dict.cart.empty}
            hint={dict.cart.emptyHint}
            actionLabel={dict.cart.browse}
            onAction={() => router.push(`/${locale}/menu`)}
          />
        ) : (
          <div className="pt-3 lg:grid lg:grid-cols-[minmax(0,1fr)_400px] lg:items-start lg:gap-6">
            <div className="space-y-3">
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setConfirmOpen(true)}
                  className="rounded-full bg-danger-bg px-4 py-2 text-[0.8125rem] font-bold text-danger transition-transform active:scale-95"
                >
                  {dict.cart.deleteAll}
                </button>
              </div>

              <div className="space-y-3">
                {resolved.map(({ item, dish }) => (
                  <CartItemCard
                    key={getCartItemKey(item)}
                    dish={dish}
                    quantity={item.quantity}
                    unitPrice={item.unitPrice ?? dish.price}
                    onIncrement={() => increment(getCartItemKey(item))}
                    onDecrement={() => decrement(getCartItemKey(item))}
                    onDelete={() => {
                      remove(getCartItemKey(item));
                      showToast(dict.toast.removed);
                    }}
                  />
                ))}
              </div>
            </div>

            <aside className="mt-5 space-y-5 lg:sticky lg:top-[calc(var(--header-h)+1.5rem)] lg:mt-0">
              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  handleApplyCoupon();
                }}
              >
                <div className="flex h-14 items-center gap-2 rounded-input border-[1.5px] border-line bg-surface ps-4 pe-2">
                  <CouponIcon className="h-5 w-5 shrink-0 text-muted" />
                  <input
                    value={couponInput}
                    onChange={(event) => setCouponInput(event.target.value)}
                    placeholder={dict.cart.couponPlaceholder}
                    dir="ltr"
                    aria-label={dict.cart.couponPlaceholder}
                    className="h-full min-w-0 flex-1 bg-transparent text-[1rem] text-title outline-none placeholder:text-muted"
                  />
                  <button
                    type="submit"
                    className="h-10 shrink-0 rounded-full bg-primary-gradient px-5 text-[0.875rem] font-bold text-white transition-transform active:scale-95"
                  >
                    {dict.cart.couponApply}
                  </button>
                </div>
              </form>
              {couponMessage ? (
                <p
                  className={cn(
                    "text-[0.8125rem] font-bold",
                    couponMessage.tone === "success" ? "text-success" : "text-danger",
                  )}
                  aria-live="polite"
                >
                  {couponMessage.text}
                </p>
              ) : (
                <p className="text-[0.75rem] text-muted" dir="ltr">
                  {COUPON_CODE}
                </p>
              )}

              <div className="rounded-modal bg-surface p-4 shadow-card">
                <h2 className="text-[1rem] font-extrabold text-title">{dict.cart.summary}</h2>
                <div className="mt-4 space-y-3 text-[0.875rem]">
                  <div className="flex items-center justify-between">
                    <span className="text-muted">{dict.cart.subtotal}</span>
                    <span className="font-bold text-title">{formatPrice(subtotal, locale)}</span>
                  </div>
                  {discount > 0 ? (
                    <div className="flex items-center justify-between">
                      <span className="text-muted">{dict.cart.discount}</span>
                      <span className="font-bold text-success">-{formatPrice(discount, locale)}</span>
                    </div>
                  ) : null}
                  <div className="h-px w-full bg-line" />
                  <div className="flex items-center justify-between">
                    <span className="text-[1rem] font-extrabold text-title">{dict.cart.total}</span>
                    <span className="text-[1.375rem] font-extrabold text-primary">
                      {formatPrice(total, locale)}
                    </span>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-end gap-2">
                  {resolved.slice(0, 4).map(({ item, dish }) => (
                    <div
                      key={item.dishId}
                      className="relative h-10 w-10 overflow-hidden rounded-full border border-line"
                    >
                      <Image
                        src={dishImage(dish.image, "thumb")}
                        alt=""
                        fill
                        sizes="40px"
                        quality={78}
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="hidden lg:block">
                <PrimaryButton
                  onClick={handleCheckout}
                  icon={<ArrowEndIcon className="h-5 w-5 rtl:rotate-180" />}
                >
                  {dict.cart.checkout}
                </PrimaryButton>
              </div>
            </aside>
          </div>
        )}

        {resolved.length > 0 ? (
          <div className="fixed inset-x-0 bottom-0 z-40 mx-auto w-full max-w-[40rem] bg-gradient-to-t from-bg via-bg to-transparent px-4 pt-4 safe-bottom md:px-0 lg:hidden">
            <PrimaryButton
              onClick={handleCheckout}
              icon={<ArrowEndIcon className="h-5 w-5 rtl:rotate-180" />}
            >
              {dict.cart.checkout}
            </PrimaryButton>
          </div>
        ) : null}
      </div>

      <Modal open={confirmOpen} onClose={() => setConfirmOpen(false)} labelledBy="delete-all-title">
        <h2 id="delete-all-title" className="text-[1.25rem] font-extrabold text-title">
          {dict.cart.deleteTitle}
        </h2>
        <p className="mt-2 text-[0.875rem] text-muted">{dict.cart.deleteBody}</p>
        <div className="mt-5 space-y-3">
          <PrimaryButton
            onClick={() => {
              clear();
              setConfirmOpen(false);
            }}
          >
            {dict.common.delete}
          </PrimaryButton>
          <PrimaryButton variant="outline" onClick={() => setConfirmOpen(false)}>
            {dict.common.cancel}
          </PrimaryButton>
        </div>
      </Modal>
    </main>
  );
}
