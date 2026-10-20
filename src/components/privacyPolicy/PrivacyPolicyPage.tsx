"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowEndIcon } from "@/components/icons";
import { useI18n } from "@/lib/i18n/DictionaryProvider";

const sectionKeys = [
  ["introductionTitle", "introduction"],
  ["collectionTitle", "collection"],
  ["useTitle", "use"],
  ["sharingTitle", "sharing"],
  ["securityTitle", "security"],
] as const;

export function PrivacyPolicyPage({ title }: { title?: string }) {
  const { locale, dict, t } = useI18n();
  const policy = dict.privacyPolicy;
  const pageTitle = title ?? policy.title;

  return (
    <main className="privacy-policy-page" dir={locale === "ar" ? "rtl" : "ltr"}>
      <div aria-hidden="true" className="privacy-policy-background" />
      <div className="privacy-policy-shell">
        <header className="privacy-policy-header">
          <Link
            href={`/${locale}/aboutRestaurant`}
            className="privacy-policy-back"
            aria-label={dict.common.back}
          >
            <ArrowEndIcon className="privacy-policy-back-icon" />
          </Link>
        </header>

        <h1 className="privacy-policy-title">{pageTitle}</h1>

        <article className="privacy-policy-card" aria-label={pageTitle}>
          <div className="privacy-policy-shield" aria-hidden="true">
            <span className="privacy-policy-orb privacy-policy-orb-top" />
            <span className="privacy-policy-orb privacy-policy-orb-bottom" />
            <Image src="/aboutIcons/bigshield.svg" alt="" width={112} height={112} priority />
          </div>

          <div className="privacy-policy-sections">
            {sectionKeys.map(([titleKey, bodyKey]) => (
              <section className="privacy-policy-section" key={titleKey}>
                <h2>{policy[titleKey]}</h2>
                <p>{policy[bodyKey]}</p>
              </section>
            ))}
          </div>
        </article>

        <p className="privacy-policy-updated">
          {t(policy.updatedAt, { date: policy.updatedDate })}
        </p>
      </div>
    </main>
  );
}
