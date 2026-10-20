"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useI18n } from "@/lib/i18n";
import { useOrderConfirmed } from "@/lib/orderStatus";
import "./OrderTrackingCard.css";

const TRACKING_CARD_ROUTES = new Set(["", "menu", "search", "favorites", "orders"]);

function TrackIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M21.5 2.8 14.2 21c-.4 1-1.8.9-2.1-.1L9.5 14l-6.9-2.6c-1-.4-.9-1.8.1-2.1l18.2-7.3c.9-.4 1.9.7 1.6 1.8ZM11.2 12.8l2 5.5 5.3-13.1-7.3 7.6Z" />
    </svg>
  );
}

export function OrderTrackingCard() {
  const pathname = usePathname();
  const { locale, t, href } = useI18n();
  const orderConfirmed = useOrderConfirmed();

  const route = pathname
    .replace(/^\/(ar|en)(?=\/|$)/, "")
    .replace(/^\//, "");

  if (!orderConfirmed || !TRACKING_CARD_ROUTES.has(route)) return null;

  return (
    <aside
      className="order-tracking-dock"
      aria-label={t("deliveryTimeRemaining")}
    >
      <div className="order-tracking-card" dir="ltr">
        <svg
          className="order-tracking-shape"
          viewBox="0 0 400 400"
          preserveAspectRatio="none"
          aria-hidden="true"
          focusable="false"
        >
          <defs>
            <linearGradient
              id="order-tracking-gradient"
              x1="0"
              y1="0"
              x2="1"
              y2="1"
            >
              <stop offset="0%" stopColor="#ef3d23" />
              <stop offset="100%" stopColor="#ff7939" />
            </linearGradient>
          </defs>
          <path
            d="M400 0 L400 400 L0 400
       C 5 360 20 300 45 275
       C 65 255 100 245 130 232
       C 165 218 160 200 166 178
       C 172 150 200 135 235 118
       C 270 102 285 95 295 75
       C 305 50 315 25 340 12
       C 360 3 385 0 400 0 Z"
            fill="url(#order-tracking-gradient)"
          />
        </svg>

        <div
          className="order-tracking-copy"
          dir={locale === "ar" ? "rtl" : "ltr"}
        >
          <span className="order-tracking-label">
            {locale === "ar" ? (
              <>
                <span>الوقت</span>
                <span>المتبقي للتوصيل</span>
              </>
            ) : (
              t("deliveryTimeRemaining")
            )}
          </span>
          <strong className="order-tracking-time">
            {t("within")} {t("deliveryTime")}
          </strong>
          <Link className="order-tracking-link" href={href("/tracking")}>
            <TrackIcon />
            <span>{t("trackOrder")}</span>
          </Link>
        </div>
      </div>
    </aside>
  );
}
