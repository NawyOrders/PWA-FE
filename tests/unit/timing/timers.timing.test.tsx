import { act, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { renderWithProviders } from "../../utils/render";
import { useFakeTimers } from "../../utils/timers";
import { Toast } from "@/components/Toast";
import { useUiStore } from "@/store/uiStore";
import { useCartStore } from "@/store/cartStore";
import { useFavoritesStore } from "@/store/favoritesStore";
import { fetchFaq } from "@/lib/api";
import { dishes } from "@/data/dishes";

describe("timing: the toast lifecycle", () => {
  it("UT-TIME-01 hides itself after the default duration", () => {
    vi.useFakeTimers();
    renderWithProviders(<Toast />);
    act(() => useUiStore.getState().showToast("تم الحفظ"));
    expect(screen.getByRole("status")).toBeInTheDocument();

    act(() => vi.advanceTimersByTime(2399));
    expect(screen.getByRole("status")).toBeInTheDocument();

    act(() => vi.advanceTimersByTime(1));
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("UT-TIME-02 respects a custom duration", () => {
    vi.useFakeTimers();
    renderWithProviders(<Toast />);
    act(() => useUiStore.getState().showToast("حذف", "danger", { duration: 5000 }));

    act(() => vi.advanceTimersByTime(4999));
    expect(screen.getByRole("status")).toBeInTheDocument();

    act(() => vi.advanceTimersByTime(1));
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("UT-TIME-03 restarts the timer when a second toast replaces the first", () => {
    vi.useFakeTimers();
    renderWithProviders(<Toast />);
    act(() => useUiStore.getState().showToast("أول"));
    act(() => vi.advanceTimersByTime(2000));
    act(() => useUiStore.getState().showToast("ثاني"));
    act(() => vi.advanceTimersByTime(2000));

    expect(screen.getByRole("status")).toBeInTheDocument();
    act(() => vi.advanceTimersByTime(400));
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("UT-TIME-04 clears the hide timer when the toast unmounts", () => {
    vi.useFakeTimers();
    const clear = vi.spyOn(globalThis, "clearTimeout");
    const { unmount } = renderWithProviders(<Toast />);
    act(() => useUiStore.getState().showToast("مرحبا"));

    unmount();

    expect(clear).toHaveBeenCalled();
    act(() => vi.advanceTimersByTime(5000));
    expect(vi.getTimerCount()).toBe(0);
    clear.mockRestore();
  });

  it("UT-TIME-05 runs the undo action once and closes the toast", async () => {
    const onAction = vi.fn();
    renderWithProviders(<Toast />);
    act(() =>
      useUiStore
        .getState()
        .showToast("حذف العنوان", "default", { action: { label: "تراجع", onAction } }),
    );

    await userEvent.click(screen.getByRole("button", { name: "تراجع" }));

    expect(onAction).toHaveBeenCalledTimes(1);
    expect(useUiStore.getState().toast).toBeNull();
  });
});

describe("timing: the login countdown", () => {
  async function openLogin() {
    const { default: LoginPage } = await import("@/app/[locale]/login/page");
    return renderWithProviders(<LoginPage />, { route: "/ar/login" });
  }

  it("UT-TIME-06 counts the OTP window down from 60 and stops at zero", async () => {
    useFakeTimers();
    const { user, t } = await openLogin();

    await user.type(
      screen.getByRole("textbox", { name: new RegExp(t("auth.phoneLabel")) }),
      "0101234567",
    );
    await user.click(screen.getByRole("button", { name: t("auth.send") }));

    expect(screen.getByText(t("auth.seconds", { seconds: 60 }))).toBeInTheDocument();

    act(() => vi.advanceTimersByTime(30_000));
    expect(screen.getByText(t("auth.seconds", { seconds: 30 }))).toBeInTheDocument();

    act(() => vi.advanceTimersByTime(30_000));
    expect(screen.queryByText(t("auth.seconds", { seconds: 0 }))).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: t("auth.resend") })).toBeInTheDocument();
  });

  it("UT-TIME-07 restarts the countdown from 60 on resend", async () => {
    useFakeTimers();
    const { user, t } = await openLogin();

    await user.type(
      screen.getByRole("textbox", { name: new RegExp(t("auth.phoneLabel")) }),
      "0101234567",
    );
    await user.click(screen.getByRole("button", { name: t("auth.send") }));
    act(() => vi.advanceTimersByTime(60_000));

    await user.click(screen.getByRole("button", { name: t("auth.resend") }));

    expect(screen.getByText(t("auth.seconds", { seconds: 60 }))).toBeInTheDocument();
  });

  it("UT-TIME-08 stops the countdown interval when the screen unmounts", async () => {
    useFakeTimers();
    const { user, t, unmount } = await openLogin();

    await user.type(
      screen.getByRole("textbox", { name: new RegExp(t("auth.phoneLabel")) }),
      "0101234567",
    );
    await user.click(screen.getByRole("button", { name: t("auth.send") }));

    unmount();
    act(() => vi.advanceTimersByTime(120_000));

    expect(vi.getTimerCount()).toBe(0);
  });
});

describe("timing: race conditions", () => {
  it("UT-TIME-09 keeps one signed quantity after a rapid double increment", () => {
    const dish = dishes[0];
    useCartStore.setState({ items: [], coupon: null, fulfillmentMethod: "delivery" });

    act(() => {
      useCartStore.getState().add(dish.id, 1, dish.price);
      useCartStore.getState().add(dish.id, 1, dish.price);
    });

    const items = useCartStore.getState().items;
    expect(items).toHaveLength(1);
    expect(items[0].quantity).toBe(2);
  });

  it("UT-TIME-10 keeps one row after a rapid add and remove of the same dish", () => {
    const dish = dishes[0];
    useCartStore.setState({ items: [], coupon: null, fulfillmentMethod: "delivery" });

    act(() => {
      useCartStore.getState().add(dish.id, 1, dish.price);
      useCartStore.getState().remove(`${dish.id}:${dish.price}::`);
    });

    expect(useCartStore.getState().items).toHaveLength(0);
  });

  it("UT-TIME-11 ends unfavorited after a rapid double toggle", () => {
    const dish = dishes[0];
    useFavoritesStore.setState({ ids: [] });

    act(() => {
      useFavoritesStore.getState().toggle(dish.id);
      useFavoritesStore.getState().toggle(dish.id);
    });

    expect(useFavoritesStore.getState().ids).toEqual([]);
  });

  it("UT-TIME-12 resolves an in-flight request after a locale change", async () => {
    useFakeTimers();
    const call = fetchFaq();

    await act(() => vi.advanceTimersByTimeAsync(250));
    const { unmount } = renderWithProviders(<div />, { locale: "en" });
    unmount();

    await act(() => vi.advanceTimersByTimeAsync(250));
    await expect(call).resolves.toBeDefined();
  });

  it("UT-TIME-13 leaves no pending timer once the request settles", async () => {
    useFakeTimers();
    const call = fetchFaq();

    await act(() => vi.advanceTimersByTimeAsync(500));
    await call;

    expect(vi.getTimerCount()).toBe(0);
  });

  it("UT-TIME-14 writes no console error when a request ends after unmount", async () => {
    useFakeTimers();
    const error = vi.spyOn(console, "error").mockImplementation(() => undefined);

    const pending = fetchFaq();
    await act(() => vi.advanceTimersByTimeAsync(500));
    await pending;

    await waitFor(() => expect(error).not.toHaveBeenCalled());
    error.mockRestore();
  });
});
