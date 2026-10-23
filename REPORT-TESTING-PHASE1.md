# REPORT — Testing Phase 1: Tooling & Harness

Phase 1 — Test tooling and shared harness
Changed: `vitest.config.ts`, `tests/**`, `package.json` (scripts + dev deps), `package-lock.json`, `eslint.config.mjs`, `.gitignore`
Verified: `npm test` (8/8 pass), `npx tsc --noEmit` (pass), `npm run lint` (only the pre-existing `ItemDetail.tsx` error), `npm run test:cov` (report generated, global gate red as expected at this stage)
Build: pass (`tsc --noEmit` clean; lint unchanged from `master`)
Open questions: the coverage gate is enforced from the first commit, so `npm run test:cov` stays red until the later phases — the floor is never lowered to hide it.
Next: Phase 2 — unit specs for pure logic in `src/lib`

---

## 1. Files added

| File | Purpose |
|------|---------|
| `vitest.config.ts` | Vitest 5 + jsdom + React + tsconfig paths, `tests/setup.ts` as setup file, v8 coverage, thresholds 80/80/75/80, exclusion list exactly as `TESTING.md` section 2 |
| `tests/setup.ts` | jest-dom + `vitest-axe` matchers, `next/navigation`, `next/image`, `next/font`, `next/link` mocks, matchMedia, IntersectionObserver, ResizeObserver, scroll/pointer/visualViewport/rAF, object URLs, canvas stub, MSW lifecycle, storage cleanup, fixed clock |
| `tests/mocks/router.ts` | Mutable `next/navigation` mock (`useRouter`, `usePathname`, `useSearchParams`, `useParams`) |
| `tests/mocks/handlers.ts` | MSW handlers for the only real network boundary (`nominatim.openstreetmap.org`) |
| `tests/mocks/server.ts` | `setupServer(handlers)` |
| `tests/utils/render.tsx` | `renderWithProviders(ui, { locale, stores, route })`, `LOCALES`, dotted-path `t(key)` helper bound to the active dictionary |
| `tests/utils/stores.ts` | `resetStores()` and `applyStoreSeeds()` for the seven Zustand stores |
| `tests/utils/timers.ts` | `useFakeTimers()` (full) / `useDateOnlyTimers()` (default) and the `advanceTimers` bridge for `userEvent.setup` |
| `tests/factories/index.ts` | `makeDish`, `makeCartItem`, `makeAddress`, `makeOrder`, `makeOrderItem`, `makeMessage`, `makeUser` |
| `tests/data/arabic-pool.ts` | Arabic names, mixed names, diacritics, Arabic-Indic digits, emoji, very long words, empty/whitespace strings, RTL marks, XSS payloads |
| `tests/types/vitest-axe.d.ts` | `toHaveNoViolations` type augmentation |
| `tests/unit/smoke.test.tsx` | Harness smoke test (8 assertions) |

## 2. Test count

| Suite | Tests | Passed | Failed |
|-------|-------|--------|--------|
| `tests/unit/smoke.test.tsx` | 8 | 8 | 0 |
| **Total** | **8** | **8** | **0** |

## 3. Coverage against `TESTING.md` section 10

| Area | Target lines / branches | Current | Status |
|------|-------------------------|---------|--------|
| `src/lib` | 95% / 90% | 1.23% / 0% | red (Phase 2) |
| `src/store` | 90% / 85% | 22.31% / 2.81% | red (Phase 3) |
| `src/hooks` | 90% / 85% | n/a — the folder does not exist in the repo | n/a |
| `src/components` and screens | 80% / 75% | 0% | red (Phase 4) |
| Global floor | 80% / 75% | 2.18% lines / 0.31% branches | red, gate enforced |

The numbers come from `npm run test:cov`; the command exits non-zero on purpose because the thresholds in `vitest.config.ts` are live. They are not lowered or bypassed at any point of the work.

## 4. Real bugs found

| Where | What | Action |
|-------|------|--------|
| `src/components/item/ItemDetail.tsx:76` | Pre-existing ESLint error `react-hooks/set-state-in-effect` (three `setState` calls in an effect body). Not introduced by this phase and outside the testing scope. | **Reported, not fixed** (guardrail: no silent fixes to unrelated code). It makes `npm run lint` fail on `master` as well. |

No runtime bug was found yet; the harness only exercises the shared utilities.

## 5. Untestable / not applicable in this phase

- `Zod` schema contracts: the repository has no Zod dependency and no schema layer (see deviations), so the contract phase uses hand-written validators against the MSW handlers instead.
- `chatStore` and `draftStore` do not exist in the repo; the chat screen is a sheet over a mock API, so those store specs are reported as missing rather than faked.
- `src/hooks` does not exist; the hooks live in `src/lib` (`useFocusTrap.ts`, `useAuthGuard.ts`).
- `size-limit` and `lighthouse` budgets need a production build and are deferred to the performance phase.

## 6. Deviations from `TESTING.md` (deliberate, documented)

1. **MSW option name.** MSW 3 renamed `onUnhandledRequest` to `onUnhandledFrame`; `tests/setup.ts` uses `onUnhandledFrame: "error"` so an unmocked request still fails the test.
2. **`vitest-axe` matcher registration.** `vitest-axe/dist/extend-expect.js` ships empty, so `expect.extend({ toHaveNoViolations })` is done manually in `tests/setup.ts`.
3. **Fake-timer bridge.** `@testing-library/dom` only advances fake timers when a `jest` global exists; `tests/setup.ts` installs a minimal `globalThis.jest` shim instead of changing app code.
4. **Default clock.** Only `Date` is faked by default (`2026-10-20T10:00:00+03:00`) so Testing Library and `user-event` keep working; full fake timers are opt-in through `tests/utils/timers.ts`.
5. **Type zone.** The suite is run with `cross-env TZ=Africa/Cairo` as required, and `Intl` with the Cairo zone is used instead of hardcoded offsets, so the Egypt DST change is handled by the tz database.
6. **ESLint ignores.** `**/*.d.ts` was added to `globalIgnores` so the type-augmentation file does not fail the lint rules that do not apply to declaration files.
7. **Coverage exclusions** are exactly the list in `TESTING.md` section 2, including `src/**/index.ts`. `src/lib/i18n/index.ts` is therefore outside the coverage denominator even though it is covered by the i18n parity tests.
8. **Report artifacts** (`coverage/`, `playwright-report/`, `test-results/`, `.stryker-tmp/`) are added to `.gitignore` so the reports stay out of the repository.

## 7. Commands

```bash
npm test          # vitest run, TZ=Africa/Cairo
npm run test:cov  # vitest run --coverage (global gate live)
npm run typecheck # tsc --noEmit
npm run lint      # eslint
```
