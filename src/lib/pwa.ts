import {
  INSTALL_SNOOZE_DAYS,
  PWA_ADDED_TO_CART_KEY,
  PWA_INSTALL_SNOOZE_KEY,
  PWA_SESSION_COUNT_KEY,
  PWA_SESSION_MARK_KEY,
} from "./pwa-constants";

export {
  DEFAULT_MIN_SPLASH_MS,
  ICON_VERSION,
  INSTALL_SNOOZE_DAYS,
  MAX_SPLASH_MS,
  PWA_ADDED_TO_CART_KEY,
  PWA_CACHE_PREFIX,
  PWA_INSTALL_SNOOZE_KEY,
  PWA_RELOAD_FLAG,
  PWA_SESSION_COUNT_KEY,
  PWA_SESSION_MARK_KEY,
  PWA_SKIP_WAITING,
  PWA_SYNC_TAG,
  STANDALONE_MIN_SPLASH_MS,
  UPDATE_CHECK_INTERVAL_MS,
} from "./pwa-constants";

export interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
  prompt: () => Promise<void>;
}

export type InstallOutcome = "accepted" | "dismissed" | "unavailable";

export function isBeforeInstallPromptEvent(event: Event): event is BeforeInstallPromptEvent {
  return "prompt" in event && "userChoice" in event;
}

export async function promptInstall(event: BeforeInstallPromptEvent): Promise<InstallOutcome> {
  await event.prompt();
  const choice = await event.userChoice;
  return choice.outcome;
}

interface NavigatorWithStandalone extends Navigator {
  standalone?: boolean;
}

function hasStandaloneFlag(nav: Navigator): nav is NavigatorWithStandalone {
  return "standalone" in nav;
}

export function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  if (window.matchMedia?.("(display-mode: standalone)").matches) return true;
  return typeof navigator !== "undefined" && hasStandaloneFlag(navigator) && navigator.standalone === true;
}

export function isIos(): boolean {
  if (typeof navigator === "undefined") return false;
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

export function isIosSafari(): boolean {
  if (!isIos()) return false;
  if (typeof navigator === "undefined") return false;
  return !/(CriOS|FxiOS|EdgiOS|OPiOS)/i.test(navigator.userAgent);
}

export function isInstallAvailable(
  installed: boolean,
  promptEvent: BeforeInstallPromptEvent | null,
  iosSafari = isIosSafari(),
): boolean {
  if (installed || isStandalone()) return false;
  return promptEvent !== null || iosSafari;
}

function readStorage(storage: "local" | "session", key: string): string | null {
  try {
    const store = storage === "local" ? window.localStorage : window.sessionStorage;
    return store.getItem(key);
  } catch {
    return null;
  }
}

function writeStorage(storage: "local" | "session", key: string, value: string): void {
  try {
    const store = storage === "local" ? window.localStorage : window.sessionStorage;
    store.setItem(key, value);
  } catch {
    // Storage can be unavailable in private mode; the feature degrades safely.
  }
}

function removeStorage(storage: "local" | "session", key: string): void {
  try {
    const store = storage === "local" ? window.localStorage : window.sessionStorage;
    store.removeItem(key);
  } catch {
    // Ignore storage failures.
  }
}

export function readLocal(key: string): string | null {
  if (typeof window === "undefined") return null;
  return readStorage("local", key);
}

export function writeLocal(key: string, value: string): void {
  if (typeof window === "undefined") return;
  writeStorage("local", key, value);
}

export function removeLocal(key: string): void {
  if (typeof window === "undefined") return;
  removeStorage("local", key);
}

export function readSession(key: string): string | null {
  if (typeof window === "undefined") return null;
  return readStorage("session", key);
}

export function writeSession(key: string, value: string): void {
  if (typeof window === "undefined") return;
  writeStorage("session", key, value);
}

export function removeSession(key: string): void {
  if (typeof window === "undefined") return;
  removeStorage("session", key);
}

/** Counts a browser session once and returns the running total. */
export function recordSession(now = Date.now()): number {
  if (typeof window === "undefined") return 0;
  const marked = readSession(PWA_SESSION_MARK_KEY);
  const stored = Number.parseInt(readLocal(PWA_SESSION_COUNT_KEY) ?? "0", 10);
  const current = Number.isFinite(stored) && stored > 0 ? stored : 0;
  if (marked === "1") return current;

  const next = current + 1;
  writeSession(PWA_SESSION_MARK_KEY, "1");
  writeLocal(PWA_SESSION_COUNT_KEY, String(next));
  writeLocal(`${PWA_SESSION_COUNT_KEY}-at`, String(now));
  return next;
}

export function getSessionCount(): number {
  const stored = Number.parseInt(readLocal(PWA_SESSION_COUNT_KEY) ?? "0", 10);
  return Number.isFinite(stored) && stored > 0 ? stored : 0;
}

export function markAddedToCart(): void {
  writeLocal(PWA_ADDED_TO_CART_KEY, "1");
}

export function hasAddedToCart(): boolean {
  return readLocal(PWA_ADDED_TO_CART_KEY) === "1";
}

export function snoozeInstall(now = Date.now()): void {
  const until = now + INSTALL_SNOOZE_DAYS * 24 * 60 * 60 * 1000;
  writeLocal(PWA_INSTALL_SNOOZE_KEY, String(until));
}

export function isInstallSnoozed(now = Date.now()): boolean {
  const until = Number.parseInt(readLocal(PWA_INSTALL_SNOOZE_KEY) ?? "0", 10);
  return Number.isFinite(until) && until > now;
}

/** True when the user has typed into a form since it was rendered. */
export function hasDirtyForm(root: ParentNode | null = typeof document === "undefined" ? null : document): boolean {
  if (!root) return false;
  if (root.querySelector('[data-dirty="true"], [data-pwa-dirty="true"]')) return true;

  const forms = Array.from(root.querySelectorAll("form"));
  for (const form of forms) {
    const fields = Array.from(form.querySelectorAll("input, textarea"));
    for (const field of fields) {
      if (field instanceof HTMLInputElement) {
        if (field.type === "checkbox" || field.type === "radio") {
          if (field.checked !== field.defaultChecked) return true;
        } else if (field.type !== "hidden" && field.value !== field.defaultValue) {
          return true;
        }
      } else if (field instanceof HTMLTextAreaElement) {
        if (field.value !== field.defaultValue) return true;
      }
    }
  }

  return false;
}
