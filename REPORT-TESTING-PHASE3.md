# REPORT — Testing Phase 3: Unit Specs for the Stores and Hooks

Phase 3 — Unit specs for the Zustand stores of `src/store` and for the two hooks that exist in `src/lib`
Changed: 9 new test files (7 stores, 2 hooks), 6 extra tests inside 4 Phase 2 files, `src/store/languageStore.ts` (validate the stored locale on rehydration)
Verified: `npm test` (318/318 pass, 25 files — the state at the end of Phase 3), `npx tsc --noEmit` (pass), `npm run lint` (only the pre-existing `ItemDetail.tsx` error), `npm run test:cov` (`src/store` at 100% lines / 92% branches, `src/lib` at 99.28% lines / 98.33% branches, global gate still red as expected)
Build: pass (`tsc --noEmit` clean; the only lint error is pre-existing on `master`)
Open questions: the spec rows of `TESTING.md` section 6 that describe staged edits, undo, dirty flags and the login-required flag are not implemented in the stores — they live in the screens, so they move to Phase 4; `chatStore`, `draftStore` and eight of the ten spec hooks do not exist in the repository.
Next: Phase 4 — unit specs for the components and the screens

---

## 1. Files added

| File | Purpose |
|------|---------|
| `src/store/cartStore.test.ts` | add / merge identical items, stepper, remove, clear, subtotal and discount in piaster, coupon, delivery vs. pickup, persistence, migration, corrupt storage, item key (37 tests) |
| `src/store/authStore.test.ts` | guest by default, login, remember-me persistence, display name, logout, corrupt storage, rehydration (10 tests) |
| `src/store/favoritesStore.test.ts` | toggle on and off, no duplicates, count, persistence, corrupt storage, rehydration (10 tests) |
| `src/store/addressStore.test.ts` | seeded list, create, format the address line in both languages, list comparison (10 tests) |
| `src/store/languageStore.test.ts` | default `ar`, switch, cookie, persistence, rehydration, unknown stored locale, missing stored locale (8 tests) |
| `src/store/ordersStore.test.ts` | seeded orders, add at the top, order numbering, `processing` status, persistence, corrupt storage (11 tests) |
| `src/store/uiStore.test.ts` | drawer, login modal, toast queue and ids, hydration flag (9 tests) |
| `src/lib/useFocusTrap.test.tsx` | initial focus, Tab / Shift+Tab loop, Escape, focus restore, closed trap, empty container (12 tests) |
| `src/lib/useAuthGuard.test.ts` | the action runs for a logged-in user, a guest gets the login modal (3 tests) |

Extra tests inside the Phase 2 files (to close the branch gaps of `src/lib`):

| File | Added | Why |
|------|-------|-----|
| `src/lib/image.test.ts` | 1 | the upload falls back to the original file when the 2d context is missing |
| `src/lib/geocoding.test.ts` | 1 | the English message of a response without a display name |
| `src/lib/delivery-addresses.test.ts` | 5 | wrong field types, the server-render guards, confirming an address that is already stored |
| `src/lib/api.test.ts` | 4 | corrupted / malformed stored attempts, the server-render guard of the rate limit |

## 2. Test count

| Suite | Tests | Passed | Failed |
|-------|-------|--------|--------|
| `src/store/cartStore.test.ts` | 37 | 37 | 0 |
| `src/store/authStore.test.ts` | 10 | 10 | 0 |
| `src/store/favoritesStore.test.ts` | 10 | 10 | 0 |
| `src/store/addressStore.test.ts` | 10 | 10 | 0 |
| `src/store/languageStore.test.ts` | 8 | 8 | 0 |
| `src/store/ordersStore.test.ts` | 11 | 11 | 0 |
| `src/store/uiStore.test.ts` | 9 | 9 | 0 |
| `src/lib/useFocusTrap.test.tsx` | 12 | 12 | 0 |
| `src/lib/useAuthGuard.test.ts` | 3 | 3 | 0 |
| **Phase 3 new files** | **110** | **110** | **0** |
| `src/lib/api.test.ts` (+4) | 20 | 20 | 0 |
| `src/lib/image.test.ts` (+1) | 19 | 19 | 0 |
| `src/lib/geocoding.test.ts` (+1) | 13 | 13 | 0 |
| `src/lib/delivery-addresses.test.ts` (+5) | 19 | 19 | 0 |
| **Phase 3 total (new + extended)** | **121** | **121** | **0** |
| Phase 1 + Phase 2 suites | 208 | 208 | 0 |
| **Repository total** | **318** | **318** | **0** |

Test IDs follow `UT-<AREA>-<NN>` (`UT-CART-01`, `UT-AUTH-06`, `UT-LANG-06`, `UT-FOCUS-04`, `UT-GUARD-02`, …) and each title starts with the ID.

## 3. Coverage against `TESTING.md` section 10

The numbers below are the state **at the end of Phase 3**. The current numbers live in `REPORT-TESTING-PHASE4.md`.

| Area | Target lines / branches | Current | Status |
|------|-------------------------|---------|--------|
| `src/lib` | 95% / 90% | 99.28% / 98.33% | green |
| `src/store` | 90% / 85% | 100% / 92% | green |
| `src/hooks` | 90% / 85% | n/a — the folder does not exist, the two hooks live in `src/lib` | covered above |
| `src/components` and screens | 80% / 75% | 0% | red (Phase 4) |
| Global floor | 80% / 75% | 17.32% lines / 16.04% branches | red, gate enforced |

Per file inside the Phase 3 scope (from `npm run test:cov`):

| File | Lines | Branches | Functions |
|------|-------|----------|-----------|
| `src/store/cartStore.ts` | 100% | 90.91% | 100% |
| `src/store/authStore.ts` | 100% | 100% | 100% |
| `src/store/favoritesStore.ts` | 100% | 100% | 100% |
| `src/store/addressStore.ts` | 100% | 100% | 100% |
| `src/store/languageStore.ts` | 100% | 83.33% | 100% |
| `src/store/ordersStore.ts` | 100% | 100% | 100% |
| `src/store/uiStore.ts` | 100% | 100% | 100% |
| `src/lib/useAuthGuard.ts` | 100% | 100% | 100% |
| `src/lib/useFocusTrap.ts` | 100% | 100% | 100% |
| `src/lib/api.ts` | 100% | 94.44% | 100% |
| `src/lib/image.ts` | 100% | 100% | 100% |
| `src/lib/geocoding.ts` | 100% | 100% | 100% |
| `src/lib/delivery-addresses.ts` | 97.37% | 100% | 86.67% |
| `src/lib/i18n/DictionaryProvider.tsx`, `LegacyProvider.tsx` | 45.45% / 40% | 25% | 40% / 25% | red (Phase 4, provider components) |
| `src/lib/i18n/config.ts` | 66.67% | 100% | 0% | dead code, see section 4 |

The global gate is never lowered; `npm run test:cov` exits non-zero until the last phase.

## 4. Real bugs found

| Where | What | Action |
|-------|------|--------|
| `src/store/languageStore.ts:16` | The persisted locale was restored without any validation, so a stored value such as `"fr"` (a hand-edited `localStorage`, or a locale that no longer exists) put the app in an unknown locale: the dictionaries fell back to Arabic but the direction, the `lang` attribute and the cookie stayed inconsistent. | **Fixed** — the persist middleware now merges the stored state through a validation: an unknown or missing locale keeps the current one, so the store always holds `"ar"` or `"en"`. The switch itself is unchanged. |
| `src/store/cartStore.ts:134-141` | The coupon is not re-validated when the cart changes: after applying `WELCOME20` to a 12 000 piaster cart and removing the item, the coupon stays applied to an empty cart. | **Reported, not fixed** — the discount itself is safe (`getCartTotals` caps it at the subtotal, so the total can never go below 0 and the cart is never negative), but the spec row "removing items re-validates the coupon" is not met by the store. Clearing the coupon automatically changes the behaviour of the cart screen, so it needs an owner decision. |
| `src/store/favoritesStore.ts` | Toggling a favorite always writes to the store; the spec row "toggling as a guest triggers the login-required flag instead of saving" is not implemented in the store. | **Reported, not fixed** — the guest check is done by the components (`useAuthGuard` + the `uiStore` login modal). The store stays a pure container; the behaviour is asserted at the component level in Phase 4. |
| `src/store/addressStore.ts` | The store only holds the saved list (`createAddress`, `formatAddressLine`, `sameAddressList`); the staged add / edit / remove, the 5 s undo, the dirty flag, the "Save" commit and the maximum of five addresses of `TESTING.md` section 6 are implemented in the Addresses screen, not in the store. | **Reported, not fixed** — the screen is the owner of the draft state today. Phase 4 covers the screen behaviour; the store cases are asserted at the level where the behaviour actually lives. |
| `src/lib/i18n/config.ts` | `config.ts` duplicates `locales` / `defaultLocale` / `isLocale` from `src/lib/i18n/index.ts` and is never imported (0% function coverage). | **Reported, not fixed** — same finding as Phase 2, out of the testing scope. |
| `src/components/item/ItemDetail.tsx:76` | Pre-existing ESLint error `react-hooks/set-state-in-effect`, unchanged since Phase 1. | **Reported, not fixed** |

## 5. Untestable / not applicable in this phase

- **`chatStore`** — no such store exists in the repository (`src/store` contains `addressStore`, `authStore`, `cartStore`, `favoritesStore`, `languageStore`, `ordersStore`, `uiStore`). The chat screen of DESIGN.md 12.8 has no message store yet, so the sending / failed / retry / offline-queue / 100-message / date-grouping rows cannot be written. Reported instead of being faked.
- **`draftStore` / session drafts** — no draft store exists; the feedback screen keeps its form state in the component. Covered with the screen in Phase 4.
- **`useCountdown`, `useDebounce`, `useMediaQuery`, `useScrollLock`, `useReveal`, `usePresence`, `useSessionFlag`, `useIdleCallback`** — none of these hooks exists in the repository; the only hooks are `useFocusTrap` and `useAuthGuard` (both covered here). The behaviours they describe (the 60 s OTP countdown, the search debounce, the splash session flag) live inside the components and are asserted there in Phase 4.
- **The OTP login flow of `authStore`** — the store takes a ready-made user object; the demo code `747123` and the phone rule are in `src/app/[locale]/login/page.tsx`. The store cases (guest by default, login, logout, persistence, corrupt storage) are covered here, the screen cases (wrong OTP keeps the guest) in Phase 4.
- **`ordersStore`** — not listed in `TESTING.md` section 6; covered anyway because it is a persisted store and the order-history screen depends on it.
- **The "undo after Save is impossible" row** — depends on the Addresses screen, see section 4.
- **`useFocusTrap` with a container that has no focusable child** — the hook calls `container.focus()`, but a `div` without `tabindex` cannot take the focus, so the assertion is that the focus stays where it was; the fallback branch itself is covered.

## 6. Deviations from `TESTING.md` (deliberate, documented)

1. **The stores are tested through their public API, not through the spec rows.** Where a spec row describes a behaviour that the store does not own (the staged address edits, the login-required flag), the row is reported in section 4 and the behaviour is asserted at the level that implements it, instead of a test that only pretends to exist.
2. **The rehydration is done on the real store instance** with `useXStore.persist.rehydrate()` after writing a fixture into `localStorage`; `skipHydration: true` is on every store, so no test depends on the hydration order of the module.
3. **The `localStorage` fixtures are the real storage.** Nothing is mocked in the storage layer, so a corrupt value is exercised exactly as it would arrive in the browser.
4. **The server-render guards are asserted with `vi.stubGlobal("window", undefined)`** (`delivery-addresses.ts`, `api.ts`): the `typeof window === "undefined"` branches are real branches of the app and are reached that way instead of being left uncovered.

## 7. Commands

```bash
npm test          # vitest run, TZ=Africa/Cairo — 318/318
npm run test:cov  # vitest run --coverage (global gate live, still red)
npm run typecheck # tsc --noEmit
npm run lint      # eslint (1 pre-existing error)
```
