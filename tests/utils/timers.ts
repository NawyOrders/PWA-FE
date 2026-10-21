import { vi } from "vitest";

/** The fixed Cairo time used by every test unless it overrides the clock. */
export const FIXED_NOW = new Date("2026-10-20T10:00:00+03:00");

export type TimerMode = "date-only" | "full";

let mode: TimerMode = "date-only";

/**
 * Switches the test to fully faked timers (setTimeout, setInterval, Date) and
 * keeps the fixed Cairo time. Use it for countdown, debounce, carousel,
 * toast and undo behaviour (TESTING.md section 8.6).
 */
export function useFakeTimers(now: Date = FIXED_NOW): void {
  mode = "full";
  vi.useFakeTimers();
  vi.setSystemTime(now);
}

/** Restores the default mode: only `Date` is faked, real timers elsewhere. */
export function useDateOnlyTimers(now: Date = FIXED_NOW): void {
  mode = "date-only";
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(now);
}

/**
 * `advanceTimers` callback for `userEvent.setup`. It only advances when the
 * test opted into full fake timers, so the default fixed clock never drifts.
 */
export function advanceTimers(delay: number): void {
  if (mode === "full") vi.advanceTimersByTime(delay);
}

export function currentTimerMode(): TimerMode {
  return mode;
}
