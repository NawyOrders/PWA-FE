import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import type { ReactNode } from "react";
import PwaRegister from "@/components/pwa-register";
import "./globals.css";
import "@/styles/motion.css";

const cairoArabic = localFont({
  src: [
    { path: "./fonts/cairo-arabic-400-normal.woff2", weight: "400", style: "normal" },
    { path: "./fonts/cairo-arabic-600-normal.woff2", weight: "600", style: "normal" },
    { path: "./fonts/cairo-arabic-700-normal.woff2", weight: "700", style: "normal" },
    { path: "./fonts/cairo-arabic-800-normal.woff2", weight: "800", style: "normal" },
  ],
  variable: "--font-cairo-arabic",
  display: "swap",
});

const cairoLatin = localFont({
  src: [
    { path: "./fonts/cairo-latin-400-normal.woff2", weight: "400", style: "normal" },
    { path: "./fonts/cairo-latin-600-normal.woff2", weight: "600", style: "normal" },
    { path: "./fonts/cairo-latin-700-normal.woff2", weight: "700", style: "normal" },
    { path: "./fonts/cairo-latin-800-normal.woff2", weight: "800", style: "normal" },
  ],
  variable: "--font-cairo-latin",
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
  icons: { icon: "/icons/icon.svg", apple: "/icons/icon.svg" },
};

export const viewport: Viewport = {
  themeColor: "#0F2A47",
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="ar" dir="rtl" className={`${cairoArabic.variable} ${cairoLatin.variable}`}>
      <body>
        <PwaRegister />
        {children}
      </body>
    </html>
  );
}
