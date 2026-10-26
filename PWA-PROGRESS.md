# PWA Progress

Last updated: 2026-10-26
Working branch: `feat/pwa`
Target project: `E:\PWA.FE\PWA-FE` (the opened folder `E:\Landing-Page` is a different repo).

## Step status

| Step | Scope | Status |
|---|---|---|
| 0 | Safety, inventory, progress | done |
| 1 | Typed worker build (src/sw, esbuild, tsconfig.sw) | todo |
| 2 | Service worker behavior | todo |
| 3 | Manifest per language | todo |
| 4 | Icons and screenshots | todo |
| 5 | Registration, update, install, offline | todo |
| 6 | Tests | todo |
| 7 | Verify and report | todo |

## Inventory (as found)

- Next.js 16.4 App Router, React 19, TypeScript strict, Tailwind; app lives in `src/app`, not `app`.
- Locale routing: `src/app/[locale]` with `ar` default and `en`; `proxy.ts` redirects prefix-less paths.
- Existing PWA: `src/app/manifest.ts` (single Arabic manifest), `public/sw.js` (hand-written), `public/offline.html`, `src/components/system/RegisterSW.tsx`, `src/app/[locale]/offline/page.tsx`, `public/icons/*` (192, 512, maskable-512, apple-touch, logo), existing `tests/unit/pwa/pwa.test.ts`.
- No favicon.ico, no screenshots, no install prompt, no update toast, no typed worker, no per-locale manifests, no `src/lib/pwa.ts`.
- Brand data: `src/lib/brand.ts` currently exposes name/domain/support/social; no logo/description/tagline fields.
- Logo assets: only `public/icons/logo.png` exists (142x143, transparent). `public/LOGO1.png` and `public/logo.png` referenced by the prompt are absent in this checkout; no source image will be renamed or copied.
- Tokens: `src/styles/globals.css`; `--bg: #fff8f1`, `--bg-splash: #fffbf0`, `--primary: #e43820`.
- Headers: `next.config.mjs` already sets no-cache for `/sw.js` and `/manifest.webmanifest`; no CSP.
- Tests: Vitest (jsdom) + Playwright (Chrome, port 3100), axe utilities.
- Splash: `src/components/Splash.tsx` spinner overlay, min 700 ms, max 3500 ms, once per session.
- Outbox/banner: no existing general outbox or global offline banner; chat/feedback forms currently block when offline.

## Notes and decisions

- Work is performed in `E:\PWA.FE\PWA-FE` because the requested read-first documents and PWA pieces live there.
- Logo fallback chain for generated assets: `public/LOGO1.png` → `public/logo.png` → `public/icons/logo.png` (the only asset present). Reported in `REPORT-PWA.md`.
- Screenshots will be skipped if a documented watermark is visible on Home (DESIGN.md 13.11 item 9) as required.
