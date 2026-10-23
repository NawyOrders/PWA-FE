import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "var(--primary)",
          dark: "var(--primary-dark)",
          light: "var(--primary-light)",
          tint: "var(--primary-tint)",
        },
        accent: "var(--accent-text)",
        bg: "var(--bg)",
        "bg-splash": "var(--bg-splash)",
        glow: "var(--glow-peach)",
        "brand-gold": "var(--brand-logo-gold)",
        "brand-brown": "var(--brand-logo-brown)",
        "primary-soft": "var(--primary-soft)",
        "brand-gold-soft": "var(--brand-gold-soft)",
        surface: {
          DEFAULT: "var(--surface)",
          soft: "var(--surface-soft)",
          muted: "var(--surface-muted)",
        },
        title: "var(--text)",
        muted: "var(--text-muted)",
        line: "var(--border)",
        disabled: "var(--disabled-fill)",
        "ring-inactive": "var(--ring-inactive)",
        "drawer-edge": "var(--drawer-edge)",
        success: {
          DEFAULT: "var(--success)",
          bg: "var(--success-bg)",
        },
        danger: {
          DEFAULT: "var(--danger)",
          bg: "var(--danger-bg)",
          strong: "var(--danger-strong)",
        },
        "hint-amber": "var(--hint-amber)",
        "hint-amber-text": "var(--hint-amber-text)",
        "tint-peach": "var(--tint-peach)",
        "star-off": "var(--star-off)",
        coral: "var(--coral)",
        "bubble-end": "var(--bubble-end)",
        ink: "var(--ink)",
        overlay: "var(--overlay)",
      },
      fontFamily: {
        sans: ["var(--font-arabic)", "var(--font-latin)", "system-ui", "sans-serif"],
        latin: ["var(--font-latin)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        image: "1rem",
        input: "1.25rem",
        card: "1.375rem",
        modal: "1.75rem",
        sheet: "2rem",
        feature: "2.25rem",
      },
      boxShadow: {
        card: "0 6px 20px rgba(60, 30, 10, 0.06)",
        floating: "0 16px 40px rgba(60, 30, 10, 0.14)",
        cta: "0 8px 20px rgba(228, 56, 32, 0.25)",
      },
      maxWidth: {
        app: "480px",
        content: "1440px",
      },
      transitionTimingFunction: {
        smooth: "cubic-bezier(0.16, 1, 0.3, 1)",
      },
    },
  },
  plugins: [],
};

export default config;
