import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { markOrderConfirmed, useOrderConfirmed } from "./orderStatus";
import { useFakeTimers } from "../../tests/utils/timers";

const TRACKING_DURATION = 15_000;

describe("useOrderConfirmed", () => {
  afterEach(() => {
    window.sessionStorage.clear();
  });

  it("UT-ORDER-01 is false when no order was confirmed", () => {
    useFakeTimers();
    const { result } = renderHook(() => useOrderConfirmed());
    expect(result.current).toBe(false);
  });

  it("UT-ORDER-02 is true right after the confirmation", () => {
    useFakeTimers();
    const { result } = renderHook(() => useOrderConfirmed());

    act(() => {
      markOrderConfirmed();
    });

    expect(result.current).toBe(true);
  });

  it("UT-ORDER-03 is false again once the tracking window passed", () => {
    useFakeTimers();
    const { result } = renderHook(() => useOrderConfirmed());

    act(() => {
      markOrderConfirmed();
    });
    expect(result.current).toBe(true);

    act(() => {
      vi.advanceTimersByTime(TRACKING_DURATION);
    });

    expect(result.current).toBe(false);
  });

  it("UT-ORDER-04 stays true inside the tracking window", () => {
    useFakeTimers();
    const { result } = renderHook(() => useOrderConfirmed());

    act(() => {
      markOrderConfirmed();
    });

    act(() => {
      vi.advanceTimersByTime(TRACKING_DURATION - 1000);
    });

    expect(result.current).toBe(true);
  });

  it("UT-ORDER-05 ignores a corrupted confirmation value", () => {
    useFakeTimers();
    window.sessionStorage.setItem("nawy-order-confirmed", "not-a-number");

    const { result } = renderHook(() => useOrderConfirmed());

    expect(result.current).toBe(false);
  });

  it("UT-ORDER-06 stops listening after the unmount", () => {
    useFakeTimers();
    const { unmount } = renderHook(() => useOrderConfirmed());
    unmount();

    expect(() => {
      act(() => {
        markOrderConfirmed();
      });
    }).not.toThrow();
  });
});
