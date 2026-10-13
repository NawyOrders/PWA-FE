import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "NawyOrders لإدارة الطلبات",
    short_name: "NawyOrders",
    description: "تطبيق نوي أوردرز لإدارة الطلبات بسهولة.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    lang: "ar",
    dir: "rtl",
    background_color: "#FFF7EA",
    theme_color: "#0F2A47",
    icons: [
      { src: "/icons/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
    ],
  };
}
