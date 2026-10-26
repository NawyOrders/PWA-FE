import { afterEach, describe, expect, it, vi } from "vitest";
import {
  getSessionCount,
  hasAddedToCart,
  hasDirtyForm,
  isBeforeInstallPromptEvent,
  isInstallAvailable,
  isInstallSnoozed,
  isIos,
  isIosSafari,
  isStandalone,
  markAddedToCart,
  promptInstall,
  recordSession,
  snoozeInstall,
  type BeforeInstallPromptEvent,
} from "./pwa";

const originalUserAgent = navigator.userAgent;

function setUserAgent(value: string): void {
  Object.defineProperty(navigator, "userAgent", { configurable: true, value });
}

afterEach(() => {
  setUserAgent(originalUserAgent);
});

describe("PWA browser helpers", () => {
  it("UT-PWA-HELPERS-01 detects standalone from the display mode or iOS flag", () => {
    const matchMedia = vi.spyOn(window, "matchMedia").mockImplementation((query) => ({
      matches: true,
      media: query,
      onchange: null,
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
      addListener: () => undefined,
      removeListener: () => undefined,
      dispatchEvent: () => false,
    }));
    expect(isStandalone()).toBe(true);
    matchMedia.mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
      addListener: () => undefined,
      removeListener: () => undefined,
      dispatchEvent: () => false,
    }));
    expect(isStandalone()).toBe(false);

    Object.defineProperty(navigator, "standalone", { configurable: true, value: true });
    expect(isStandalone()).toBe(true);
    Reflect.deleteProperty(navigator, "standalone");
  });

  it("UT-PWA-HELPERS-02 detects iOS and the iOS browsers", () => {
    setUserAgent("Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)");
    expect(isIos()).toBe(true);
    expect(isIosSafari()).toBe(true);

    setUserAgent("Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) CriOS/120");
    expect(isIosSafari()).toBe(false);

    setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64)");
    expect(isIos()).toBe(false);
    expect(isIosSafari()).toBe(false);
  });

  it("UT-PWA-HELPERS-03 decides when install UI is available", () => {
    const event = new Event("beforeinstallprompt") as BeforeInstallPromptEvent;

    expect(isInstallAvailable(false, null)).toBe(false);
    expect(isInstallAvailable(true, null)).toBe(false);
    expect(isInstallAvailable(false, event)).toBe(true);
    expect(isInstallAvailable(false, null, true)).toBe(true);
  });

  it("UT-PWA-HELPERS-04 prompts the install event and returns its outcome", async () => {
    const prompt = vi.fn(() => Promise.resolve());
    const event = Object.assign(new Event("beforeinstallprompt"), {
      prompt,
      userChoice: Promise.resolve({ outcome: "accepted" as const, platform: "web" }),
    });
    Object.defineProperty(event, "prompt", { value: prompt });

    expect(isBeforeInstallPromptEvent(event)).toBe(true);
    expect(isBeforeInstallPromptEvent(new Event("install"))).toBe(false);
    await expect(promptInstall(event)).resolves.toBe("accepted");
    expect(prompt).toHaveBeenCalledTimes(1);
  });
});

describe("PWA storage helpers", () => {
  it("UT-PWA-HELPERS-05 counts a browser session once", () => {
    expect(recordSession()).toBe(1);
    expect(recordSession()).toBe(1);
    expect(getSessionCount()).toBe(1);

    window.sessionStorage.clear();
    expect(recordSession()).toBe(2);
    expect(getSessionCount()).toBe(2);
  });

  it("UT-PWA-HELPERS-06 remembers added-to-cart and install snoozes", () => {
    expect(hasAddedToCart()).toBe(false);
    markAddedToCart();
    expect(hasAddedToCart()).toBe(true);

    const now = 1_000_000;
    expect(isInstallSnoozed(now)).toBe(false);
    snoozeInstall(now);
    expect(isInstallSnoozed(now + 1)).toBe(true);
    expect(isInstallSnoozed(now + 15 * 24 * 60 * 60 * 1000)).toBe(false);
  });
});

describe("PWA dirty form detection", () => {
  it("UT-PWA-HELPERS-07 detects typed values and ignores pristine forms", () => {
    const container = document.createElem