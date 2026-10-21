# DESKTOP.md — Desktop Layout Fixes and Normalization (Karam El Sham)

Companion to `DESIGN.md` (v2.7), `CLAUDE.md`, `AGENTS.md` and `TESTING.md`.

Purpose: (1) fix the desktop version of the whole website so it looks and behaves like a professional full-width restaurant website, and (2) **normalize** the code: every page and component uses the same tokens, containers, spacing, type scale and building blocks, so no file has its own one-off values.

Rules of precedence: `DESIGN.md` wins on colors, components and mobile; this file wins on desktop layout (≥ 1024px) and on code normalization. Do not redesign: keep the brand, copy, colors (primary `#E43820`), images and behavior. Arabic (RTL) is the default; English (LTR) must be identical in structure.

---

## 1. Audit of the current desktop (Home, Arabic, screenshot ≈ 1884px wide)

Sizes below are measured in screenshot pixels (≈). If the screenshot was taken with browser zoom or display scaling, the real CSS values are smaller; Phase 1 of the agent process re-measures every value in DevTools before changing anything.

| # | What is wrong | Rule it breaks | Fix |
|---|---------------|----------------|-----|
| 1 | Header is ≈ 96px high | Header is 72px from 1024px up (`DESIGN.md` 3.4) | `height: var(--header-h)` (72px desktop, 64px below 1024px) |
| 2 | Header content runs edge to edge (≈ 30px margins) | Content lives in the shared container (max 1440px) | Put the header inside `Container` |
| 3 | Page content is ≈ 1800px wide, no maximum width | `min(100% - 48px, 1440px)` (`DESIGN.md` 5.2) | One `Container` for every page |
| 4 | The top area mixes three alignments: greeting right-aligned at the edge, search centered ≈ 1010px wide, featured card full width | One grid, one alignment logic | Home top row (3.4) |
| 5 | Too much empty space: ≈ 400px between header and featured card; the card's title is below the fold at 1884×874 | The featured card is visible without scrolling at 1366×768 | Compact top row, tighter rhythm (2.4) |
| 6 | Featured card: radius ≈ 56px, ≈ 148px empty space above the photo, photo with square corners and ≈ 760px wide | Radius 32px, padding `clamp(28px, 4vw, 56px)`, photo frame radius 28px, 4:3, max height 420px (`DESIGN.md` 4.1) | Rebuild per 4.1 inside the container |
| 7 | Type is too large: nav links ≈ 20–22px, greeting name ≈ 56px, featured title ≈ 58px | Nav links 15–16px/600, display 40px, featured title ≤ 48px | Desktop type scale (2.5) |
| 8 | Account chip shows a raw value ("ndksnmf") | Show the first name, or "تسجيل الدخول" for guests | Account chip rule (2.3) |
| 9 | A thick custom scrollbar and a dark ≈ 8px strip at the bottom edge | No custom heavy scrollbar; nothing covers the viewport edge or causes horizontal scroll | Investigate the strip (fixed element or horizontal overflow); thin native scrollbar (2.7) |
| 10 | The burger photo carries a visible stock watermark | Only owned or licensed images (`DESIGN.md` 11) | Replace before launch; never crop or blur the mark |
| 11 | "اهلا بك في" is written without the hamza | Use "أهلا بك في" like the other titles and labels | Copy fix in both dictionaries |

What already works and must be kept: the RTL order (logo at the start edge, controls at the end), the language toggle, the cart badge, the active-link pill, the search field's icon-and-button structure, the featured card's text-then-photo order in Arabic.

---

## 2. Desktop foundations (≥ 1024px)

### 2.1 Breakpoints and test viewports

| Name | Range | Test at |
|------|-------|---------|
| Laptop | 1024–1439px | 1024×768, 1280×720, 1366×768 |
| Desktop | 1440–1919px | 1440×900 |
| Large desktop | ≥ 1920px | 1920×1080, 2560×1440 |

Tablet (768–1023px) uses the same templates with smaller gaps and one column fewer; mobile keeps the compact layouts from `DESIGN.md`.

### 2.2 Container and edges

| Token | Value |
|-------|-------|
| `--container-max` | `1440px` |
| `--gutter` | `24px` (mobile 16px, tablet 24px, desktop 32px) |
| Container width | `min(100% - 2 * var(--gutter), var(--container-max))`, centered with `margin-inline: auto` |
| Focused column | `min(100% - 48px, 480px)`, centered |
| Page background | full width, `width: 100%` (never `100vw`) |

Rules: the left and right margins are equal (±1px) at every width; header, page content and footer share the same container edges; no child is wider than the container; no `overflow-x: hidden` to hide a problem (find the element that is too wide).

### 2.3 Header (all pages)

- Height 72px (`--header-h`), inside the container, translucent cream with blur, 1px hairline at the bottom, sticky.
- Order in Arabic from the start edge: logo tile (40px) + brand name (20px/800), nav links, then (end edge) language toggle, cart button with badge, account chip. English mirrors.
- Links: height 44px, 15–16px/600, horizontal padding 12–16px, gap 4–8px; active link is a soft peach pill (`--tint-peach`) with `--primary` text and `aria-current="page"`. Links never wrap or overflow: below about 1180px reduce padding to 10px, and if they still do not fit, move the least important link into the menu.
- Cart button 44px with a numeric badge (hidden at 0, "9+" above 9). Language toggle 40px high. Account chip 44px high: a user icon and the **first name** (max 14 characters with ellipsis), or "تسجيل الدخول" for guests; never the raw username or an email.
- The header does not change height on scroll; on scroll (after 8px) it gains a soft shadow only.

### 2.4 Vertical rhythm (app pages)

| Space | Value |
|-------|-------|
| Header bottom → page content | 24px |
| Page title block (wide pages) | title 32px/800 + optional muted line, 8px apart; ≈ 24px below it |
| Home top row | 112–128px tall in total (3.4) |
| Between sections | `clamp(32px, 4vw, 56px)` |
| Section heading → its content | 16–24px |
| Last section → footer | 56px |

Marketing sections (the landing part of the site, if any) keep their own rhythm `clamp(56px, 8vw, 120px)`; app pages use the table above. Never mix the two on one page.

### 2.5 Desktop type scale (one source of truth)

| Token | Size / weight | Used for |
|-------|---------------|----------|
| `text-display` | 40px / 800, line-height 1.2 (Arabic 1.35) | Home greeting name, focused-screen large titles |
| `text-page-title` | 32px / 800 | Wide page titles (Menu, Favorites, Orders, Cart) |
| `text-featured` | `clamp(30px, 3.4vw, 48px)` / 800 | Featured card title |
| `text-section` | 24px / 800 | Section headings ("رائج هذا الاسبوع", "التصنيفات") |
| `text-card-title` | 17px / 700 | Product and card names |
| `text-body` | 15–16px / 400, line-height 1.7 | Descriptions, paragraphs (minimum color `#7A6C65`) |
| `text-ui` | 15–16px / 600–700 | Nav links, buttons, chips, labels |
| `text-caption` | 13–14px / 400 | Hints, timestamps, counters |
| `text-price` | 24–32px / 800, `--primary` | Prices |

One Arabic font family for the whole site; Latin digits everywhere; no letter-spacing on Arabic.

### 2.6 Grids

| Content | Columns (≥ 1440 / 1024–1439 / 768–1023 / < 768) | Gap |
|---------|-----------------------------------------------|-----|
| Product grid | 4 / 3 / 2 / compact horizontal card | 24px (16px on mobile) |
| Category row | one balanced row, wraps if needed / same / same / horizontal scroll with snap | 24px |
| Orders | 2 / 2 / 1 / 1 | 24px |
| Help option cards | always 2 columns inside the focused column | 16px |

Cards are never narrower than 260px or stretched wider than their grid cell; card heights are equal per row; image ratios are fixed with `aspect-ratio`.

### 2.7 Scrollbar and page edges

- Native scrollbar, thin (`scrollbar-width: thin`), with `scrollbar-gutter: stable` so the layout does not shift when it appears.
- Nothing is fixed at the bottom edge on desktop except an intentional element (cookie bar, install prompt, toast), and it must never cover content or create horizontal scroll. Find the source of the dark strip in the screenshot (a fixed element, a dev overlay, or a horizontal scrollbar) and fix or remove it.
- `document.documentElement.scrollWidth` must equal `clientWidth` on every page at every test width.

---

## 3. Desktop templates and screens

### 3.1 Wide page template (`PageShell` + `Container`)

Header → `PageHeader` (title, optional muted line, optional actions at the end edge) → content in `Container` → footer. Used by Home, Menu, Favorites, Cart (items), Orders.

### 3.2 Focused page template (`FocusedColumn`)

Header → centered column of 480px that keeps the **mobile dimensions 1:1** (`DESIGN.md` 12.1): type, padding, radii and control heights are not scaled up → settings-style layout with back button, large title, subtitle, content and CTA (inline 32px below the content on desktop). Used by Login, Profile, Personal information, Addresses, Help, FAQ, Feedback.

### 3.3 Chat template

Same 480px column with the fixed height `calc(100dvh - var(--header-h) - 48px)` (min 560px, max 820px); only the message area scrolls (`DESIGN.md` 12.8).

### 3.4 Home page (desktop)

1. **Top row** (grid, two columns, `align-items: center`, 112–128px high, 24px below the header): at the start edge the greeting block (kicker "أهلا بك في" 16px `--accent-text`, restaurant name `text-display`, location line with a pin icon `text-body`); at the end edge the search field (max 560px wide, 60px high, icon at the start, "بحث" button at the end).
2. **Featured card** (24px below the top row): inside the container, radius 32px, two columns `1.05fr 1fr`, padding `clamp(28px, 4vw, 56px)`, `min-height: clamp(360px, 32vw, 440px)`, text column first (kicker, `text-featured` title, description max 44ch, price row with a labeled "أضف الى السلة" button, pager dots and arrows), photo column with a 4:3 frame (radius 28px, max height 420px, tag pill inside the photo at the bottom start corner), exactly as `DESIGN.md` 4.1. **At 1366×768 the title, price and Add-to-cart button are visible without scrolling.**
3. **Categories** (`clamp(32px, 4vw, 56px)` below): section heading + a balanced row of 72px circles (active ring `--primary`, 3px), first item at the start edge.
4. **Product grid** with the columns in 2.6, section heading "الأطباق" with the count.
5. **Footer** in the same container: brand, links, language, contact, social icons.

### 3.5 Every screen on desktop

| # | Screen | Desktop template | Notes |
|---|--------|------------------|-------|
| 1 | Splash | Full screen | Image centered, no chrome (`DESIGN.md` 4.2) |
| 2 | Login / OTP | Focused 480px | Centered card on the cream page with the glows |
| 3 | Login-required modal | Modal max 480px | Backdrop, focus trap |
| 4 | Home | Wide, section 3.4 | |
| 5 | Menu | Wide | `PageHeader` + category row + product grid |
| 6 | Favorites | Wide | Product grid, empty state |
| 7 | Cart | Wide | Items list wide; summary as a sticky 380–420px side column below the header |
| 8 | Orders | Wide | Filter chips + orders grid |
| 9 | Profile | Focused 480px | |
| 10 | Drawer | Panel max 420px | |
| 11 | Personal information | Focused 480px | `DESIGN.md` 12.1 |
| 12 | Addresses | Focused 480px | `DESIGN.md` 12.5 |
| 13 | Help and support | Focused 480px, grid stays 2 columns | `DESIGN.md` 12.6 |
| 14 | FAQ | Focused 480px | `DESIGN.md` 12.7 |
| 15 | Live chat | Chat template | `DESIGN.md` 12.8 |
| 16 | Send feedback | Focused 480px | `DESIGN.md` 12.9 |
| — | Website sections (hero, pricing, FAQ, footer) | Wide, marketing rhythm | Keep their current design; apply the container, type scale and header rules |

---

## 4. Normalization across all files

Goal: any value that appears in a page also exists as a token or a primitive, and every page is assembled from the same small set of building blocks.

### 4.1 One source of truth for tokens

- All colors, radii, shadows, spacing, type sizes, z-indexes, durations and easings are CSS variables in one token file (`src/styles/tokens.css`), mapped into the Tailwind theme. The `DESIGN.md` token tables and its v2.x additions (`--surface-soft`, `--hint-amber`, `--hint-amber-text`, `--tint-peach`, `--star-off`, `--coral`, `--bubble-end`, `--header-h`, `--bg-splash`) all exist there.
- Radius tokens: `xs 12`, `sm 16`, `md 20`, `lg 28`, `xl 32`, `full`. Z-index tokens: `base 0`, `sticky 40`, `header 50`, `drawer 60`, `modal 70`, `toast 80`, `splash 100`. Shadow tokens: `card`, `float`, `cta-glow`.
- No hex, `rgb()` or `hsl()` value in a component or page file; no duplicate definition of the same token in two files.

### 4.2 Layout primitives (used by every page)

| Primitive | Responsibility |
|-----------|----------------|
| `Container` | The single width, gutter and centering rule (2.2) |
| `PageShell` | Header, page content slot, footer, background glows |
| `PageHeader` | Page title block (title, muted line, end-edge actions) |
| `Section` | Vertical rhythm and optional heading row |
| `Grid` | The column rules in 2.6 (props for min card width and gap token) |
| `FocusedColumn` | The 480px column of 3.2 with the settings-style layout and CTA slot |
| `ChatColumn` | The fixed-height column of 3.3 |

No page sets its own `max-width`, horizontal padding, section padding or grid gap with ad-hoc classes.

### 4.3 UI primitives (one family each)

`Button` (primary gradient, ghost, icon, danger; sizes lg 56, md 48, sm 40; always at least a 44px target), `Field` with `Input`, `Textarea`, `Select`, `PhoneInput`, `OtpInput`, `SearchField` (default 60px, large 72–76px), `Card` (product, soft, form, option), `Chip`, `Badge`, `IconButton`, `Modal`, `Sheet`, `Drawer`, `Toast`, `Accordion`, `StarRating`, `ImageUpload`, `Skeleton`, `EmptyState`. Every screen uses these. When two components do the same job (two button styles, two accordions, two modals, two card styles), keep the better one, migrate every use, and delete the other.

### 4.4 Naming and structure

- One component per file, PascalCase file and export names, props typed with an interface, named exports; hooks start with `use`; stores end with `Store`.
- Folders by role (`components/ui`, `components/layout`, `components/<feature>`, `lib`, `store`, `data`, `styles`); no deep relative imports (use the `@/` alias); no barrel files that re-export everything.
- CSS: Tailwind utilities first; a custom class only for patterns Tailwind cannot express (keyframes, complex selectors) and it lives in the one motion or global file, named in kebab-case with a feature prefix. No inline `style` with fixed pixel sizes (CSS variables are allowed).
- i18n keys follow `area.screen.element` (for example `help.faq.searchPlaceholder`); Arabic and English dictionaries have identical key sets (`TESTING.md` parity test).

### 4.5 Spacing and type enforcement

- Spacing uses the 4px scale only (4, 8, 12, 16, 20, 24, 32, 40, 48, 56, 64, 80, 96, 128). Tailwind arbitrary values (`p-[22px]`, `w-[1810px]`, `text-[57px]`) are banned except an allowlist for genuine one-offs (documented in the file).
- Font sizes come only from the type tokens in 2.5. No `text-[..px]`, no inline `fontSize`.
- Widths and heights are fluid (`min-*`, `max-*`, `clamp()`, `aspect-ratio`, `%`) rather than fixed pixels, except icons, avatars and touch targets.

### 4.6 Remove duplication and dead code

- Unused files, components, hooks, exports, dependencies and assets are found with `knip`; duplicate blocks (copy-pasted markup or styles) are found with `jscpd`; each result is checked by hand before deleting (use `git rm`, so history keeps it).
- Unused CSS classes and keyframes are removed only when no component, Tailwind class string or template string uses them.
- Images: nothing in `public/` unreferenced; originals kept outside `public/` (see `PERFORMANCE.md` and `DESIGN.md` 11).

### 4.7 Enforcement so it stays normalized

Add (as dev tools only) and wire into `npm run lint` and CI:

| Check | Tool |
|-------|------|
| No hex or rgb colors in components | ESLint `no-restricted-syntax` rule or a scan script |
| No arbitrary Tailwind values outside the allowlist | `eslint-plugin-tailwindcss` (`no-arbitrary-value`) or a scan |
| No physical direction classes (`left`, `right`, `ml-`, `mr-`, `pl-`, `pr-`, `text-left`, `text-right`) | scan test (`TESTING.md` 8.4) |
| No hardcoded UI strings | ESLint rule or scan against the dictionaries |
| Dead code and duplicates | `knip`, `jscpd` (report, fail above a threshold) |
| Layout invariants | Playwright measurements (section 5) |

`scripts/check-normalization.mjs` runs the scans and prints a table: rule, file, line, offending value, suggested replacement. `npm run check:norm` must exit 0.

### 4.8 Violation patterns and replacements

| Found | Replace with |
|-------|--------------|
| `max-w-[1800px]`, `w-[95vw]`, `px-[30px]` on a page | `Container` |
| `h-24`, `h-[96px]` on the header | `h-[var(--header-h)]` through the header component |
| `rounded-[56px]`, `rounded-[3rem]` | radius tokens (`xl 32` for big cards) |
| `text-[22px]`, `text-[58px]` | a type token from 2.5 |
| `p-[148px]`, `mt-[400px]` | the rhythm table in 2.4 |
| `#E43820`, `#FFF8F1` in a component | `var(--primary)`, `var(--bg)` |
| two different button or card components | the `Button` and `Card` primitives |
| `left-4`, `ml-6`, `text-left` | `start-4`, `ms-6`, `text-start` |
| `100vw`, `100vh` | `100%`, `100dvh` / `svh` |

### 4.8b Migration order (so the app never breaks)

1. Tokens and type scale → 2. `Container`, `PageShell`, `PageHeader`, `Section`, `Grid` → 3. Header and footer → 4. Home → 5. Menu, Favorites, Orders, Cart → 6. Focused screens (Login, Profile and sub-screens, Help set) → 7. Chat → 8. Website sections → 9. Dead-code removal → 10. Enforcement and CI. After each step: build, lint, tests, visual check.

---

## 5. Acceptance (measurable, checked in Playwright at 1366×768, 1440×900 and 1920×1080, Arabic and English)

| Check | Expected |
|-------|----------|
| Header height | 72px (64px below 1024px) |
| Container | content width ≤ 1440px; left and right margins equal (±1px); header, content and footer share the same edges |
| Horizontal overflow | `scrollWidth === clientWidth`; no element wider than the container |
| Home top row | greeting at the start edge, search at the end edge, 112–128px high; the featured card's title, price and Add-to-cart button are visible without scrolling at 1366×768 |
| Featured card | radius 32px; padding `clamp(28px, 4vw, 56px)`; photo frame radius 28px with a 4:3 ratio; no empty band above the photo |
| Type | nav links 15–16px; greeting name 40px; featured title ≤ 48px; no font size outside the type tokens |
| Account chip | first name or the guest label, never the raw username |
| Nav links | one line each, no overflow, active link has `aria-current` |
| Grids | 4 / 3 / 2 columns as in 2.6; cards at least 260px wide; equal heights per row |
| Bottom edge | no dark strip, no fixed element covering content |
| Normalization | `npm run check:norm` exits 0: no hardcoded colors, no arbitrary values off the allowlist, no physical direction classes, no hardcoded strings, no unused files or components |
| Regressions | `npx tsc --noEmit`, `npm run lint`, `npm run build` and the unit tests pass; mobile and tablet look unchanged except for the shared fixes |

---

## 6. Process for the agent

1. **Phase 0, safety:** commit pending work as "chore: checkpoint" and create the branch `fix/desktop-normalization`.
2. **Phase 1, measure (no edits):** with Playwright or DevTools collect the computed values (container width, margins, header height, font sizes, paddings, radii, grid columns) for every page at 1366×768, 1440×900 and 1920×1080, in Arabic and English, and write the audit table of section 1 for every page, not only Home. Run `knip`, `jscpd` and the scan script to list violations. Report before changing anything.
3. **Phase 2, foundations:** tokens, type scale, primitives (4.1 to 4.3).
4. **Phase 3, pages in the migration order (4.8b):** Home first, then the rest. After each page, take desktop screenshots and measure the section 5 checks.
5. **Phase 4, cleanup and enforcement:** dead code, duplicates, the scan script, lint rules, CI step.
6. **Phase 5, verify:** all section 5 checks pass at the three viewports; mobile and tablet regressions checked; unit tests green.
7. **Report (after every phase):** files changed (`git diff --stat`), what was measured and fixed (before and after values), violations removed, what could not be fixed and why. Leave the work on the branch without merging.

Do not: change copy, colors, images or behavior; add dependencies other than the dev tools named above; hide problems with `overflow-x: hidden`; scale the focused screens up; change the mobile layouts except for the shared token and primitive fixes.

---

## 7. Assumptions and open items

1. The screenshot is the Home screen in Arabic at about 1884px; the other pages are assumed to share the same shell and are measured in Phase 1.
2. Search at the end edge of the top row is a recommendation for a balanced desktop layout; the owner may prefer it centered under the greeting.
3. Top-row and card sizes follow `DESIGN.md` 4 and 4.1; if real measurements at 100% browser zoom already match them, only the container, header height and rhythm change.
4. The dark strip at the bottom edge and the account chip text ("ndksnmf") are treated as defects until the agent shows what they are.
5. The stock-photo watermark must be fixed by replacing the image, not by editing it.
