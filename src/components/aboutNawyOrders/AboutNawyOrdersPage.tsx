"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowEndIcon } from "@/components/icons";
import { useI18n } from "@/lib/i18n/DictionaryProvider";
import { useUiStore } from "@/store/uiStore";

const features = [
  { title: "commissionTitle", description: "commissionDescription", icon: "/aboutIcons/receipt.png" },
  { title: "menuTitle", description: "menuDescription", icon: "/aboutIcons/menu.png" },
  { title: "customersTitle", description: "customersDescription", icon: "/aboutIcons/users.png" },
] as const;

export function AboutNawyOrdersPage() {
  const { locale, dict } = useI18n();
  const showToast = useUiStore((state) => state.showToast);
  const content = dict.aboutNawyOrders;

  return (
    <main className="about-nawy-page" dir={locale === "ar" ? "rtl" : "ltr"}>
      <div aria-hidden="true" className="about-nawy-background" />
      <div className="about-nawy-shell">
        <header className="about-nawy-header">
          <Link
            href={`/${locale}/aboutRestaurant`}
            className="about-nawy-back"
            aria-label={dict.common.back}
          >
            <ArrowEndIcon className="about-nawy-back-icon" />
          </Link>
        </header>

        <section className="about-nawy-hero" aria-labelledby="about-nawy-title">
          <Image
            className="about-nawy-logo"
            src="/aboutIcons/nawylogo.svg"
            alt="Nawy Orders"
            width={240}
            height={240}
            priority
          />
          <div className={`about-nawy-intro${locale === "ar" ? " is-rtl" : " is-ltr"}`}>
            <p>{content.eyebrow}</p>
            <h1 id="about-nawy-title">{content.title}</h1>
            <span>{content.tagline}</span>
          </div>
        </section>

        <section className="about-nawy-features" aria-labelledby="about-nawy-features-title">
          <h2 id="about-nawy-features-title">{content.featuresTitle}</h2>
          <div className="about-nawy-feature-list">
            {features.map((feature) => (
              <article className="about-nawy-feature" key={feature.title}>
                <span className="about-nawy-feature-icon">
                  <Image src={feature.icon} alt="" width={54} height={54} />
                </span>
                <h3>{content[feature.title]}</h3>
                <p>{content[feature.description]}</p>
              </article>
            ))}
          </div>
        </section>

        <button
          className="about-nawy-learn-more"
          type="button"
          onClick={() => showToast(dict.profile.comingSoon)}
        >
          <ArrowEndIcon aria-hidden="true" />
          <span dir={locale === "ar" ? "rtl" : "ltr"}>{content.learnMore}</span>
        </button>

        <footer className="about-nawy-footer">{content.footer}</footer>
      </div>
    </main>
  );
}
