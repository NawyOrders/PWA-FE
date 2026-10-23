# Screen Audit

Last updated: 2026-10-23

## Method

This audit combines:

- the production route inventory from `npm run build`;
- route and component tests from the full Vitest run;
- the accessibility suite (axe checks in `tests/unit/a11y`);
- the normalization scan (`npm run check:norm`);
- the RTL/LTR test matrix already present in the route tests.

Manual browser screenshots at the target widths were not re-run during this final verification pass. The "Visual QA" column records that limitation rather than claiming a visual result.

## Route inventory

| Route | Screen | Automated coverage | Visual QA |
|---|---|---|---|
| `/[locale]` | Home | Home route tests, a11y, build | Manual pass pending |
| `/[locale]/menu` | Menu | Menu route tests, build | Manual pass pending |
| `/[locale]/favorites` | Favorites | Favorites route tests, build | Manual pass pending |
| `/[locale]/cart` | Cart | Cart tests, checkout reconciliation tests | Manual pass pending |
| `/[locale]/orders` | Order history | Orders tests, accepted filter and totals | Manual pass pending |
| `/[locale]/profile` | Profile | Profile tests, a11y | Manual pass pending |
| `/[locale]/profile/personal-info` | Personal information | Route tests, validation tests | Manual pass pending |
| `/[locale]/profile/addresses` | Addresses | Route tests, a11y | Manual pass pending |
| `/[locale]/profile/help` | Help and support | Route tests, a11y | Manual pass pending |
| `/[locale]/profile/help/faq` | FAQ | Route tests, a11y | Manual pass pending |
| `/[locale]/profile/help/feedback` | Feedback | Route tests, a11y | Manual pass pending |
| `/[locale]/delivery` | Fulfilment selection | Delivery tests, zone-fee regression | Manual pass pending |
| `/[locale]/address` | Delivery address and zone | Location picker tests, quote/zone tests | Manual pass pending |
| `/[locale]/restLocation` | Branch selection | Branch tests | Manual pass pending |
| `/[locale]/payment` | Payment and order submission | Payment tests, validation/order API tests | Manual pass pending |
| `/[locale]/payConfirmation` | Order confirmation | Route wrapper tests | Manual pass pending |
| `/[locale]/tracking` | Order tracking | Route wrapper tests, status tests | Manual pass pending |
| `/[locale]/item/[slug]` | Item detail | Item route tests | Manual pass pending |
| `/[locale]/admin/orders` | Admin orders and print | Admin tests, receipt/print tests | Manual pass pending |
| `/[locale]/login` | Login and OTP | Login tests, a11y | Manual pass pending |
| `/[locale]/splash` | Splash | Splash tests | Manual pass pending |
| `/[locale]/offline` | Offline fallback | Offline route tests | Manual pass pending |
| `/[locale]/aboutNawyOrders` | About NawyOrders | Page tests | Manual pass pending |
| `/[locale]/aboutRestaurant` | About the restaurant | Page tests | Manual pass pending |
| `/[locale]/aboutSpaceTech` | About SpaceTech | Page tests | Manual pass pending |
| `/[locale]/privacyPolicy` | Privacy policy | Page tests | Manual pass pending |
| `/[locale]/termsAndConditions` | Terms and conditions | Page tests | Manual pass pending |
| `/[locale]/dataProcessingAgreement` | Data processing agreement | Page tests | Manual pass pending |
| `/[locale]/dev/components` | Component showcase | Page tests | Development only |
| `/manifest.webmanifest` | PWA manifest | App-shell tests | Not a visual screen |
| `/api/delivery/quote` | Delivery quote API | Server quote tests, MSW handlers | Not a visual screen |
| `/api/checkout/validate` | Checkout validation API | Server validation tests | Not a visual screen |
| `/api/orders` | Order creation API | Server order tests | Not a visual screen |
| `/api/admin/catalog` | Catalog mutation API | Route guard and catalog tests | Not a visual screen |

All routes above are emitted by the production build in Arabic and English where applicable.

## Bug-area audit

| Area | Expected behaviour | Result |
|---|---|---|
| Cart and checkout price changes | Client price is corrected, change is reported, totals use authoritative prices, order creation is not blocked by a price-only change | Pass |
| Branch availability | Availability is evaluated for the branch serving the selected zone; inactive, out-of-stock, and missing dishes block checkout | Pass |
| Delivery fee timing | Fee stays at zero/pending until a zone quote succeeds; pickup is always zero | Pass |
| Zone routing | Zamalek routes to Downtown Branch at the configured fee | Pass |
| Order creation | Accepted order uses server prices, quantity, fee, discount, and tax; idempotency key prevents duplicates | Pass |
| Receipt contents | Header, order number, branch, fulfilment, zone/address, items, modifiers, notes, subtotal, delivery fee, tax, discount, total | Pass |
| Receipt direction | Arabic receipt is RTL, English receipt is LTR, order text is escaped | Pass |
| Print workflow | 80mm iframe document, browser print dialog, duplicate-job lock, failure state and retry | Automated pass |
| Physical print | Actual printer output, Arabic shaping on the device, and paper width | Not verifiable without hardware |

## Layout and accessibility checks

| Check | Result |
|---|---|
| Hardcoded colours | None found by `check:norm` |
| Physical direction utilities | None found by `check:norm` |
| Viewport hacks | None found by `check:norm` |
| Raw Arabic literals outside the approved baseline | None found by parity tests |
| Translation key parity and placeholders | Pass |
| Axe accessibility suite | Pass in the full test run |
| RTL/LTR rendering contracts | Covered by route tests in both locales |
| Manual desktop and mobile visual matrix | Pending |

## Open visual checks

1. Home, menu, cart, orders, checkout, admin orders, and login at 360, 390, and 430 pixels in Arabic and English.
2. Desktop layouts at 1366, 1440, and 1920 pixels, including the focused checkout columns and the admin order list.
3. Print preview at 80mm, including Arabic glyph joining, margins, and page breaks for long orders.
4. Keyboard-only walkthrough of the admin print action and checkout flow.
