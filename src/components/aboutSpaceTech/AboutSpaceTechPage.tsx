"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowEndIcon } from "@/components/icons";
import { useI18n } from "@/lib/i18n/DictionaryProvider";

const services = [
  { title: "webDevelopment", icon: "/aboutIcons/web.svg" },
  { title: "appDevelopment", icon: "/aboutIcons/mobile.svg" },
  { title: "saasPlatforms", icon: "/aboutIcons/clouds.svg" },
] as const;

const contacts = [
  { label: "website", value: "websiteValue", icon: "/aboutIcons/web.svg", href: "https://www.spacetech.com" },
  { label: "email", value: "emailValue", icon: "/aboutIcons/mail.svg", href: "mailto:info@spacetech.com" },
  { label: "linkedin", value: "linkedinValue", icon: "/aboutIcons/linkedin.svg", href: "" },
] as const;

export function AboutSpaceTechPage() {
  const { locale, dict } = useI18n();
  const content = dict.aboutSpaceTech;

  return (
    <main className="about-space-tech-page" dir={locale === "ar" ? "rtl" : "ltr"}>
      <div aria-hidden="true" className="about-space-tech-background" />
      <div className="about-space-tech-shell">
        <header className="about-space-tech-header">
          <Link
            href={`/${locale}/aboutRestaurant`}
            className="about-space-tech-back"
            aria-label={dict.common.back}
          >
            <ArrowEndIcon className="about-space-tech-back-icon" />
          </Link>
        </header>

        <section className="about-space-tech-hero" aria-labelledby="about-space-tech-title">
          <Image
            className="about-space-tech-logo"
            src="/aboutIcons/spaceTheclogo.svg"
            alt="Space Tech"
            width={280}
            height={280}
            priority
          />
          <div className={`about-space-tech-intro${locale === "ar" ? " is-rtl" : " is-ltr"}`}>
            <p>{content.company}</p>
            <h1 id="about-space-tech-title">{content.name}</h1>
            <span>{content.tagline}</span>
          </div>
        </section>

        <section className="about-space-tech-services" aria-labelledby="about-space-tech-services-title">
          <h2 id="about-space-tech-services-title">{content.services}</h2>
          <div className="about-space-tech-service-grid">
            {services.map((service) => (
              <article className="about-space-tech-service" key={service.title}>
                <span className="about-space-tech-service-icon">
                  <Image src={service.icon} alt="" width={40} height={40} />
                </span>
                <h3>{content[service.title]}</h3>
              </article>
            ))}
          </div>
        </section>

        <section className="about-space-tech-contact" aria-labelledby="about-space-tech-contact-title">
          <h2 id="about-space-tech-contact-title">{content.contact}</h2>
          <div className="about-space-tech-contact-list">
            {contacts.map((contact) => {
              const row = (
                <>
                  <span className="about-space-tech-contact-icon">
                    <Image src={contact.icon} alt="" width={36} height={36} />
                  </span>
                  <span className="about-space-tech-contact-copy">
                    <span>{content[contact.label]}</span>
                    <strong dir="ltr">{content[contact.value]}</strong>
                  </span>
                </>
              );

              return contact.href ? (
                <a className="about-space-tech-contact-row" href={contact.href} key={contact.label}>
                  {row}
                </a>
              ) : (
                <div className="about-space-tech-contact-row" key={contact.label}>
                  {row}
                </div>
              );
            })}
          </div>
        </section>

        <footer className="about-space-tech-footer">{content.footer}</footer>
      </div>
    </main>
  );
}
