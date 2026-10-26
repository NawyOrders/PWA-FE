import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import localFont from "next/font/local";
import Script from "next/script";
import { notFound } from "next/navigation";
import "leaflet/dist/leaflet.css";
import "@/styles/globals.css";
import "@/styles/motion.css";
import { getDictionary, isLocale, locales, type Locale } from "@/lib/i18n";
import { brand } from "@/lib/brand";
import { ICON_VERSION } from "@/lib/pwa";
import { manifestHref } from "@/lib/pwa-manifest";
import { getPwaColors } from "@/lib/pwa-tokens";
import { I18nProvider } from "@/lib/i18n/DictionaryProvider";
import { I18nProvider as LegacyI18nProvider } from "@/lib/i18n";
import { Splash } from "@/components/Splash";
import { StoreHydrator } from "@/components/system/StoreHydrator";
import { RegisterSW } from "@/components/system/RegisterSW";

const notoKufiArabic = localFont({
  src: "../fonts/NotoKufiArabic-Variable.ttf",
  weight: "100 900",
  variable: "--font-noto-kufi-arabic",
  display: "swap",
  preload: true,
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};

  const other: Locale = locale === "ar" ? "en" : "ar";
  return {
    metadataBase: new URL(`https://${brand.domain}`),
    title: `${brand.name[locale]} | ${brand.name[other]}`,
    description: brand.description[locale],
    applicationName: brand.name[locale],
    manifest: manifestHref(locale),
    appleWebApp: {
      capable: true,
      title: brand.shortName[locale],
      statusBarStyle: "default",
    },
    icons: {
      icon: [
        { url: `/icons/favicon.ico?sizes=16x16,32x32,48x48`, type: "image/x-icon" },
        { url: `/icons/icon-192.png?v=${ICON_VERSION}`, sizes: "192x192", type: "image/png" },
        { url: `/icons/icon-512.png?v=${ICON_VERSION}`, sizes: "512x512", type: "image/png" },
      ],
      apple: [
        {
          url: `/icons/apple-touch-icon.png?v=${ICON_VERSION}`,
          sizes: "180x180",
          type: "image/png",
        },
      ],
    },
  };
}

export function generateViewport(): Viewport {
  return {
    width: "device-width",
    initialScale: 1,
    viewportFit: "cover",
    themeColor: getPwaColors().bg,
  };
}

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale: localeParam } = await params;
  if (!isLocale(localeParam)) notFound();
  const locale = localeParam as Locale;
  const dict = getDictionary(locale);

  return (
    <html
      lang={locale}
      dir={locale === "ar" ? "rtl" : "ltr"}
      className={notoKufiArabic.variable}
      suppressHydrationWarning
    >
      <body>
        <Script id="splash-seen-state" src="/splash-state.js" strategy="beforeInteractive" />
        <Splash label={dict.splash.loading} />
        <LegacyI18nProvider locale={locale}>
          <I18nProvider locale={locale} dict={dict}>
            <StoreHydrator locale={locale} />
            <RegisterSW />
            {children}
          </I18nProvider>
        </LegacyI18nProvider>
      </body>
    </html>
  );
}
