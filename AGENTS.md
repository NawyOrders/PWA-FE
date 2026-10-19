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
12. FAQ (search + accordion + contact CTA), reached from the Help card "الأسئلة الشائعة" (spec: `DESIGN.md` 12.7); reuse the settings-style layout, the CTA slot, the existing accordion and the large search variant
13. Live chat (header pill, bubbles, composer), reached from the Help card "محادثة مباشرة" (spec: `DESIGN.md` 12.8); build the separate `ChatScreen` layout (it does not use the settings-style layout)
14. Send feedback (rating card + form card + CTA), reached from the Help card "ارسال ملاحظات" (spec: `DESIGN.md` 12.9); reuse the settings-style layout and the CTA slot, and build the reusable `StarRating` and `ImageUpload`

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
- **Help and support:** matches `DESIGN.md` 12.6 at 390px and, on desktop, as the same 480px centered column with the grid kept at 2 equal columns inside the gutter (not 4); each card is one 44px+ target with an accessible name of title plus subtitle; the chat status is computed from the support hours and shown as online or offline; the CTA opens `tel:` on phones and a contact modal (number, copy, WhatsApp, email) on desktop; contact details come from the brand config; the FAQ, the live chat and the feedback form are built to `DESIGN.md` 12.7, 12.8 and 12.9 and the report destination exists as a clearly marked placeholder; the subtitle uses "في اي وقت".
- **FAQ:** matches `DESIGN.md` 12.7 at 390px and, on desktop, as the same 480px centered column; one item open at a time with the first open by default, smooth height animation, chevron rotation, `aria-expanded` and `aria-controls`, closed answers not focusable; live search with Arabic normalization, highlight, result count, clear button and a no-results state; `?q=` and `#id` deep links work; CTA pinned with a fade on mobile and inline on desktop; all strings in both dictionaries; the subtitle reads "كل ما تحتاج معرفته..." and every title and label uses "الأسئلة" with a hamza; the mockup's three identical placeholder questions are replaced with the real or sample content.
- **Live chat:** matches `DESIGN.md` 12.8 at 390px and, on desktop, as the same 480px centered column with the fixed height and only the message area scrolling; header pill and composer pinned; bubbles have the right side per language, `dir="auto"`, max-widths, squared corners, time inside the bubble and the avatar on incoming bubbles; date chips come from real timestamps; the composer auto-grows (1 to 4 lines), Enter sends on desktop and adds a line on mobile, send is disabled when empty, attachments (images and PDF, 5 MB, 3 files) show chips with progress and remove; the composer stays above the on-screen keyboard; the list auto-scrolls unless the user scrolled up (then the "رسالة جديدة" pill shows); typing, sending, failed (with retry), offline queue, outside-hours and empty states exist; the message list is `role="log"` and each bubble announces sender and time; the send arrow follows the reading direction; the outgoing bubble text meets the contrast rule (gradient ending at `--bubble-end` or an owner-approved exception); an automated reply is labeled as automated; no mockup chrome is drawn.
- **Send feedback:** matches `DESIGN.md` 12.9 at 390px and, on desktop, as the same 480px centered column at mobile sizes; five 44px star circles fill from the start edge and work as a labelled radio group with direction-aware arrow keys, hover preview and optional hints; the rating is required and Send stays disabled until it is chosen and the message is valid (empty, or 10 to 500 characters); the counter reads "0/500" on Arabic pages (inside `<bdi dir="ltr">`); the type is a styled native `<select>`; the optional photo accepts JPG, PNG, WebP and HEIC up to 5 MB, is resized and stripped of EXIF before upload and shows a preview, progress, remove and error states; resting borders are amber, focus is primary and errors are red; dirty Back asks for confirmation and the draft survives within the session; success replaces the form with a confirmation and a "العودة" button; error, offline and rate-limit states exist; the photo label reads "(اختياري)" and the upload line reads "اضغط لرفع صورة"; CTA pinned on mobile and inline on desktop and aligned to the 24px gutter.

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