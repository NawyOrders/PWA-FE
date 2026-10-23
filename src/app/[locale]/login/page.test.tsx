import { act, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import LoginPage from "./page";
import { renderWithProviders } from "../../../../tests/utils/render";
import { routerMock } from "../../../../tests/mocks/router";
import { useAuthStore } from "@/store/authStore";
import { useUiStore } from "@/store/uiStore";
import { useDateOnlyTimers, useFakeTimers } from "../../../../tests/utils/timers";

const DEMO_OTP = "747123";

function renderLogin() {
  return renderWithProviders(<LoginPage />, { route: "/ar/login" });
}

async function advance(ms: number) {
  await act(async () => {
    await vi.advanceTimersByTimeAsync(ms);
  });
}

describe("LoginPage", () => {
  afterEach(() => {
    useDateOnlyTimers();
  });

  it("UT-PAGE-LOGIN-01 shows the welcome and the fields", () => {
    const { t } = renderLogin();

    expect(screen.getByRole("heading", { level: 1, name: t("auth.welcome") })).toBeInTheDocument();
    expect(screen.getByLabelText(t("auth.fullName"))).toBeInTheDocument();
    expect(screen.getByLabelText(t("auth.phoneLabel"))).toBeInTheDocument();
    expect(screen.getByRole("group", { name: t("auth.otpLabel") })).toBeInTheDocument();
  });

  it("UT-PAGE-LOGIN-02 keeps the send button disabled until the phone is complete", async () => {
    const { user, t } = renderLogin();

    const send = screen.getByRole("button", { name: t("auth.send") });
    expect(send).toBeDisabled();

    await user.type(screen.getByLabelText(t("auth.phoneLabel")), "100000000");

    expect(send).toBeDisabled();
  });

  it("UT-PAGE-LOGIN-03 enables the send button with a full phone number", async () => {
    const { user, t } = renderLogin();

    await user.type(screen.getByLabelText(t("auth.phoneLabel")), "1000000000");

    expect(screen.getByRole("button", { name: t("auth.send") })).toBeEnabled();
  });

  it("UT-PAGE-LOGIN-04 keeps only ten digits of the phone number", async () => {
    const { user, t } = renderLogin();

    const phone = screen.getByLabelText(t("auth.phoneLabel"));
    await user.type(phone, "10000000001234");

    expect(phone).toHaveValue("1000000000");
  });

  it("UT-PAGE-LOGIN-05 unlocks the code and starts the countdown", async () => {
    useFakeTimers();
    const { user, t } = renderLogin();

    await user.type(screen.getByLabelText(t("auth.phoneLabel")), "1000000000");
    await user.click(screen.getByRole("button", { name: t("auth.send") }));

    expect(screen.getByLabelText(`${t("auth.otpLabel")} 1`)).toBeEnabled();
    expect(screen.getByText(t("auth.seconds", { seconds: 60 }))).toBeInTheDocument();
  });

  it("UT-PAGE-LOGIN-06 offers the code again after the countdown", async () => {
    useFakeTimers();
    const { user, t } = renderLogin();

    await user.type(screen.getByLabelText(t("auth.phoneLabel")), "1000000000");
    await user.click(screen.getByRole("button", { name: t("auth.send") }));

    await advance(60_000);

    expect(screen.getByRole("button", { name: t("auth.resend") })).toBeInTheDocument();
  });

  it("UT-PAGE-LOGIN-07 refuses a wrong code", async () => {
    const { user, t } = renderLogin();

    await user.type(screen.getByLabelText(t("auth.phoneLabel")), "1000000000");
    await user.click(screen.getByRole("button", { name: t("auth.send") }));
    await user.type(screen.getByLabelText(`${t("auth.otpLabel")} 1`), "123456");
    await user.click(screen.getByRole("button", { name: t("auth.login") }));

    expect(await screen.findByText(t("auth.invalidOtp"))).toBeInTheDocument();
    expect(useAuthStore.getState().isLoggedIn).toBe(false);
  });

  it("UT-PAGE-LOGIN-08 refuses an empty name", async () => {
    const { user, t } = renderLogin();

    await user.type(screen.getByLabelText(t("auth.phoneLabel")), "1000000000");
    await user.click(screen.getByRole("button", { name: t("auth.send") }));
    await user.type(screen.getByLabelText(`${t("auth.otpLabel")} 1`), DEMO_OTP);
    await user.click(screen.getByRole("button", { name: t("auth.login") }));

    expect(await screen.findByText(t("auth.invalidName"))).toBeInTheDocument();
    expect(useAuthStore.getState().isLoggedIn).toBe(false);
  });

  it("UT-PAGE-LOGIN-09 logs the user in with the demo code", async () => {
    const { user, t } = renderLogin();

    await user.type(screen.getByLabelText(t("auth.fullName")), "أحمد");
    await user.type(screen.getByLabelText(t("auth.phoneLabel")), "1000000000");
    await user.click(screen.getByRole("button", { name: t("auth.send") }));
    await user.type(screen.getByLabelText(`${t("auth.otpLabel")} 1`), DEMO_OTP);
    await user.click(screen.getByRole("button", { name: t("auth.login") }));

    await waitFor(() => expect(useAuthStore.getState().isLoggedIn).toBe(true));
    expect(useAuthStore.getState().user?.name).toBe("أحمد");
    expect(useUiStore.getState().toast?.message).toBe(t("toast.welcome"));
  });

  it("UT-PAGE-LOGIN-10 closes the screen and goes back home", async () => {
    const { user, t } = renderLogin();

    await user.click(screen.getByRole("button", { name: t("common.close") }));

    expect(routerMock.replace).toHaveBeenCalledWith("/ar");
  });
});
