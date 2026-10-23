import { act, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Toast } from "./Toast";
import { useUiStore, type Toast as ToastModel } from "@/store/uiStore";
import { renderWithProviders } from "../../tests/utils/render";
import { useFakeTimers } from "../../tests/utils/timers";
import { resetStores } from "../../tests/utils/stores";

function renderToast(toast: ToastModel) {
  const view = renderWithProviders(<Toast />, { stores: { ui: { toast } } });
  return view;
}

describe("Toast", () => {
  beforeEach(() => {
    resetStores();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("UT-TOAST-01 renders nothing when there is no toast", () => {
    renderWithProviders(<Toast />);

    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("UT-TOAST-02 announces the message as a status", () => {
    renderToast({ id: 1, message: "تمت الإضافة", tone: "default" });

    const status = screen.getByRole("status");
    expect(status).toHaveTextContent("تمت الإضافة");
    expect(status).toHaveAttribute("aria-live", "polite");
  });

  it("UT-TOAST-03 hides itself after the duration", () => {
    useFakeTimers();
    renderToast({ id: 1, message: "تمت الإضافة", tone: "default", duration: 1000 });

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(screen.queryByRole("status")).not.toBeInTheDocument();
    expect(useUiStore.getState().toast).toBeNull();
  });

  it("UT-TOAST-04 runs the action of the toast and closes it", async () => {
    const onAction = vi.fn();
    const { user } = renderToast({
      id: 1,
      message: "تم الحذف",
      tone: "default",
      action: { label: "تراجع", onAction },
    });

    await user.click(screen.getByRole("button", { name: "تراجع" }));

    expect(onAction).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("UT-TOAST-05 uses the tone of the toast", () => {
    renderToast({ id: 1, message: "خطأ", tone: "danger" });

    expect(screen.getByRole("status").className).toContain("bg-danger");
  });
});
