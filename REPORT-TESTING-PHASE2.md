# REPORT — Testing Phase 2: Unit Specs for Pure Logic (`src/lib`)

Phase 2 — Unit specs for the pure logic of `src/lib` plus the design-token scan
Changed: 15 new test files, `src/lib/format.ts` (price formatting), `src/lib/validators.ts` (name validation), `src/styles/globals.css` (missing tokens), `tailwind.config.ts` (token names), `eslint.config.mjs` (ignore the coverage folder)
Verified: `npm test` (197/197 pass, 16 files), `npx tsc --noEmit` (pass), `npm run lint` (only the pre-existing `ItemDetail.tsx` error), `npm run test:cov` (`src/lib` at 83.57% lines / 77.77% branches, global gate still red as expected)
Build: pass (`tsc --noEmit` clean; the only lint error is pre-existing on `master`)
Open questions: the support schedule uses the runtime timezone instead of Africa/Cairo, and the phone validation is still an inline 10-digit regex — both are product decisions, see section 4.
Next: Phase 3 — unit specs for the stores and hooks

---

## 1. Files added

| File | Purpose |
|------|---------|
| `src/lib/format.test.ts` | `formatPrice`: whole vs. fractional amounts, clamping, grouping, no off-by-one piaster (8 tests) |
| `src/lib/validators.test.ts` | display name: trimming, length bounds, Arabic/Latin/diacritics, zero-width stripping, error order (18 tests) |
| `src/lib/text.test.ts` | `normalize`, `normalizeTokens`, `matchesQuery`, `highlightSegments`: diacritics, tatweel, alef/yeh/teh-marbuta folding, idempotence, no HTML injection (26 tests) |
| `src/lib/supportHours.test.ts` | open/closed, exact boundaries, week days, Egypt DST change, next-open label (15 tests) |
| `src/lib/digits.test.ts` | Arabic-Indic and extended Arabic-Indic digits, ASCII conversion (9 tests) |
| `src/lib/cn.test.ts` | class-name joiner (5 tests) |
| `src/lib/api.test.ts` | the mock API layer: latency, FAQ cache, validation errors, offline, rate limit per user and per hour, report ticket (16 tests) |
| `src/lib/image.test.ts` | dish image URLs, blur placeholder, aspect ratio, HEIC detection, upload resize/quality/EXIF (18 tests) |
| `src/lib/geocoding.test.ts` | reverse geocoding and address search over the MSW/nominatim boundary, error messages (12 tests) |
| `src/lib/delivery-addresses.test.ts` | localStorage persistence, active address, example addresses, change subscription (14 tests) |
| `src/lib/brand.test.ts` | brand config shape, `tel:` link, WhatsApp link, static scan for hardcoded contact data (9 tests) |
| `src/lib/orderStatus.test.ts` | `useOrderConfirmed` / `markOrderConfirmed`: session flag, event, 15 s window, unmount (6 tests) |
| `src/lib/i18n/i18n.test.ts` | locale config, `getDictionary`, `interpolate`, `pickLocalized`, `localizedHref`, anchors (19 tests) |
| `src/lib/i18n/parity.test.ts` | ar/en key parity, placeholders, empty values, static scan for missing keys and raw Arabic literals (9 tests) |
| `src/styles/tokens.test.ts` | every DESIGN.md 3.1 token and v2.x addition exists, header height token, hex-color scan, manifest colors (5 tests) |

## 2. Test count

| Suite | Tests | Passed | Failed |
|-------|-------|--------|--------|
| `src/lib/format.test.ts` | 8 | 8 | 0 |
| `src/lib/validators.test.ts` | 18 | 18 | 0 |
| `src/lib/text.test.ts` | 26 | 26 | 0 |
| `src/lib/supportHours.test.ts` | 15 | 15 | 0 |
| `src/lib/digits.test.ts` | 9 | 9 | 0 |
| `src/lib/cn.test.ts` | 5 | 5 | 0 |
| `src/lib/api.test.ts` | 16 | 16 | 0 |
| `src/lib/image.test.ts` | 18 | 18 | 0 |
| `src/lib/geocoding.test.ts` | 12 | 12 | 0 |
| `src/lib/delivery-addresses.test.ts` | 14 | 14 | 0 |
| `src/lib/brand.test.ts` | 9 | 9 | 0 |
| `src/lib/orderStatus.test.ts` | 6 | 6 | 0 |
| `src/lib/i18n/i18n.test.ts` | 19 | 19 | 0 |
| `src/lib/i18n/parity.test.ts` | 9 | 9 | 0 |
| `src/styles/tokens.test.ts` | 5 | 5 | 0 |
| **Phase 2 total** | **189** | **189** | **0** |
| `tests/unit/smoke.test.tsx` (Phase 1) | 8 | 8 | 0 |
| **Repository total** | **197** | **197** | **0** |

Test IDs follow `UT-<AREA>-<NN>` (`UT-FORMAT-01`, `UT-VALID-13`, `UT-I18N-PARITY-09`, `UT-TOKEN-04`, …) and each title starts with the ID.

## 3. Coverage against `TESTING.md` section 10

| Area | Target lines / branches | Current | Status |
|------|-------------------------|---------|--------|
| `src/lib` | 95% / 90% | 83.57% / 77.77% | amber — the remaining gap is the hooks and the two i18n providers (Phase 3 and Phase 4) |
| `src/store` | 90% / 85% | 22.31% / 2.81% | red (Phase 3) |
| `src/hooks` | 90% / 85% | n/a — the folder does not exist, the hooks live in `src/lib` | n/a |
| `src/components` and screens | 80% / 75% | 0% | red (Phase 4) |
| Global floor | 80% / 75% | 11.81% lines / 9.44% branches | red, gate enforced |

Per file inside the Phase 2 scope (from `npm run test:cov`):

| File | Lines | Branches | Functions |
|------|-------|----------|-----------|
| `src/lib/format.ts` | 100% | 100% | 100% |
| `src/lib/validators.ts` | 100% | 100% | 100% |
| `src/lib/text.ts` | 98% | 96.87% | 100% |
| `src/lib/supportHours.ts` | 100% | 100% | 100% |
| `src/lib/digits.ts` | 100% | 100% | 100% |
| `src/lib/cn.ts` | 100% | 100% | 100% |
| `src/lib/brand.ts` | 100% | 100% | 100% |
| `src/lib/image.ts` | 100% | 92.85% | 100% |
| `src/lib/geocoding.ts` | 100% | 92.85% | 100% |
| `src/lib/api.ts` | 96.42% | 80.55% | 100% |
| `src/lib/delivery-addresses.ts` | 97.36% | 79.31% | 86.66% |
| `src/lib/orderStatus.ts` | 94.73% | 100% | 85.71% |
| `src/lib/i18n/*` (dictionaries, anchors, types) | 100% | 100% | 100% |
| `src/lib/i18n/DictionaryProvider.tsx`, `LegacyProvider.tsx` | 45.45% / 40% | 25% | 40% / 25% | red (Phase 4, they are provider components) |
| `src/lib/useAuthGuard.ts`, `src/lib/useFocusTrap.ts` | 0% | 0% | 0% | red (Phase 3, hooks) |

The global gate is never lowered; `npm run test:cov` exits non-zero until the last phase.

## 4. Real bugs found

| Where | What | Action |
|-------|------|--------|
| `src/lib/format.ts:10` | `formatPrice` rounded every amount to whole pounds and printed `-0` for a negative value, so the spec "whole numbers without decimals, others with 2 decimals; negative rejected or clamped" was not met. | **Fixed** — the amount is clamped to `0` and formatted with 0 decimals when it is whole, 2 decimals otherwise. Every catalog price, the delivery fee and the `WELCOME20` discount are multiples of 100 piaster, so no visible price in the app changes. |
| `src/lib/validators.ts:8,11` | The display-name pattern rejected Arabic diacritics and `normalizeDisplayName` did not strip the zero-width characters, so a name such as `جميل\u200D جمال` was rejected although the spec allows diacritics and requires the zero-width characters to be stripped. | **Fixed** — the pattern now accepts `U+064B..U+0652`, `U+0670` and `U+06D6..U+06ED`, and the normalizer removes `U+200B..U+200D` and `U+FEFF` before the length check. |
| `src/styles/globals.css` | `--coral` (`#FF6B4A`) and `--bubble-end` (`#EC4A24`), the two tokens introduced by DESIGN.md 12.8, were missing from the token file, and the logo colors were named `--brand-gold` / `--brand-brown` instead of the DESIGN.md 3.1 `--brand-logo-gold` / `--brand-logo-brown`. | **Fixed** — the two tokens were added with the values of the spec and the two logo variables were renamed; `tailwind.config.ts` now points at the new names, the utility class names (`bg-brand-gold`, …) and the rendered colors are unchanged. |
| `src/lib/supportHours.ts:22-23` | The support schedule is evaluated with `now.getDay()` / `now.getHours()`, that is in the timezone of the visitor and not in Africa/Cairo. A visitor outside Egypt sees the wrong open/closed status. The tests pass only because the whole suite runs with `TZ=Africa/Cairo`. | **Reported, not fixed** — switching the computation to an explicit Cairo zone changes the displayed status for some visitors; it is an owner decision (the same decision is documented in `TESTING.md` section 15). |
| `src/lib/i18n/index.ts:5-12` | `locales`, `defaultLocale` and `isLocale` are duplicated from `src/lib/i18n/config.ts`; the two copies can drift and `config.ts` is dead code (`config.ts` shows 0% function coverage). | **Reported, not fixed** — consolidating the two modules is a refactor of app code, out of the testing scope. `src/lib/i18n/index.ts` is outside the coverage denominator because `TESTING.md` section 2 excludes `src/**/index.ts`. |
| `src/app/[locale]/login/page.tsx` (inline `/^\d{10}$/`) | The spec expects a `validators.phoneEG` unit that accepts only the Egyptian prefixes 10, 11, 12 and 15. The repository has no such unit; the login screen checks ten digits only, so `9999999999` is accepted as an Egyptian number. | **Reported, not fixed** — tightening the rule changes which phone numbers can log in; it needs a product decision. Phase 4 covers the current inline behaviour at the component level. |
| 20 component and app files (see `HEX_BASELINE` in `src/styles/tokens.test.ts`) | Hardcoded hex colors outside the token file, mostly in the legacy marketing pages (`aboutRestaurant`, `aboutSpaceTech`, `privacyPolicy`, `aboutNawyOrders`, `CartSummaryBar`, `OrderTrackingCard`). | **Reported and baselined** — the exact list is written in the test file, so the scan fails on any new offender while the known debt stays visible. Converting them to tokens would change the visuals of those pages, which the guardrails forbid without a design pass. |
| 10 files (see the baseline in `src/lib/i18n/parity.test.ts`) | Raw Arabic literals inside components (`CartSummaryBar.tsx:69`, `OrderTrackingCard.tsx:75-76`, `LanguageToggle.tsx:39`, `DesktopNav.tsx:92`), next to legitimate ones (the AM/PM markers, the `، ` separator, the PWA manifest, the metadata title). | **Reported and baselined** — same approach as the hex scan. The four real copies belong in the dictionary, the rest are format values. |
| `src/components/item/ItemDetail.tsx:76` | Pre-existing ESLint error `react-hooks/set-state-in-effect`, unchanged since Phase 1. | **Reported, not fixed** |

## 5. Untestable / not applicable in this phase

- **`validators.phoneEG`, `validators.otp`, `validators.coupon`, `validators.feedback`, `validators.image`** — no such units exist in the repository. The OTP demo code `747123` and the phone rule are inline in `src/app/[locale]/login/page.tsx`, the coupon lives in `src/store/cartStore.ts` and the image type check is `isHeicFile` in `src/lib/image.ts` (partially covered). They are covered at their real location in Phase 4 instead of being faked.
- **`searchFaq(items, query, locale)`** — no such function; the FAQ filter is written inline in `src/app/[locale]/(shell)/profile/help/faq/page.tsx:56,116` on top of `matchesQuery` and `highlightSegments`, both of which are covered here. The composed behaviour is tested with the FAQ screen in Phase 4.
- **`slugs` / section anchors** — the repository has route anchors (`src/lib/i18n/anchors.ts`) but no `slugFromKey` / `keyFromSlug` pair; the FAQ deep links use `#id` anchors, not slugs. The round-trip property of `TESTING.md` section 8.1 is therefore not applicable and is reported instead of being faked.
- **`dayLabel` / `formatTime`** — `formatTime` is a private function of `src/lib/supportHours.ts` and no `dayLabel` ("اليوم" / "أمس") exists; the chat date chips of DESIGN.md 12.8 are not implemented (there is no chat store).
- **`api` failure injection (`fail: true`) and the `RATE_LIMITED` error code** — the mock layer has no failure-injection switch; the rate limit throws `RateLimitError`. The thrown type is asserted instead of the code.
- **Zod contracts** — the repository has no Zod dependency, so the "resolves with the typed shape" cases are asserted with plain type checks.
- **`src/lib/useAuthGuard.ts` and `src/lib/useFocusTrap.ts`** — hooks, covered in Phase 3.
- **Contrast ratios for the new tokens** — the contrast test of `TESTING.md` section 8.3 needs the component phase; the token values are in place.

## 6. Deviations from `TESTING.md` (deliberate, documented)

1. **Baselines instead of skipped assertions.** The hex-color scan and the raw-Arabic-literal scan carry an explicit, visible list of the pre-existing offenders. The tests still fail on any new offender; the list is not a way to hide a failure but a record of the current debt (section 4).
2. **`formatPrice` grouping.** The thousands separator of `Intl.NumberFormat("en-US")` is kept (the current behavior of the app); the spec only fixes the decimals, the clamping and the rounding.
3. **Static scans run over `src/`.** The dictionary and token scans read the sources from disk (`node:fs`) instead of importing the modules, so they can look at usage sites as well.
4. **`src/lib/i18n/index.ts` is excluded from the coverage denominator** because `TESTING.md` section 2 excludes `src/**/index.ts`; the i18n behaviour is still asserted through the public API.
5. **`coverage/**` was added to the ESLint ignores** so the generated report is not linted (it produced two warnings in this phase).
6. **The DST test uses the tz database.** The Egypt change (2026-10-29 is still UTC+3, 2026-10-30 is UTC+2) is asserted through `TZ=Africa/Cairo` and `Intl`, never with a hardcoded offset.

## 7. Commands

```bash
npm test          # vitest run, TZ=Africa/Cairo — 197/197
npm run test:cov  # vitest run --coverage (global gate live, still red)
npm run typecheck # tsc --noEmit
npm run lint      # eslint (1 pre-existing error)
```
