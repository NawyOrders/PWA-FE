"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useI18n } from "@/lib/i18n";

type FulfillmentMethod = "delivery" | "pickup";

const items = [
  { id: "burger-1", image: "/burger.png" },
  { id: "burger-2", image: "/burger.png" },
];

function Icon({ name }: { name: "arrow" | "radio" | "check" }) {
  if (name === "arrow") return <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M19 12H5m7 7-7-7 7-7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>;
  if (name === "check") return <svg viewBox="0 0 24 2" fill="none" aria-hidden="true"><path d="m5 12 4 4L19 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>;
  return <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2"/><circle cx="12" cy="12" r="5" fill="currentColor"/></svg>;
}

function FulfillmentOption({
  method,
  selected,
  onSelect,
}: {
  method: FulfillmentMethod;
  selected: boolean;
  onSelect: (method: FulfillmentMethod) => void;
}) {
  const { t } = useI18n();
  const isDelivery = method === "delivery";

  return (
    <button
      className={`fulfillment-option${selected ? " is-selected" : ""}`}
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={() => onSelect(method)}
    >
      <span className="fulfillment-radio" aria-hidden="true">
        {selected && <span />}
      </span>
      <span className="fulfillment-copy">
        <span className="fulfillment-option-heading">
          <strong>{isDelivery ? t("delivery") : t("pickup")}</strong>
          <span
            className={`fulfillment-fee ${isDelivery ? "fee-paid" : "fee-free"}`}
          >
            {isDelivery ? t("deliveryFeeTag") : t("noDeliveryFee")}
          </span>
        </span>
        <span className="fulfillment-description">
          {isDelivery
            ? t("deliveryDescription")
            : t("pickupAddress")}
        </span>
      </span>
    </button>
  );
}

function OrderSummary({ method }: { method: FulfillmentMethod }) {
  const { t } = useI18n();
  const deliveryFee = method === "delivery" ? 30 : 0;
  const total = 240 + deliveryFee - 20;

  return (
    <section className="fulfillment-summary" aria-labelledby="fulfillment-summary-title">
      <h2 id="fulfillment-summary-title">{t("orderSummaryFulfillment")}</h2>
      <div className="summary-lines">
        <span className="summary-labels"><span>{t("subtotal")}</span><span>{t("deliveryFee")}</span><span>{t("discount")}</span></span>
        <span className="summary-values"><strong>240 {t("currencyShort")}</strong><strong>{method === "delivery" ? 30 : 0} {t("currencyShort")}</strong><strong className="summary-discount">20 {t("currencyShort")}</strong></span>
      </div>
      <div className="summary-divider" />
      <div className="summary-bottom">
        <div className="summary-thumbnails" aria-label={t("orderItemsCount")}>
          {items.map((item) => <span className="summary-thumb" key={item.id}><Image src={item.image} alt={t("itemImageAlt")} fill sizes="72px" /></span>)}
        </div>
        <div className="summary-total"><span>{t("total")}</span><strong>{total} {t("currencyShort")}</strong></div>
      </div>
    </section>
  );
}

export default function DeliveryPage() {
  const router = useRouter();
  const { t, href } = useI18n();
  const [method, setMethod] = useState<FulfillmentMethod>("delivery");

  function confirmFulfillment() {
    if (method === "pickup") {
      router.push(href("/restLocation"));
      return;
    }

    router.push(href("/address"));
  }

  return (
    <main className="fulfillment-page">
      <div className="fulfillment-shell">
        <header className="fulfillment-header">
          <Link className="fulfillment-back" href={href("/")} aria-label={t("backToHome")}><Icon name="arrow" /></Link>
          <div><h1>{t("deliveryMethod")}</h1><p>{t("addressOrBranch")}</p></div>
        </header>

        <section className="fulfillment-card" aria-labelledby="fulfillment-title">
          <h2 id="fulfillment-title">{t("chooseFulfillment")}</h2>
          <p className="fulfillment-intro">{t("fulfillmentIntro")}</p>
          <div className="fulfillment-options" role="radiogroup" aria-label={t("deliveryMethod")}>
            <FulfillmentOption method="delivery" selected={method === "delivery"} onSelect={setMethod} />
            <FulfillmentOption method="pickup" selected={method === "pickup"} onSelect={setMethod} />
          </div>
        </section>

        <OrderSummary method={method} />

        <div className="fulfillment-action-wrap">
          <button className="fulfillment-confirm" type="button" onClick={confirmFulfillment}>
            {t("confirmFulfillment")}
          </button>
        </div>
        <div className="fulfillment-home-indicator" aria-hidden="true"><span /></div>
      </div>
    </main>
  );
}
