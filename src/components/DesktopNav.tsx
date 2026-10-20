"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useI18n } from "@/lib/i18n/DictionaryProvider";
import { useAuthStore } from "@/store/authStore";
import { useCartStore, getCartCount } from "@/store/cartStore";
import { useLanguageStore } from "@/store/languageStore";
import { cn } from "@/lib/cn";
import type { Locale } from "@/lib/i18n/types";
import { BrandMark } from "@/components/BrandMark";
import { CartIcon, UserIcon } from "@/components/icons";

export function DesktopNav() {
  const { locale, dict } = useI18n();
  const pathname = usePathname();
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  const cartItems = useCartStore((state) => state.items);
  const setLocale = useLanguageStore((state) => state.setLocale);
  const count = getCartCount(cartItems);

  const navItems = [
    { key: "home", label: dict.nav.home, href: `/${locale}`, exact: true },
    { key: "menu", label: dict.nav.menu, href: `/${locale}/menu`, exact: false },
    { key: "favorites", label: dict.nav.favorites, href: `/${locale}/favorites`, exact: false },
    { key: "orders", label: dict.nav.orders, href: `/${locale}/orders`, exact: false },
  ];

  const isActive = (href: string, exact: boolean) =>
    exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);

  const changeLocale = (next: Locale) => {
    if (next === locale) return;
    setLocale(next);
    const segments = pathname.split("/");
    segments[1] = next;
    router.replace(segments.join("/") || `/${next}`);
  };

  return (
    <header className="sticky top-0 z-30 hidden border-b border-line glass-bar lg:block">
      <div className="container-x flex h-[var(--header-h)] items-center gap-4">
        <Link
          href={`/${locale}`}
          className="shrink-0 rounded-2xl transition-opacity hover:opacity-80"
          aria-label={dict.nav.home}
        >
          <BrandMark locale={locale} />
        </Link>

        <nav className="flex items-center gap-1" aria-label={dict.nav.menu}>
          {navItems.map((item) => (
            <Link
              key={item.key}
              href={item.href}
              className={cn(
                "whitespace-nowrap rounded-full px-3 py-2 text-[0.9375rem] font-bold transition-colors xl:px-4",
                isActive(item.href, item.exact)
                  ? "bg-primary-tint text-primary"
                  : "text-title hover:bg-surface-muted",
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="ms-auto flex items-center gap-3">
          <div className="flex items-center gap-1 rounded-full border border-line p-1" dir="ltr">
            <button
              type="button"
              onClick={() => changeLocale("en")}
              aria-pressed={locale === "en"}
              className={cn(
                "h-8 rounded-full px-3 font-latin text-[0.8125rem] font-bold transition-colors",
                locale === "en" ? "bg-primary text-white" : "text-muted hover:text-title",
              )}
            >
              ENG
            </button>
            <button
              type="button"
              onClick={() => changeLocale("ar")}
              aria-pressed={locale === "ar"}
              className={cn(
                "h-8 rounded-full px-3 text-[0.8125rem] font-bold transition-colors",
                locale === "ar" ? "bg-primary text-white" : "text-muted hover:text-title",
              )}
            >
              عربي
            </button>
          </div>

          <Link
            href={`/${locale}/cart`}
            aria-label={dict.nav.cart}
            className="relative inline-flex h-11 w-11 items-center justify-center rounded-full bg-surface-muted text-title transition-colors hover:bg-primary-tint hover:text-primary"
          >
            <CartIcon className="h-5 w-5" />
            {count > 0 ? (
              <span className="absolute -top-1 -end-1 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-primary px-1 font-latin text-[0.6875rem] font-bold text-white">
                {count}
              </span>
            ) : null}
          </Link>

          <Link
            href={`/${locale}/profile`}
            aria-label={dict.nav.profile}
            className="inline-flex h-11 items-center gap-2 rounded-full bg-surface-muted px-3 text-[0.875rem] font-bold text-title transition-colors hover:bg-primary-tint hover:text-primary xl:px-4"
          >
            <UserIcon className="h-5 w-5" />
            <span className="hidden max-w-[7.5rem] truncate xl:inline">
              {isLoggedIn && user ? user.name : dict.nav.profile}
            </span>
          </Link>
        </div>
      </div>
    </header>
  );
}
