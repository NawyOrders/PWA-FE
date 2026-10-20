# PHASE 1 - MEASURE BEFORE

## Build
npm run build completed (production). 
- Most routes SSG (●), /[locale]/item/[slug] Dynamic (ƒ), middleware present.
- Chunks total ~1550.89 KB across 64 files. Largest: 025e_g9ksha1v.js (223.29 KB), 33a2u9zhdx554.js (154.74 KB), 339edoft4wv45.js (149 KB), 0cz1d0mv5g_q7.js (109.96 KB).

## Images (public/images)
77 files, ~2005.45 KB total. Large hero images: chef-noodles-736.webp (138.22 KB), classic-burger-736.webp (109.70 KB), cheese-pizza-736.webp (106.54 KB), special-shawarma-736.webp (100.51 KB). Many 736px WebP/AVIF >80KB. Also have 256/626 variants.

## Fonts
No .woff/.woff2 found in public/ root. App uses local fonts via src/app/fonts/ and next/font (need to inspect).

## Lighthouse (mobile, simulated Slow 4G, production build on localhost:3000)
- /ar (home): Performance 0.40, SEO 1.00, Accessibility 0.96, Best Practices 1.00 | LCP 11684ms, CLS 0.00027, TBT 942ms, FCP 2494ms, Speed Index 28036ms, INP undefined
- /en (home): Performance 0.35, SEO 1.00, Accessibility 0.96, Best Practices 1.00 | LCP 9938ms, CLS 0.00070, TBT 1183ms, FCP (see metrics), Speed Index high

Opportunities noted: server-response-time, redirects, unminified-css, unminified-javascript, unused-css-rules.

## SW / caching
sw.js: navigations network-first with offline fallback; images stale-while-revalidate cached up to 60; does NOT cache /_next/static. /sw.js served with no-cache (ok). No short timeout on navigation fallback per requirements. Missing headers for /_next/static/* immutable and /manifest.webmanifest.

## Splash
/src/app/[locale]/splash/page.tsx shows splash for 1600ms timeout before redirect (fixed minimum). Needs review against requirements (must only wait for load/fonts/hero, keep "show once per session", don't delay page behind it).

## Ranked issues (initial)
| Issue | Evidence | Estimated gain | Fix |
|---|---|---|---|
| Large hero images (736px) | chef-noodles-736.webp 138KB, classic-burger-736.webp 110KB | LCP -20-40% | Convert/resize to needed widths, use next/image with priority for LCP, preload hero, generate 2x max of displayed size, compress better or serve smaller |
| Large JS bundles | 025e_g9ksha1v.js 223KB, 33a2u9zhdx554.js 155KB, 339edoft4wv45.js 149KB | TBT/LCP -10-30% | Code-split, dynamic imports for non-first-paint, move to server components where possible, remove unused deps |
| Unused CSS/JS | Lighthouse "unused-css-rules", opportunities suggest unminified | TBT -5-15% | Purge unused Tailwind, optimize imports |
| SW navigation fallback lacks timeout | sw.js line ~66-75 no timeout before fallback | Perceived speed | Add ~3s timeout, network-first with timeout |
| Splash fixed 1600ms | splash/page.tsx timeout | TTFB/LCP perception | Review; may need to propose shorter minimum if delays LCP (mark needs decision if changing) |
| Headers incomplete | next.config only /sw.js no-cache and /images/* immutable | Caching | Add headers for /_next/static/* immutable, manifest no-cache |
