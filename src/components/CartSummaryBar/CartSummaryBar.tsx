"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CartIcon } from "@/components/icons";
import { formatPrice } from "@/lib/format";
import { useI18n } from "@/lib/i18n/DictionaryProvider";
import { useOrderConfirmed } from "@/lib/orderStatus";
import {
  getCartCount,
  getCartTotals,
  useCartStore,
} from "@/store/cartStore";
import "./CartSummaryBar.css";

const CART_BAR_ROUTES = new Set(["", "menu", "search", "favorites", "orders"]);

export function CartSummaryBar() {
  const pathname = usePathname();
  const { locale, dict, t } = useI18n();
  const items = useCartStore((state) => state.items);
  const coupon = useCartStore((state) => state.coupon);
  const orderConfirmed = useOrderConfirmed();

  const route = pathname
    .replace(/^\/(ar|en)(?=\/|$)/, "")
    .replace(/^\//, "");
  const count = getCartCount(items);

  if (orderConfirmed || !CART_BAR_ROUTES.has(route) || count === 0) return null;

  const { total } = getCartTotals(items, coupon);

  return (
    <>
      <div className="cart-summary-spacer" aria-hidden="true" />
      <aside className="cart-summary-dock" aria-label={dict.cart.summary}>
        <div className="cart-summary-bar" dir="ltr">
          <svg
            className="cart-summary-shape"
            viewBox="0 0 390 180"
            preserveAspectRatio="none"
            aria-hidden="true"
            style={{ transform: "scaleX(var(--dir-scale, 1))" }}
          >
            <defs>
              <linearGradient id="cart-summary-gradient" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#ef3d23" />
                <stop offset="100%" stopColor="#ff7939" />
              </linearGradient>
            </defs>
            <path
              d="M0 66 C0 54 10 47 24 47 C48 47 58 35 82 33 C109 31 128 49 151 54 C174 59 186 45 204 38 C229 28 248 31 268 44 C286 56 303 57 320 51 C338 45 359 43 377 50 C391 54 400 61 400 73 L400 180 L0 180 Z"
              fill="url(#cart-summary-gradient)"
            />
          </svg>
          <Link
            className="cart-summary-view"
            href={`/${locale}/cart`}
            aria-label={t(dict.cart.count, { count })}
          >
            <CartIcon className="cart-summary-icon" />
            <span>{dict.cart.viewCart}</span>
          </Link>

          <div className="cart-summary-total" dir="ltr">
            <div className="cart-summary-amount" dir={locale === "ar" ? "rtl" : "ltr"}>
              <span className="cart-summary-label">
                {locale === "ar" ? "المبلغ الإجمالي" : dict.cart.total}
              </span>
              <strong>{formatPrice(total, locale)}</strong>
            </div>
            <span className="cart-summary-count" aria-live="polite" aria-atomic="true">
              {count}
            </span>
          </div>
        </div>
      </aside>
    </>
  );
}
