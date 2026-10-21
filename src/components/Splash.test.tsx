import { act, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createPortal } from "react-dom";
import { Splash } from "./Splash";
import { renderWithProviders } from "../../tests/utils/render";
import { useFakeTimers } from "../../tests/utils/timers";

/**
 * The app renders the splash as a direct child of `<body>` (see
 * `src/app/[locale]/layout.tsx`), because the component hides every other
 * child of the body. The portal reproduces that structure in the test.
 */
function renderSplash(label = "جاري التحميل") {
  return renderWithProviders(createPortal(<Splash label={label} />, document.body));
}

async function advance(ms: number) {
  await act(async () => {
    await vi.advanceTimersByTimeAsync(ms);
  });
}

describe("Splash", () => {
  beforeEach(() => {
    window.sessionStorage.clear();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("UT-SPLASH-01 is announced as a status with its label", () => {
    useFakeTimers();
    renderSplash();

    const splash = screen.getByRole("status");
    expect(splash).toHaveAttribute("aria-label", "جاري التحميل");
  });

  it("UT-SPLASH-02 hides itself after the minimum visible time", async () => {
    useFakeTimers();
    renderSplash();

    await advance(400);
    expect(screen.getByRole("status")).toBeInTheDocument();

    await advance(2000);
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("UT-SPLASH-03 remembers that it was shown", async () => {
    useFakeTimers();
    renderSplash();

    await advance(2000);

    expect(window.sessionStorage.getItem("splash-seen")).toBe("1");
  });

  it("UT-SPLASH-04 does not show twice in the same session", async () => {
    useFakeTimers();
    window.sessionStorage.setItem("splash-seen", "1");

    renderSplash();

    await advance(50);

    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("UT-SPLASH-05 locks the scroll of the page while it is visible", async () => {
    useFakeTimers();
    renderSplash();

    expect(document.documentElement.style.overflow).toBe("hidden");

    await advance(2000);

    expect(document.documentElement.style.overflow).toBe("");
  });

  it("UT-SPLASH-06 hides the splash with a no script rule", () => {
    useFakeTimers();
    renderSplash();

    expect(document.querySelector("#app-splash noscript")).not.toBeNull();
  });
});
