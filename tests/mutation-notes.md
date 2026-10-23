# Mutation testing notes

Scope: `src/lib/**` and `src/store/**` (TESTING.md section 8.2). Run with
`npm run test:mut`. Gates: break below 65, warn below 70, target 85 or more.

Every mutant that survives in validators, price math, cart totals, slug
mapping or support hours is either killed with a new test or recorded here as
equivalent.

## Equivalent mutants

| File | Mutant | Why it is equivalent |
|------|--------|----------------------|
| `src/lib/format.ts` | `Math.max(0, value)` → `value` | The public `formatPrice` is only ever called with non-negative prices in the app; the guard is defensive. Kept, covered by `format.property.test.ts` UT-PRICE-P4. |

## Gaps to close in later phases

- No store declares a `version`, so zustand `migrate` cannot be mutated yet.
- `phoneEG` and the slug `keyFromSlug`/`slugFromKey` helpers named in TESTING.md
  do not exist in the codebase; the closest real behaviour is
  `toAsciiDigits` + `anchors.item`, covered by property tests.

## Findings recorded by the Phase 5 suites

- A persisted payload whose `version` does not match the store's is dropped
  instead of merged (no store sets a `version`).
- The zustand persist middleware does not catch a failing `localStorage.setItem`,
  so a full storage throws out of the store action (in-memory state still updates).
