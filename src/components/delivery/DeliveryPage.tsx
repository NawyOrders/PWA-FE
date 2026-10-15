"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

type FulfillmentMethod = "delivery" | "pickup";

const items = [
  { name: "برجر لحم بلدي", quantity: 1, image: "/burger.png" },
  { name: "برجر لحم بلدي", quantity: 1, image: "/burger.png" },
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
          <strong>{isDelivery ? "التوصيل" : "الاستلام"}</strong>
          <span
            className={`fulfillment-fee ${isDelivery ? "fee-paid" : "fee-free"}`}
          >
            {isDelivery ? "يوجد رسوم توصيل" : "بدون رسوم توصيل"}
          </span>
        </span>
        <span className="fulfillment-description">
          {isDelivery
            ? "سيصلك الطلب حتى باب المنزل لكن سيتم إضافة رسوم التوصيل على ثمن الطلب"
            : "حي النخيل، شارع السلطان محمد فرع الملك، الإسكندرية، مصر"}
        </span>
      </span>
    </button>
  );
}

function OrderSummary({ method }: { method: FulfillmentMethod }) {
  const deliveryFee = method === "delivery" ? 30 : 0;
  const total = 240 + deliveryFee - 20;

  return (
    <section className="fulfillment-summary" aria-labelledby="fulfillment-summary-title">
      <h2 id="fulfillment-summary-title">ملخص الطلب بعد اختيار طريقة الاستلام</h2>
      <div className="summary-lines">
        <span className="summary-labels"><span>المجموع الفرعي</span><span>رسوم التوصيل</span><span>الخصم</span></span>
        <span className="summary-values"><strong>240 جــ</strong><strong>{method === "delivery" ? "30 جــ" : "0 جــ"}</strong><strong className="summary-discount">20 جــ</strong></span>
      </div>
      <div className="summary-divider" />
      <div className="summary-bottom">
        <div className="summary-thumbnails" aria-label="عنصران في الطلب">
          {items.map((item, index) => <span className="summary-thumb" key={`${item.name}-${index}`}><Image src={item.image} alt={item.name} fill sizes="72px" /></span>)}
        </div>
        <div className="summary-total"><span>الإجمالي</span><strong>{total === 250 ? "250" : "220"} جــ</strong></div>
      </div>
    </section>
  );
}

export default function DeliveryPage() {
  const router = useRouter();
  const [method, setMethod] = useState<FulfillmentMethod>("delivery");

  function confirmFulfillment() {
    if (method === "pickup") {
      router.push("/restLocation");
      return;
    }

    router.push("/address");
  }

  return (
    <main className="fulfillment-page">
      <div className="fulfillment-shell">
        <header className="fulfillment-header">
          <Link className="fulfillment-back" href="/menu" aria-label="العودة إلى القائمة"><Icon name="arrow" /></Link>
          <div><h1>طريقة الاستلام</h1><p>عنوان أو فرع</p></div>
        </header>

        <section className="fulfillment-card" aria-labelledby="fulfillment-title">
          <h2 id="fulfillment-title">اختر طريقة استلام الطلب</h2>
          <p className="fulfillment-intro">يرجى اختيار طريقة الاستلام سواء توصيل حتى باب المنزل أو العمل او عن طريق استلام الطلب من أحد فروعنا</p>
          <div className="fulfillment-options" role="radiogroup" aria-label="طريقة الاستلام">
            <FulfillmentOption method="delivery" selected={method === "delivery"} onSelect={setMethod} />
            <FulfillmentOption method="pickup" selected={method === "pickup"} onSelect={setMethod} />
          </div>
        </section>

        <OrderSummary method={method} />

        <div className="fulfillment-action-wrap">
          <button className="fulfillment-confirm" type="button" onClick={confirmFulfillment}>
            تأكيد طريقة الاستلام
          </button>
        </div>
        <div className="fulfillment-home-indicator" aria-hidden="true"><span /></div>
      </div>
    </main>
  );
}
