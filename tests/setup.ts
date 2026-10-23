/**
 * Shared Vitest setup (TESTING.md section 4).
 *
 * Only the network (MSW), the clock and browser APIs are mocked here.
 * Application modules are never mocked (TESTING.md rules 1 and 13).
 */
import "@testing-library/jest-dom/vitest";
import { expect } from "vitest";
import { toHaveNoViolations } from "vitest-axe/dist/matchers.js";
import { afterAll, afterEach, beforeAll, beforeEach, vi } from "vitest";
import { createElement, type ReactNode } from "react";
import { cleanup } from "@testing-library/react";
import { server } from "./mocks/server";
import { setRoute } from "./mocks/router";
import { resetCatalog } from "@/server/catalog";
import { resetServerOrders } from "@/server/checkout";

expect.extend({ toHaveNoViolations });

/* -------------------------------------------------------------------------- */
/* Next.js framework modules (TESTING.md section 13)                          */
/* -------------------------------------------------------------------------- */

vi.mock("next/navigation", async () => {
  const { routerMock, routerState } = await import("./mocks/router");
  return {
    useRouter: () => routerMock,
    usePathname: () => routerState.pathname,
    useSearchParams: () => routerState.searchParams,
    useParams: () => ({}),
    useSelectedLayoutSegment: () => null,
    useSelectedLayoutSegments: () => [],
    redirect: vi.fn(),
    notFound: vi.fn(),
  };
});

vi.mock("next/image", () => ({
  default: ({
    src,
    alt,
    width,
    height,
    fill,
    priority,
    fetchPriority,
    placeholder,
    blurDataURL,
    quality,
    sizes,
    unoptimized,
    ...rest
  }: Record<string, unknown>) => {
    const resolved =
      typeof src === "object" && src !== null
        ? (src as { src?: string }).src
        : (src as string | undefined);
    return createElement("img", {
      src: resolved,
      alt: alt as string,
      width: width as number | undefined,
      height: height as number | undefined,
      "data-fill": fill ? "true" : undefined,
      "data-priority": priority ? "true" : undefined,
      "data-fetch-priority": fetchPriority as string | undefined,
      "data-placeholder": placeholder as string | undefined,
      "data-blur": blurDataURL ? "true" : undefined,
      "data-quality": quality as number | undefined,
      "data-sizes": sizes as string | undefined,
      "data-unoptimized": unoptimized ? "true" : undefined,
      ...(rest as Record<string, unknown>),
    });
  },
}));

vi.mock("next/font/local", () => ({
  default: () => ({ variable: "--font-noto-kufi-arabic", className: "font-test" }),
}));

vi.mock("next/font/google", () => ({
  Noto_Kufi_Arabic: () => ({ variable: "--font-noto-kufi-arabic", className: "font-test" }),
}));

vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    ...rest
  }: {
    href: string;
    children: ReactNode;
  } & Record<string, unknown>) =>
    createElement("a", { href, ...(rest as Record<string, unknown>) }, children),
}));

/* -------------------------------------------------------------------------- */
/* Browser APIs jsdom does not implement                                       */
/* -------------------------------------------------------------------------- */

type MediaQueryListener = (event: MediaQueryListEvent) => void;

const mediaQueryState = new Map<string, boolean>();

/** Forces a media query result for the current test. Returns a restore function. */
export function setMediaQuery(query: string, matches: boolean): () => void {
  const previous = mediaQueryState.get(query);
  mediaQueryState.set(query, matches);
  return () => {
    if (previous === undefined) mediaQueryState.delete(query);
    else mediaQueryState.set(query, previous);
  };
}

function installMatchMedia() {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    configurable: true,
    value: (query: string) => {
      const listeners = new Set<MediaQueryListener>();
      const state = {
        get matches() {
          return mediaQueryState.get(query) ?? false;
        },
        media: query,
        onchange: null,
        addEventListener: (_type: string, listener: EventListenerOrEventListenerObject) => {
          listeners.add(listener as MediaQueryListener);
        },
        removeEventListener: (_type: string, listener: EventListenerOrEventListenerObject) => {
          listeners.delete(listener as MediaQueryListener);
        },
        addListener: (listener: MediaQueryListener) => listeners.add(listener),
        removeListener: (listener: MediaQueryListener) => listeners.delete(listener),
        dispatchEvent: () => false,
      } as unknown as MediaQueryList;
      return state;
    },
  });
}

installMatchMedia();

class MockIntersectionObserver implements IntersectionObserver {
  readonly root: Element | null = null;
  readonly rootMargin = "";
  readonly thresholds: ReadonlyArray<number> = [];
  private readonly callback: IntersectionObserverCallback;

  constructor(callback: IntersectionObserverCallback) {
    this.callback = callback;
  }

  observe(target: Element): void {
    this.callback(
      [
        {
          isIntersecting: true,
          target,
          intersectionRatio: 1,
          time: 0,
          boundingClientRect: target.getBoundingClientRect(),
          intersectionRect: target.getBoundingClientRect(),
          rootBounds: null,
        },
      ],
      this,
    );
  }

  unobserve(): void {}
  disconnect(): void {}
  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }
}

class MockResizeObserver {
  observe(): void {}
  unobserve(): void {}
  disconnect(): void {}
}

globalThis.IntersectionObserver = MockIntersectionObserver as unknown as typeof IntersectionObserver;
globalThis.ResizeObserver = MockResizeObserver as unknown as typeof ResizeObserver;

Element.prototype.scrollIntoView = vi.fn();
Element.prototype.setPointerCapture = vi.fn();
Element.prototype.releasePointerCapture = vi.fn();
Element.prototype.hasPointerCapture = vi.fn(() => false);

window.scrollTo = vi.fn();
window.open = vi.fn();

Object.defineProperty(window, "visualViewport", {
  writable: true,
  configurable: true,
  value: {
    width: 390,
    height: 844,
    scale: 1,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  },
});

if (!globalThis.requestAnimationFrame) {
  globalThis.requestAnimationFrame = ((callback: FrameRequestCallback) =>
    setTimeout(() => callback(Date.now()), 16) as unknown as number) as typeof requestAnimationFrame;
  globalThis.cancelAnimationFrame = ((handle: number) =>
    clearTimeout(handle as unknown as NodeJS.Timeout)) as typeof cancelAnimationFrame;
}

/**
 * jsdom does not implement the 2D canvas context. axe-core asks for it while
 * computing colors, so a no-op context keeps the a11y assertions quiet.
 */
if (typeof HTMLCanvasElement !== "undefined") {
  HTMLCanvasElement.prototype.getContext = (() => ({
    fillStyle: "",
    fillRect: () => undefined,
    getImageData: () => ({ data: new Uint8ClampedArray(4) }),
    putImageData: () => undefined,
    createImageData: () => ({ data: new Uint8ClampedArray(4) }),
    setTransform: () => undefined,
    drawImage: () => undefined,
    save: () => undefined,
    restore: () => undefined,
    beginPath: () => undefined,
    closePath: () => undefined,
    stroke: () => undefined,
    fill: () => undefined,
    translate: () => undefined,
    scale: () => undefined,
    rotate: () => undefined,
    arc: () => undefined,
    rect: () => undefined,
    clip: () => undefined,
  })) as unknown as typeof HTMLCanvasElement.prototype.getContext;
}

/* -------------------------------------------------------------------------- */
/* File helpers                                                               */
/* -------------------------------------------------------------------------- */

let objectUrlCounter = 0;

if (!URL.createObjectURL) {
  URL.createObjectURL = vi.fn(() => `blob:nawy/${(objectUrlCounter += 1)}`);
}
if (!URL.revokeObjectURL) {
  URL.revokeObjectURL = vi.fn();
}

/* -------------------------------------------------------------------------- */
/* Testing Library fake timer bridge                                          */
/* -------------------------------------------------------------------------- */

/**
 * `@testing-library/dom` only advances fake timers when a `jest` global
 * exists. Vitest has no `jest` global, so `waitFor` would hang under fake
 * timers. This shim keeps `waitFor` usable without touching app code.
 */
(globalThis as { jest?: unknown }).jest = {
  advanceTimersByTime: (ms: number) => vi.advanceTimersByTime(ms),
  isMockFunction: (fn: unknown) =>
    Boolean((fn as { _isMockFunction?: boolean } | null)?._isMockFunction),
};

/* -------------------------------------------------------------------------- */
/* Network boundary (MSW)                                                     */
/* -------------------------------------------------------------------------- */

beforeAll(() => {
  server.listen({ onUnhandledFrame: "error" });
});

afterEach(() => {
  server.resetHandlers();
  cleanup();
  window.localStorage.clear();
  window.sessionStorage.clear();
  mediaQueryState.clear();
  setRoute("/");
  vi.useRealTimers();
});

afterAll(() => {
  server.close();
});

beforeEach(() => {
  resetCatalog();
  resetServerOrders();
  // Only `Date` is faked by default: the clock is frozen at a fixed Cairo
  // time while real timers stay available for Testing Library and user-event.
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(new Date("2026-10-20T10:00:00+03:00"));
});
