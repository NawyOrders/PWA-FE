import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Almarai, Montserrat } from "next/font/google";
import { notFound } from "next/navigation";
import "@/styles/globals.css";
import "@/styles/motion.css";
import { getDictionary, isLocale, locales, type Locale } from "@/lib/i18n";
import { I18nProvider } from "@/lib/i18n/DictionaryProvider";
import { Splash } from "@/components/Splash";
import { StoreHydrator } from "@/components/system/StoreHydrator";
import { RegisterSW } from "@/components/system/RegisterSW";

const arabic = Almarai({
  subsets: ["arabic"],
  weight: ["400", "700", "800"],
  variable: "--font-arabic",
  display: "swap",
  preload: true,
});

const latin = Montserrat({
  subsets: ["latin"],
  weight: ["400", "700", "800"],
  variable: "--font-latin",
  display: "swap",
  preload: true,
});

export const metadata: Metadata = {
  metadataBase: new URL("https://nawyorders.com"),
  title: "كرم الشام | Karam El Sham",
  description: "اطلب اشهى الاكلات الشامية عبر تطبيق كرم الشام",
  applicationName: "Karam El Sham",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "كرم الشام",
    statusBarStyle: "default",
  },
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#E43820",
};

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: { locale: string };
}) {
  if (!isLocale(params.locale)) notFound();
  const locale = params.locale as Locale;
  const dict = getDictionary(locale);

  return (
    <html
      lang={locale}
      dir={locale === "ar" ? "rtl" : "ltr"}
      className={`${arabic.variable} ${latin.variable}`}
      suppressHydrationWarning
    >
      <body>
        <Splash label={dict.splash.loading} />
        <I18nProvider locale={locale} dict={dict}>
          <StoreHydrator locale={locale} />
          <RegisterSW />
          {children}
        </I18nProvider>
      </body>
    </html>
  );
}
