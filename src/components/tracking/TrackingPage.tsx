"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useI18n } from "@/lib/i18n";

type NoticeKind = "contact" | "cancel";
const steps = [
  { id: "received", title: "received", description: "receivedTime", icon: null, state: "complete" },
  { id: "preparing", title: "preparing", description: "chefPreparing", badge: "inProgress", icon: "/icons/knifefork.svg", state: "current" },
  { id: "on-the-way", title: "withCourier", description: "onTheWay", icon: "/icons/motorcycle.svg", state: "upcoming" },
  { id: "delivered", title: "delivered", description: "awaitingDelivery", icon: "/icons/shoppingbasket.svg", state: "upcoming" },
] as const;
function ArrowIcon() {
  return <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M19 12H5m7 7-7-7 7-7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}
function TrackingNotice({ kind, onClose }: { kind: NoticeKind; onClose: () => void }) {
  const { t } = useI18n();
  const cancel = kind === "cancel";
  return <div className="tracking-notice-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}><section className="tracking-notice" role="dialog" aria-modal="true" aria-labelledby="tracking-notice-title">
    <button className="tracking-notice-close" type="button" onClick={onClose} aria-label={t("close")}>×</button><h2 id="tracking-notice-title">{t(cancel ? "cancelOrder" : "contactRestaurant")}</h2>
    <p>{t(cancel ? "cancelUnavailable" : "phoneUnavailable")}</p><button className="tracking-notice-ok" type="button" onClick={onClose}>{t("okay")}</button>
  </section></div>;
}
export default function TrackingPage() {
  const { t, href } = useI18n();
  const [notice, setNotice] = useState<NoticeKind | null>(null);
  return <main className="tracking-page"><div className="tracking-shell">
    <header className="tracking-header"><Link className="tracking-back" href={href("/payConfirmation")} aria-label={t("backToHome")}><ArrowIcon /></Link><div><h1>{t("trackingTitle")}</h1><p>{t("orderNumber")} <bdi dir="ltr">#NOELB-11254</bdi></p></div></header>
    <section className="tracking-eta" aria-label={t("deliveryTimeRemaining")}><span className="tracking-eta-icon"><Image src="/icons/time.svg" alt="" width={23} height={23} /></span><div><span>{t("deliveryTimeRemaining")}</span><strong>{t("within")} {t("deliveryTime")}</strong></div></section>
    <ol className="tracking-timeline" aria-label={t("trackingStages")}>{steps.map((step) => <li className={`tracking-step is-${step.state}`} key={step.id} aria-current={step.state === "current" ? "step" : undefined}>
      <span className="tracking-step-marker" aria-hidden="true">{step.icon ? <Image src={step.icon} alt="" width={28} height={28} /> : <span className="tracking-check">✓</span>}</span>
      <div className="tracking-step-copy">{"badge" in step && <span className="tracking-current-badge">{t(step.badge)}</span>}<strong>{t(step.title)}</strong><span>{t(step.description)}</span></div>
    </li>)}</ol>
    <section className="tracking-courier" aria-label={t("courier")}><span className="tracking-courier-art"><Image src="/icons/motorcycle.svg" alt="" width={44} height={44} /></span><div className="tracking-courier-copy"><strong>{t("courierName")}</strong><span>{t("courier")}</span></div><div className="tracking-courier-avatar" aria-hidden="true">{t("courierName").slice(0, 2)}</div></section>
    <div className="tracking-actions"><button type="button" className="tracking-contact" onClick={() => setNotice("contact")}><Image src="/icons/phonecall.svg" alt="" width={23} height={23} />{t("callRestaurant")}</button><button type="button" className="tracking-cancel" onClick={() => setNotice("cancel")}><span>×</span>{t("cancelOrder")}</button></div>
    <div className="tracking-home-indicator" aria-hidden="true" /></div>{notice && <TrackingNotice kind={notice} onClose={() => setNotice(null)} />}</main>;
}
