"use client";

import Image from "next/image";
import Link from "next/link";

function CheckIcon() {
  return (
    <svg viewBox="0 0 80 80" fill="none" aria-hidden="true">
      <path
        d="m14 41 17 17 37-39"
        stroke="currentColor"
        strokeWidth="8"
        strokeLinecap="square"
        strokeLinejoin="miter"
      />
    </svg>
  );
}

function PlaneIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M21.5 2.8 14.2 21c-.4 1-1.8.9-2.1-.1L9.5 14l-6.9-2.6c-1-.4-.9-1.8.1-2.1l18.2-7.3c.9-.4 1.9.7 1.6 1.8ZM11.2 12.8l2 5.5 5.3-13.1-7.3 7.6Z" />
    </svg>
  );
}

export default function PayConfirmationPage() {
  return (
    <main className="pay-confirmation-page">
      <div className="pay-confirmation-shell">
        <header className="pay-confirmation-topbar">
          <Link
            href="/"
            className="pay-confirmation-close"
            aria-label="إغلاق والعودة إلى القائمة"
          >
            <span aria-hidden="true">×</span>
          </Link>
          <span className="pay-confirmation-support">الدعم الفوري</span>
        </header>

        <section
          className="pay-confirmation-success"
          aria-labelledby="confirmation-title"
        >
          <div className="pay-confirmation-check-halo">
            <span className="pay-confirmation-check-box">
              <CheckIcon />
            </span>
          </div>
          <h1 id="confirmation-title">تم استلام الطلب بنجاح!</h1>
          <p>سيصلك إشعار فور تأكيد الطلب</p>
        </section>

        <section className="pay-confirmation-order" aria-label="رقم الطلب">
          <span className="pay-confirmation-order-icon">
            <Image src="/icons/list.png" alt="" width={24} height={24} />
          </span>
          <div>
            <span>رقم الطلب</span>
            <strong dir="ltr">#NOELB-11254</strong>
          </div>
        </section>

        <section className="pay-confirmation-summary" aria-label="ملخص الطلب">
          <div>
            <strong>الوقت المتبقي للتوصيل</strong>
            <span className="pay-confirmation-time">30-45 دقيقة</span>
          </div>
          <div>
            <strong>إجمالي الطلب</strong>
            <span>250 جـ</span>
          </div>
        </section>

        <div className="pay-confirmation-actions">
          <Link href="/tracking" className="pay-confirmation-track">
            تتبع الطلب
            <PlaneIcon />
          </Link>
          <Link className="pay-confirmation-home" href="/">
            العودة للرئيسية
          </Link>
        </div>
        <div className="pay-confirmation-home-indicator" aria-hidden="true" />
      </div>
    </main>
  );
}
