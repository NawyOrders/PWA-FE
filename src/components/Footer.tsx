"use client";

import Link from "next/link";
import { useI18n } from "@/lib/i18n/DictionaryProvider";
import { brand } from "@/lib/brand";
import {
  FacebookIcon,
  InstagramIcon,
  TikTokIcon,
  WhatsAppIcon,
} from "@/components/icons";

export function Footer() {
  const { locale, dict, pick } = useI18n();

  const navItems = [
    { key: "home", label: dict.nav.home, href: `/${locale}` },
    { key: "menu", label: dict.nav.menu, href: `/${locale}/menu` },
    { key: "favorites", label: dict.nav.favorites, href: `/${locale}/favorites` },
    { key: "cart", label: dict.nav.cart, href: `/${locale}/cart` },
    { key: "orders", label: dict.nav.orders, href: `/${locale}/orders` },
    { key: "profile", label: dict.nav.profile, href: `/${locale}/profile` },
  ];

  const socials = [
    { key: "whatsapp", label: dict.drawer.whatsapp, href: brand.social.whatsapp, icon: <WhatsAppIcon className="h-5 w-5" /> },
    { key: "instagram", label: dict.drawer.instagram, href: brand.social.instagram, icon: <InstagramIcon className="h-5 w-5" /> },
    { key: "facebook", label: dict.drawer.facebook, href: brand.social.facebook, icon: <FacebookIcon className="h-5 w-5" /> },
    { key: "tiktok", label: dict.drawer.tiktok, href: brand.social.tiktok, icon: <TikTokIcon className="h-5 w-5" /> },
  ];

  return (
    <footer className="cv-auto mt-20 hidden border-t border-line bg-surface lg:block">
      <div className="container-x grid grid-cols-12 gap-8 py-16">
        <div className="col-span-6">
          <p className="mt-5 max-w-[21.25rem] text-[0.875rem] leading-relaxed text-muted">
            {dict.footer.tagline}
          </p>
        </div>

        <div className="col-span-3">
          <h3 className="text-[0.9375rem] font-extrabold text-title">{dict.footer.quickLinks}</h3>
          <ul className="mt-5 space-y-3">
            {navItems.map((item) => (
              <li key={item.key}>
                <Link
                  href={item.href}
                  className="text-[0.875rem] font-medium text-muted transition-colors hover:text-primary"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="col-span-3">
          <h3 className="text-[0.9375rem] font-extrabold text-title">{dict.footer.contact}</h3>
          <p dir="ltr" className="mt-5 font-latin text-[0.875rem] text-muted">
            <span className="font-extrabold text-primary">{brand.domainBrand}</span>
            {brand.domainTld}
          </p>
          <p className="mt-2 text-[0.8125rem] text-muted">{dict.home.location}</p>
          <p className="mt-5 text-[0.875rem] font-bold text-title">{dict.footer.follow}</p>
          <div className="mt-3 flex gap-2">
            {socials.map((social) => (
              <a
                key={social.key}
                href={social.href}
                target="_blank"
                rel="noreferrer"
                aria-label={social.label}
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-ink text-white transition-transform hover:scale-105 active:scale-95"
              >
                {social.icon}
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="border-t border-line">
        <div className="container-x flex items-center justify-between gap-4 py-5 text-[0.8125rem] text-muted">
          <p>
            © {new Date().getFullYear()} {pick(brand.name)} — {dict.footer.rights}
          </p>
          <p>{dict.drawer.version}</p>
        </div>
      </div>
    </footer>
  );
}
