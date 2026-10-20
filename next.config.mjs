/** @type {import('next').NextConfig} */
const ONE_YEAR = 60 * 60 * 24 * 365;

const nextConfig = {
  reactStrictMode: true,
  devIndicators: false,
  images: {
    formats: ["image/avif", "image/webp"],
    // Real display widths only; never larger than the source (max 736px),
    // so the optimizer never upscales the food photography.
    deviceSizes: [320, 384, 480, 640, 736],
    imageSizes: [64, 96, 128, 192, 256],
    qualities: [64, 72, 75, 78],
    minimumCacheTTL: 60 * 60 * 24 * 31,
  },
  async headers() {
    return [
      {
        source: "/sw.js",
        headers: [{ key: "Cache-Control", value: "no-cache" }],
      },
      {
        source: "/manifest.webmanifest",
        headers: [{ key: "Cache-Control", value: "no-cache" }],
      },
      {
        source: "/_next/static/:path*",
        headers: [
          { key: "Cache-Control", value: `public, max-age=${ONE_YEAR}, immutable` },
        ],
      },
      {
        source: "/fonts/:path*",
        headers: [
          { key: "Cache-Control", value: `public, max-age=${ONE_YEAR}, immutable` },
        ],
      },
      {
        source: "/images/:path*",
        headers: [
          { key: "Cache-Control", value: `public, max-age=${ONE_YEAR}, immutable` },
        ],
      },
      {
        source: "/icons/:path*",
        headers: [
          { key: "Cache-Control", value: `public, max-age=${ONE_YEAR}, immutable` },
        ],
      },
    ];
  },
};

export default nextConfig;
