"use client";

import { useEffect, useRef, useState } from "react";

const SHOW_EVERY_LOAD = false;
const SEEN_KEY = "splash-seen";
const MIN_VISIBLE_MS = 700;
const MAX_VISIBLE_MS = 3500;
const EXIT_MS = 450;

type Phase = "enter" | "exit" | "gone";

export function Splash({ label }: { label: string }) {
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const finalizeRef = useRef<() => void>(() => {});
  const [phase, setPhase] = useState<Phase>("enter");

  useEffect(() => {
    const overlay = overlayRef.current;
    const html = document.documentElement;

    let seen = false;
    try {
      seen = !SHOW_EVERY_LOAD && sessionStorage.getItem(SEEN_KEY) === "1";
    } catch {
      seen = false;
    }
    if (seen) {
      const timer = window.setTimeout(() => setPhase("gone"), 0);
      return () => window.clearTimeout(timer);
    }

    const previousOverflow = html.style.overflow;
    html.style.overflow = "hidden";

    const siblings = Array.from(document.body.children).filter(
      (el): el is HTMLElement =>
        el instanceof HTMLElement && el !== overlay && el.tagName !== "SCRIPT",
    );
    const saved = siblings.map((el) => ({
      aria: el.getAttribute("aria-hidden"),
      inert: el.hasAttribute("inert"),
    }));
    for (const el of siblings) {
      el.setAttribute("aria-hidden", "true");
      el.setAttribute("inert", "");
    }

    let finished = false;
    let restored = false;
    let exitTimer = 0;
    let minTimer = 0;
    let maxTimer = 0;

    const restore = () => {
      if (restored) return;
      restored = true;
      html.style.overflow = previousOverflow;
      siblings.forEach((el, index) => {
        const prev = saved[index];
        if (prev.aria === null) el.removeAttribute("aria-hidden");
        else el.setAttribute("aria-hidden", prev.aria);
        if (!prev.inert) el.removeAttribute("inert");
      });
      if (window.location.hash) {
        const id = decodeURIComponent(window.location.hash.slice(1));
        const target = id ? document.getElementById(id) : null;
        target?.scrollIntoView({ block: "start" });
      }
    };

    const finalize = () => {
      window.clearTimeout(exitTimer);
      restore();
      setPhase("gone");
    };
    finalizeRef.current = finalize;

    const hide = () => {
      if (finished) return;
      finished = true;
      try {
        sessionStorage.setItem(SEEN_KEY, "1");
      } catch {
        /* ignore */
      }
      html.dataset.splash = "exit";
      window.dispatchEvent(new CustomEvent("splash:exit"));
      setPhase("exit");
      exitTimer = window.setTimeout(finalize, EXIT_MS + 250);
    };

    const waitForLoad = new Promise<void>((resolve) => {
      if (document.readyState === "complete") resolve();
      else window.addEventListener("load", () => resolve(), { once: true });
    });

    const waitForFonts: Promise<void> =
      document.fonts && document.fonts.ready
        ? document.fonts.ready.then(() => undefined)
        : Promise.resolve();

    const waitForHero = new Promise<void>((resolve) => {
      const hero = document.querySelector<HTMLImageElement>(
        'section[aria-roledescription="carousel"] img, [data-splash-hero]',
      );
      if (!hero || hero.complete) {
        resolve();
        return;
      }
      hero.addEventListener("load", () => resolve(), { once: true });
      hero.addEventListener("error", () => resolve(), { once: true });
    });

    const mountedAt = performance.now();

    void Promise.allSettled([waitForLoad, waitForFonts, waitForHero]).then(() => {
      minTimer = window.setTimeout(hide, Math.max(0, MIN_VISIBLE_MS - (performance.now() - mountedAt)));
    });
    maxTimer = window.setTimeout(hide, Math.max(0, MAX_VISIBLE_MS - performance.now()));

    return () => {
      window.clearTimeout(minTimer);
      window.clearTimeout(maxTimer);
      window.clearTimeout(exitTimer);
      restore();
    };
  }, []);

  if (phase === "gone") return null;

  return (
    <div
      id="app-splash"
      ref={overlayRef}
      role="status"
      aria-label={label}
      className={phase === "exit" ? "splash splash--exit" : "splash"}
      onTransitionEnd={(event) => {
        if (
          phase === "exit" &&
          event.target === overlayRef.current &&
          event.propertyName === "opacity"
        ) {
          finalizeRef.current();
        }
      }}
    >
      <noscript dangerouslySetInnerHTML={{ __html: "<style>.splash{display:none !important}</style>" }} />
      <span className="splash__spinner" aria-hidden="true" />
    </div>
  );
}
