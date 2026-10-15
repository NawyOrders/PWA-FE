"use client";

import Link from "next/link";
import { localizedHref, useI18n, type Locale } from "@/lib/i18n";

export default function HomePage() {
  const { locale, t } = useI18n();
  const otherLocale: Locale = locale === "ar" ? "en" : "ar";

  return (
    <main className="locale-home-page">
      <section className="locale-home-card">
        <div className="locale-home-language" aria-label={t("chooseLanguage")}>
          <Link
            href={localizedHref(otherLocale, "/")}
            lang={otherLocale}
            dir={otherLocale === "ar" ? "rtl" : "ltr"}
          >
            {otherLocale === "ar" ? t("arabic") : t("english")}
          </Link>
        </div>
        <p className="locale-home-kicker">{t("siteName")}</p>
        <h1>{t("homeTitle")}</h1>
        <p className="locale-home-intro">{t("homeIntro")}</p>
        <Link
          className="locale-home-cta"
          href={localizedHref(locale, "/item/burger-baladi")}
        >
          {t("startOrder")}
        </Link>
      </section>
    </main>
  );
}
