import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import PwaRegister from "@/components/pwa-register";
import { I18nProvider } from "@/lib/i18n";
import {
  defaultLocale,
  isLocale,
  locales,
  type Locale,
} from "@/lib/i18n/config";
import "leaflet/dist/leaflet.css";
import "../globals.css";
import "@/styles/motion.css";

const notoKufiArabic = localFont({
  src: "../fonts/NotoKufiArabic-Variable.ttf",
  weight: "100 900",
  variable: "--font-noto-kufi-arabic",
  display: "swap",
});

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: value } = await params;
  const locale: Locale = isLocale(value) ? value : defaultLocale;

  return {
    title: "NawyOrders",
    description:
      locale === "ar"
        ? "تطبيق ناوي أوردرز لإدارة الطلبات بسهولة."
        : "NawyOrders makes ordering your favorite meals easy.",
    applicationName: "NawyOrders",
    appleWebApp: {
      capable: true,
      statusBarStyle: "default",
      title: "NawyOrders",
    },
    icons: { icon: "/icons/logo.png", apple: "/icons/logo.png" },
  };
}

export const viewport: Viewport = {
  themeColor: "#0F2A47",
};

export default async function LocaleLayout({
  children,
  params,
}: Readonly<{
  children: ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const direction = locale === "ar" ? "rtl" : "ltr";
  return (
    <html lang={locale} dir={direction} className={notoKufiArabic.variable}>
      <body>
        <PwaRegister />
        <I18nProvider locale={locale}>
          <div className="locale-app" dir={direction}>
            {children}
          </div>
        </I18nProvider>
      </body>
    </html>
  );
}
