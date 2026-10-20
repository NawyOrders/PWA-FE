# REPORT-PERFORMANCE.md (Phase 1 - BEFORE)
Date: 2026-10-20 15:49:49
Branch: perf/loading-and-seo

## Build route sizes (First Load JS / route groups)
From Next.js build (App Router). See build summary above.
SSG routes: most pages under (shell)/ and standalone pages are prerendered as ● (SSG). 
Dynamic routes: /[locale]/item/[slug] shows ƒ (Dynamic). Middleware present.

## Largest client chunks (from .next/static/chunks)
1. 025e_g9ksha1v.js - 223.29 KB
2. 33a2u9zhdx554.js - 154.74 KB
3. 339edoft4wv45.js - 149.00 KB
4. 0cz1d0mv5g_q7.js - 109.96 KB
5. 36am1e894x01e.css - 47.41 KB
6. 10vn_55qt-vq4.js - 45.45 KB
7. 08v2-wl9t5nir.js - 40.15 KB
8. 14w8mtvq9q19t.js - 36.58 KB
9. 2mf6i0z_scgk4.js - 34.20 KB
10. 38ithj_08elq2.js - 33.17 KB

Total chunks size: ~1550.89 KB (64 files)

## Images (public/images)
Total: 77 files, ~2005.45 KB
Largest:
- chef-noodles-736.webp (138.22 KB), chef-noodles-736.avif (96.80 KB)
- classic-burger-736.webp (109.70 KB), cheese-pizza-736.webp (106.54 KB), special-shawarma-736.webp (100.51 KB)
- Many 736px variants > 80KB; also have 256/626px variants. Next/Image is used with sizes/quality.

## Fonts
No .woff/.woff2 files in public/ root visible. Using next/font? Check app/fonts or src/app/fonts.

## Third-party scripts
None obvious in components. RegisterSW only registers sw.js in prod. No analytics/chat/maps found.

## Global listeners / effects / animations
- FeaturedCarousel: setInterval every 5000ms, pointer/mouse listeners for pause
- StoreHydrator: useEffect on mount (rehydrates stores)
- RegisterSW: useEffect for SW registration
- Various components use useEffect (18 in .tsx, 8 in .ts by rough grep) - need to audit for long tasks/loops

## Service worker
public/sw.js: CACHE_NAME v3, navigations fetch with catch to offline; images use stale-while-revalidate with trim to 60; does NOT cache /_next/static (skips if startsWith /_next/static). Missing short timeout before falling back for navigations per requirements? Needs adjustment. Cache version bump needed per requirements.

## next.config
Has images.formats avif/webp, deviceSizes [320,384,480,640,736], imageSizes [64,96,128,192,256], minimumCacheTTL 31 days. Headers: /sw.js no-cache; /images/* immutable 1 year. Missing headers for /_next/static/* (should be immutable 1y), /manifest.webmanifest no-cache, and images under different paths may need policy. Also need to ensure compression/brotli handled by host.

## Dynamic routes
/[locale]/item/[slug] is ƒ (Dynamic). Others static. Need to check why dynamic.

## Splash
src/app/[locale]/splash/page.tsx: 1600ms timeout before redirect. Must only wait for window load, fonts ready, hero image; show-once per session; must not delay page behind it. Needs review - cost of 700ms minimum mentioned in requirements.
