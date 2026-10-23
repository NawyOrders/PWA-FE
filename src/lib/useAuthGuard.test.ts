import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useAuthGuard } from "./useAuthGuard";
import { useAuthStore } from "@/store/authStore";
import { useUiStore } from "@/store/uiStore";
import { resetStores } from "../../tests/utils/stores";

describe("useAuthGuard", () => {
  beforeEach(() => {
    resetStores();
  });

  it("UT-GUARD-01 runs the action for a logged in user", () => {
    useAuthStore.setState({ isLoggedIn: true });
    const action = vi.fn();
    const { result } = renderHook(() => useAuthGuard());

    result.current(action);

    expect(action).toHaveBeenCalledTimes(1);
    expect(useUiStore.getState().loginModalOpen).toBe(false);
  });

  it("UT-GUARD-02 opens the login modal for a guest", () => {
    const action = vi.fn();
    const { result } = renderHook(() => useAuthGuard());

    result.current(action);

    expect(action).not.toHaveBeenCalled();
    expect(useUiStore.getState().loginModalOpen).toBe(true);
  });

  it("UT-GUARD-03 keeps the login modal closed for a logged in user", () => {
    useAuthStore.setState({ isLoggedIn: true });
    const { result } = renderHook(() => useAuthGuard());

    result.current(() => {});

    expect(useUiStore.getState().loginModalOpen).toBe(false);
  });
});
