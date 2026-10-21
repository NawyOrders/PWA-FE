/**
 * Mutable router state shared by the `next/navigation` mock and the tests.
 * Kept in its own module so the mock factory can import it lazily.
 */
import { vi } from "vitest";

export const routerMock = {
  push: vi.fn(),
  replace: vi.fn(),
  refresh: vi.fn(),
  back: vi.fn(),
  forward: vi.fn(),
  prefetch: vi.fn(),
};

export const routerState = {
  pathname: "/",
  searchParams: new URLSearchParams(),
};

export function setRoute(pathname: string, search = ""): void {
  routerState.pathname = pathname;
  routerState.searchParams = new URLSearchParams(search);
}
