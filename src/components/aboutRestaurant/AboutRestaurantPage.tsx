"use client";

import Image from "next/image";
import Link from "next/link";
import { useI18n } from "@/lib/i18n/DictionaryProvider";
import { brand } from "@/lib/brand";
import { useUiStore } from "@/store/uiStore";
import { ArrowEndIcon } from "@/components/icons";

const policyRows = [
  { key: "privacy", icon: "/aboutIcons/shield.svg" },
  { key: "terms", icon: "/aboutIcons/Vectorr.svg" },
  { key: "dataProcessing", icon: "/aboutIcons/data.svg" },
] as const;

function PolicyIcon({ src }: { src: string }) {
  return <Image src={src} alt="" width={28} height={28} />;
}

function PolicyRow({
  row,
  label,
  href,
  onClick,
}: {
  row: (typeof policyRows)[number];
  label: string;
  href?: string;
  onClick: () => void;
}) {
  const content = (
    <>
      <span className="about-policy-icon"><PolicyIcon src={row.icon} /></span>
      <strong>{label}</strong>
      <span className="about-policy-chevron" aria-hidden="true">
        <ArrowEndIcon />
      </span>
    </>
  );

  return href ? (
    <Link className="about-policy-row" href={href}>{content}</Link>
  ) : (
    <button className="about-policy-row" type="button" onClick={onClick}>{content}</button>
  );
}

export function AboutRestaurantPage() {
  const { locale, dict, t } = useI18n();
  const showToast = useUiStore((state) => state.showToast);
  const about = dict.aboutRestaurant;
  const comingSoon = () => showToast(dict.profile.comingSoon);

  return (
    <main className="about-restaurant-page" dir={locale === "ar" ? "rtl" : "ltr"}>
      <div aria-hidden="true" className="about-restaurant-background" />
      <div className="about-restaurant-shell">
        <header className="about-restaurant-header">
          <Link
            href={`/${locale}/profile`}
            className="about-restaurant-back"
            aria-label={dict.common.back}
          >
            <ArrowEndIcon className="about-restaurant-back-icon" />
          </Link>
        </header>

        <section className="about-restaurant-hero" aria-labelledby="about-restaurant-title">
          <div className="about-restaurant-logo-wrap">
            <Image
              src="/aboutIcons/resturant%20logo.png"
              alt={about.brandName}
              width={190}
              height={220}
              priority
              className="about-restaurant-logo"
            />
          </div>
          <div className={`about-restaurant-intro${locale === "ar" ? " is-rtl" : " is-ltr"}`}>
            <h1 id="about-restaurant-title">{about.title}</h1>
            <p className="about-restaurant-name">{about.brandName}</p>
            <p className="about-restaurant-tagline">{about.tagline}</p>
          </div>
        </section>

        <section className="about-restaurant-policies" aria-label={about.title}>
          {policyRows.map((row) => (
            <PolicyRow
              key={row.key}
              row={row}
              label={about[row.key]}
              href={
                row.key === "privacy"
                  ? `/${locale}/privacyPolicy`
                  : row.key === "terms"
                    ? `/${locale}/termsAndConditions`
                    : row.key === "dataProcessing"
                      ? `/${locale}/dataProcessingAgreement`
                      : undefined
              }
              onClick={comingSoon}
            />
          ))}
        </section>

        <section className="about-platform" aria-labelledby="about-platform-title">
          <h2 id="about-platform-title">{about.platform}</h2>
          <Link className="about-platform-card" href={`/${locale}/aboutNawyOrders`}>
            <Image src="/icons/logo.png" alt="" width={64} height={64} />
            <div>
              <span>{about.poweredBy}</span>
              <strong>Nawy Orders</strong>
            </div>
          </Link>
          <Link className="about-platform-card about-platform-card-tech" href={`/${locale}/aboutSpaceTech`}>
            <Image src="/aboutIcons/spacethec%20logo.png" alt="" width={64} height={64} />
            <div>
              <span>{about.developedBy}</span>
              <strong>Space Tech</strong>
            </div>
          </Link>
        </section>

        <div className="about-version">
          <Image src="/aboutIcons/version-fill.png" alt="" width={28} height={28} />
          <span>{t(about.version, { version: brand.version })}</span>
        </div>

        <footer className="about-copyright">
          {t(about.copyright, { year: "2026" })}
        </footer>
      </div>
    </main>
  );
}
