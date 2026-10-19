# AGENTS.md — Agent workflow for the Karam El Sham app

For coding agents (opencode, Claude Code, others). Always read, in this order: `AGENTS.md` (this file), `CLAUDE.md` (conventions and hard rules), `DESIGN.md` (visual spec). If they conflict, `DESIGN.md` wins on visuals and `CLAUDE.md` wins on code conventions.

## Operating principles

1. **Inspect before editing.** Look at the repository, list what exists, and say what you will change. Then do it.
2. **Ask once, early.** If the stack, a brand asset or a design detail is missing, ask a short question with your recommended default, and continue with the default if there is no answer.
3. **Small, verifiable steps.** Finish one screen completely (build passes, RTL and LTR checked) before starting the next.
4. **Never redesign.** Reproduce the spec. Do not "improve" spacing, colors or copy.
5. **Prove it.** At the end of each phase show: files changed (`git diff --stat`), build result, and what you verified in the browser.
6. **Stay in scope.** If you notice a problem outside the task, report it in one line; do not fix it silently.

## Roles (use as sub-agents or as your own checklist hats)

| Role | Responsibility |
|------|----------------|
| Architect | Folder structure, routing, stores, i18n, tokens |
| UI builder | Components and screens that match `DESIGN.md` |
| Motion | Transitions, micro-interactions, reduced-motion handling |
| QA | RTL/LTR, widths 360/390/430, keyboard, console and network errors |
| PWA | Manifest, icons, service worker, offline page |

## Build order (phases)

**Phase 0 — Foundation**
- Scaffold or verify the project, set up Tailwind, fonts, `globals.css` tokens from `DESIGN.md` section 3, `motion.css`.
- i18n dictionaries (ar default, en), locale routing, `dir` handling, `formatPrice`.
- Mock data: 5 categories (برجر، بيتزا، شاورما، نودلز، حلويات), 12+ dishes with real names matching their photos, a demo user, 3 orders (delivered, cancelled, delivered).
- Stores: auth, cart, favorites, language.
- Done when: build passes, a blank shell renders in AR and EN with the right direction.

**Phase 1 — Shared components**
Header, circle icon button, primary button, product card, category circle, filter chip, status badge, search pill, input, phone input, OTP input, quantity stepper, modal, drawer, language toggle, list row, toast.
Done when: a `/dev/components` page (dev only) shows every component in AR and EN.

**Phase 2 — Screens**, one at a time, in this order:
1. Splash and Login/OTP (with the countdown and 6 boxes)
2. Home (featured card + pager, categories, product list, search)
3. Menu
4. Favorites
5. Cart (stepper, swipe-to-delete, delete-all, coupon `WELCOME20` = 20 جـ discount, summary)
6. Order history (filter chips, reorder adds items to the cart)
7. Profile
8. Drawer and the login-required modal (shown when a guest tries to checkout, favorite, or reorder)
9. Personal information (edit name), reached from the Profile row "المعلومات الشخصية" (spec: `DESIGN.md` 12.1)
10. Addresses (list, remove, add), reached from the Profile row "العناوين" (spec: `DESIGN.md` 12.5); build the shared settings-style layout first and reuse it for screens 9 and 10
11. Help and support (2×2 option cards + "تواصل معنا" CTA), reached from the Profile row "المساعدة والدعم" (spec: `DESIGN.md` 12.6); reuse the settings-style layout with the configurable CTA slot and build the reusable `OptionCard`

**Phase 3 — Behavior**
- Guest vs logged-in: guests browse freely; add-to-cart works; checkout, favorites and reorder open the login-required modal.
- Cart persists in `localStorage`. Favorites persist. Language persists.
- Language switch updates direction instantly and keeps the current route.

**Phase 4 — Motion and polish**: transitions, heart pop, cart bounce, featured float, drawer and modal animations, skeleton loaders. All `transform`/`opacity` only.

**Phase 5 — PWA**: `app/manifest.ts` (name, short name, colors from tokens, `lang: "ar"`, `dir: "rtl"`), icons generated from the logo (192, 512, maskable 512 with safe padding on a solid background, apple-touch 180), hand-written `public/sw.js` (network-first navigations with `/offline.html` fallback, no caching of `/_next/static`), `RegisterSW` that registers in production only. Test with `npm run build && npm start`.

## Acceptance criteria per screen

Every screen must:
- match `DESIGN.md` (tokens, radius, spacing, component specs);
- work at 360, 390 and 430px, in RTL and LTR, with no horizontal scroll;
- have a loading state (skeleton) and an empty state where relevant (empty cart, no favorites, no orders), with Arabic copy;
- be keyboard accessible, with visible focus and labeled icon buttons;
- not draw mockup chrome (status bar, notch, home indicator).

Screen-specific checks:
- **Login/OTP:** send button disabled until a valid Egyptian number (10 digits after +20); countdown from 60s; boxes auto-advance, backspace goes back, paste fills all six; wrong code shakes the row.
- **Home:** pager dots follow the featured slides; categories filter the list; active ring and label in primary.
- **Cart:** stepper updates the total live; swipe reveals delete; delete-all asks for confirmation; coupon shows success or error; CTA pinned at the bottom.
- **Orders:** chips filter; "اعادة الطلب" adds the order's items and opens the cart.
- **Drawer:** closes on backdrop tap, Escape, and link tap; focus returns to the menu button.
- **Personal information:** matches the measurements in `DESIGN.md` 12.1 at 390px and, on desktop, as a 480px centered column with the same sizes; Save disabled until the name changed and is valid; Enter submits; validation messages in Arabic and English; dirty Back asks for confirmation; saved name updates the header, drawer and profile; CTA pinned at the bottom only on mobile.
- **Addresses:** matches `DESIGN.md` 12.5 at 390px and, on desktop, as the same 480px centered column; cards are list items with an edit button and a separate 44px delete button; delete is staged with an undo toast (5s) and committed by Save; Save disabled until something changed; dirty Back asks for confirmation; empty, loading and error states exist; maximum 5 addresses with the limit hint; Arabic subtitle uses the corrected text ("ادارة عناوين التوصيل الخاصة بك"); the proposed address form is clearly marked as a placeholder until the real mockup arrives.
- **Help and support:** matches `DESIGN.md` 12.6 at 390px and, on desktop, as the same 480px centered column with the grid kept at 2 equal columns inside the gutter (not 4); each card is one 44px+ target with an accessible name of title plus subtitle; the chat status is computed from the support hours and shown as online or offline; the CTA opens `tel:` on phones and a contact modal (number, copy, WhatsApp, email) on desktop; contact details come from the brand config; the four destinations exist as clearly marked placeholders; the subtitle uses "في اي وقت".

## Screen intake protocol (new screens from images)

1. Read the new section in `DESIGN.md` section 12 for the screen (measurements, states, behavior, tokens).
2. Inspect what already exists (routes, components, stores, dictionary keys) and reuse it; build only what is missing.
3. Build desktop first, then tablet, then mobile. On desktop keep the mobile dimensions 1:1 inside a centered column (dimension fidelity rule), never scale components up.
4. Compare with the mockup at 390px: sizes, spacing, radius, colors and copy must match; list any difference and why.
5. Add all text to both dictionaries; add new colors as tokens; no mockup chrome.
6. Report in the standard format, then wait for the next image.

## Guardrails

- Do not add dependencies beyond the stack in `CLAUDE.md` without asking.
- Do not touch unrelated files, other brands' assets, or `public` files you did not create unless the task says so.
- Do not copy, rename, or convert image assets; reference them by their exact existing names.
- Do not commit secrets, real phone numbers or real user data.
- If a task would break a hard rule in `CLAUDE.md`, stop and explain instead of working around it.

## Report format (end of every phase)

```
Phase N — <name>
Changed: <git diff --stat summary>
Verified: <widths, directions, flows checked>
Build: pass / fail (+ errors)
Open questions: <only if any>
Next: <next phase>
```