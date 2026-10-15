import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import type { ReactNode } from "react";
import PwaRegister from "@/components/pwa-register";
import "leaflet/dist/leaflet.css";
import "./globals.css";
import "@/styles/motion.css";

const notoKufiArabic = localFont({
  src: "./fonts/NotoKufiArabic-Variable.ttf",
  weight: "100 900",
  variable: "--font-noto-kufi-arabic",
  display: "swap",
});

export const metadata: Metadata = {
  title: "NawyOrders",
  description: "تطبيق ناوي أوردرز لإدارة الطلبات بسهولة.",
  applicationName: "NawyOrders",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "NawyOrders",
  },
  icons: { icon: "/icons/logo.png", apple: "/icons/logo.png" },
};

export const viewport: Viewport = {
  themeColor: "#0F2A47",
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="ar" dir="rtl" className={notoKufiArabic.variable}>
      <body>
        <PwaRegister />
        {children}
      </body>
    </html>
  );
}
