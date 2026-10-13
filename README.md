# NawyOrders PWA

The Progressive Web App frontend for the NawyOrders platform.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Arabic-first RTL interface with local Cairo Arabic and Latin fonts
- NawyOrders navy, coral, and cream theme
- Web App Manifest and service worker offline fallback

## Getting started

Use Node.js 20.9 or later, then install dependencies and start the development server:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The service worker is registered in production builds only; use `npm run build` followed by `npm start` to try the offline fallback locally.

## Project structure

```text
public/
  icons/              PWA app icons
  sw.js               Service worker and offline navigation fallback
src/
  app/                Routes, layout, styles, and web manifest
    fonts/            Cairo Arabic and Latin font files
    offline/          Offline fallback route
  components/         Shared UI components
  lib/                Shared utilities
  styles/             Shared motion styles
  types/              Shared TypeScript types
```

Add routes under `src/app`, reusable components under `src/components`, and shared helpers under `src/lib`.

## Branching

- `master`: Stable code.
- `dev`: Development and integration.
- `feature/*`: Individual task branches.

Create a separate branch for each task and open a Pull Request into `dev`.
