"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useI18n } from "@/lib/i18n/DictionaryProvider";
import { useAuthStore } from "@/store/authStore";
import { useUiStore } from "@/store/uiStore";
import { useLanguageStore } from "@/store/languageStore";
import { brand } from "@/lib/brand";
import type { Locale } from "@/lib/i18n/types";
import { LanguageToggle } from "@/components/LanguageToggle";
import {
  CartIcon,
  ClockIcon,
  FacebookIcon,
  HeartIcon,
  HomeIcon,
  InstagramIcon,
  MenuIcon,
  TikTokIcon,
  UserIcon,
  WhatsAppIcon,
} from "@/components/icons";

export function DrawerContent() {
  const { locale, dict, pick, t } = useI18n();
  const router = useRouter();
  const pathname = usePathname();
  const user = useAuthStore((state) => state.user);
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  const closeDrawer = useUiStore((state) => state.closeDrawer);
  const setLocale = useLanguageStore((state) => state.setLocale);

  const navItems = [
    { key: "home", label: dict.nav.home, icon: <HomeIcon className="h-5 w-5" />, href: `/${locale}` },
    { key: "menu", label: dict.nav.menu, icon: <MenuIcon className="h-5 w-5" />, href: `/${locale}/menu` },
    { key: "favorites", label: dict.nav.favorites, icon: <HeartIcon className="h-5 w-5" />, href: `/${locale}/favorites` },
    { key: "cart", label: dict.nav.cart, icon: <CartIcon className="h-5 w-5" />, href: `/${locale}/cart` },
    { key: "orders", label: dict.nav.orders, icon: <ClockIcon className="h-5 w-5" />, href: `/${locale}/orders` },
    { key: "profile", label: dict.nav.profile, icon: <UserIcon className="h-5 w-5" />, href: `/${locale}/profile` },
  ];

  const changeLocale = (next: Locale) => {
    setLocale(next);
    const segments = pathname.split("/");
    segments[1] = next;
    closeDrawer();
    router.replace(segments.join("/") || `/${next}`);
  };

  const socials = [
    { key: "whatsapp", label: dict.drawer.whatsapp, href: brand.social.whatsapp, icon: <WhatsAppIcon className="h-5 w-5" /> },
    { key: "instagram", label: dict.drawer.instagram, href: brand.social.instagram, icon: <InstagramIcon className="h-5 w-5" /> },
    { key: "facebook", label: dict.drawer.facebook, href: brand.social.facebook, icon: <FacebookIcon className="h-5 w-5" /> },
    { key: "tiktok", label: dict.drawer.tiktok, href: brand.social.tiktok, icon: <TikTokIcon className="h-5 w-5" /> },
  ];

  return (
    <div className="flex h-full flex-col px-6">
      <p id="drawer-title" className="mt-3 text-[0.875rem] text-muted">
        {isLoggedIn && user ? t(dict.drawer.greeting, { name: user.name }) : pick(brand.name)}
      </p>
      <p className="mt-1 text-[0.8125rem] text-muted">
        {isLoggedIn ? user?.email : dict.drawer.guest}
      </p>

      <nav className="mt-6 flex flex-col gap-1">
        {navItems.map((item) => (
          <Link
            key={item.key}
            href={item.href}
            onClick={closeDrawer}
            className="flex h-12 items-center justify-between gap-3 rounded-2xl px-2 text-start transition-colors hover:bg-surface-muted"
          >
            <span className="text-[0.9375rem] font-bold text-title">{item.label}</span>
            <span className="text-primary">{item.icon}</span>
          </Link>
        ))}
      </nav>

      <div className="mt-5 border-t border-line pt-5">
        <LanguageToggle label={dict.drawer.language} locale={locale} onChange={changeLocale} />
      </div>

      <div className="mt-6">
        <p className="text-[0.875rem] font-bold text-title">{dict.drawer.contact}</p>
        <div className="mt-3 grid grid-cols-4 gap-3">
          {socials.map((social) => (
            <a
              key={social.key}
              href={social.href}
              target="_blank"
              rel="noreferrer"
              aria-label={social.label}
              className="flex aspect-square w-full items-center justify-center rounded-xl bg-ink text-white transition-transform active:scale-95"
            >
              {social.icon}
            </a>
          ))}
        </div>
      </div>

      <div className="mt-auto pt-8 text-center">
        <p dir="ltr" className="font-latin text-[0.8125rem] text-muted">
          <span className="font-extrabold text-primary">{brand.domainBrand}</span>
          {brand.domainTld}
        </p>
        <p className="mt-1 text-[0.75rem] text-muted">{dict.drawer.version}</p>
      </div>
    </div>
  );
}
