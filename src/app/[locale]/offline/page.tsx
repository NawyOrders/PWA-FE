"use client";

import Link from "next/link";
import { useI18n } from "@/lib/i18n";
import "./offline.css";

export default function OfflinePage() {
  const { t, href } = useI18n();
  return <main className="offline-shell"><div className="offline-card"><span className="offline-icon" aria-hidden="true">⌁</span>
    <p className="eyebrow">{t("offlineEyebrow")}</p><h1>{t("offlineTitle")}</h1><p>{t("offlineMessage")}</p>
    <Link className="primary-link" href={href("/")}>{t("backToHome")} <span aria-hidden="true">←</span></Link></div></main>;
}
