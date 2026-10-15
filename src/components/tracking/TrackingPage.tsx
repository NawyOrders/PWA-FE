"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

type NoticeKind = "contact" | "cancel";

const orderSteps = [
  {
    id: "received",
    title: "تم استلام الطلب",
    description: "06:51 م",
    icon: null,
    state: "complete",
  },
  {
    id: "preparing",
    title: "جاري التحضير",
    description: "الشيف يحضر طلبك الآن",
    badge: "جاري الآن",
    icon: "/icons/knifefork.svg",
    state: "current",
  },
  {
    id: "on-the-way",
    title: "مع المندوب",
    description: "في الطريق إليك",
    icon: "/icons/motorcycle.svg",
    state: "upcoming",
  },
  {
    id: "delivered",
    title: "تم التوصيل",
    description: "بانتظار الوصول",
    icon: "/icons/shoppingbasket.svg",
    state: "upcoming",
  },
] as const;

function ArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M19 12H5m7 7-7-7 7-7"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function TrackingNotice({
  kind,
  onClose,
}: {
  kind: NoticeKind;
  onClose: () => void;
}) {
  const isCancel = kind === "cancel";
  return (
    <div
      className="tracking-notice-backdrop"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        className="tracking-notice"
        role="dialog"
        aria-modal="true"
        aria-labelledby="tracking-notice-title"
      >
        <button
          className="tracking-notice-close"
          type="button"
          onClick={onClose}
          aria-label="إغلاق"
        >
          ×
        </button>
        <h2 id="tracking-notice-title">
          {isCancel ? "إلغاء الطلب" : "التواصل مع المطعم"}
        </h2>
        <p>
          {isCancel
            ? "لا يمكن إلغاء الطلب من التطبيق حالياً. يُرجى التواصل مع المطعم مباشرة للمساعدة."
            : "رقم هاتف المطعم غير متوفر ضمن بيانات هذا الطلب حالياً."}
        </p>
        <button className="tracking-notice-ok" type="button" onClick={onClose}>
          حسناً
        </button>
      </section>
    </div>
  );
}

export default function TrackingPage() {
  const [notice, setNotice] = useState<NoticeKind | null>(null);

  return (
    <main className="tracking-page">
      <div className="tracking-shell">
        <header className="tracking-header">
          <Link
            className="tracking-back"
            href="/payConfirmation"
            aria-label="العودة لتأكيد الطلب"
          >
            <ArrowIcon />
          </Link>
          <div>
            <h1>تتبع الطلب</h1>
            <p>
              رقم <bdi dir="ltr">#NOELB-11254</bdi>
            </p>
          </div>
        </header>

        <section className="tracking-eta" aria-label="الوقت المتبقي للتوصيل">
          <span className="tracking-eta-icon">
            <Image src="/icons/time.svg" alt="" width={23} height={23} />
          </span>
          <div>
            <span>الوقت المتبقي للتوصيل</span>
            <strong>خلال 30 - 45 دقيقة</strong>
          </div>
        </section>

        <ol className="tracking-timeline" aria-label="مراحل الطلب">
          {orderSteps.map((step) => (
            <li
              className={`tracking-step is-${step.state}`}
              key={step.id}
              aria-current={step.state === "current" ? "step" : undefined}
            >
              <span className="tracking-step-marker" aria-hidden="true">
                {step.icon ? (
                  <Image src={step.icon} alt="" width={28} height={28} />
                ) : (
                  <span className="tracking-check">✓</span>
                )}
              </span>
              <div className="tracking-step-copy">
                {"badge" in step && (
                  <span className="tracking-current-badge">{step.badge}</span>
                )}
                <strong>{step.title}</strong>
                <span>{step.description}</span>
              </div>
            </li>
          ))}
        </ol>

        <section className="tracking-courier" aria-label="مندوب التوصيل">
          <span className="tracking-courier-art">
            <Image src="/icons/motorcycle.svg" alt="" width={44} height={44} />
          </span>
          <div className="tracking-courier-copy">
            <strong>أحمد مصطفى</strong>
            <span>مندوب التوصيل</span>
          </div>
          <div className="tracking-courier-avatar" aria-hidden="true">
            أم
          </div>
        </section>

        <div className="tracking-actions">
          <button
            type="button"
            className="tracking-contact"
            onClick={() => setNotice("contact")}
          >
            <Image src="/icons/phonecall.svg" alt="" width={23} height={23} />
            اتصل بالمطعم
          </button>
          <button
            type="button"
            className="tracking-cancel"
            onClick={() => setNotice("cancel")}
          >
            <span>×</span>
            إلغاء الطلب
          </button>
        </div>
        <div className="tracking-home-indicator" aria-hidden="true" />
      </div>
      {notice && (
        <TrackingNotice kind={notice} onClose={() => setNotice(null)} />
      )}
    </main>
  );
}
