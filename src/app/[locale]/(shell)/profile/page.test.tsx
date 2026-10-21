import { screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import ProfilePage from "./page";
import { renderWithProviders } from "../../../../../tests/utils/render";
import { routerMock } from "../../../../../tests/mocks/router";
import { useAuthStore } from "@/store/authStore";
import { useUiStore } from "@/store/uiStore";
import { makeUser } from "../../../../../tests/factories";

const loggedIn = {
  auth: { isLoggedIn: true, user: makeUser({ name: "أحمد", points: 120 }) },
};

function renderProfile(stores = {}) {
  return renderWithProviders(<ProfilePage />, {
    route: "/ar/profile",
    stores: { ...loggedIn, ...stores },
  });
}

describe("ProfilePage", () => {
  it("UT-PAGE-PROFILE-01 asks a guest to log in", () => {
    const { t } = renderWithProviders(<ProfilePage />, {
      route: "/ar/profile",
      stores: { auth: { isLoggedIn: false, user: null } },
    });

    expect(screen.getByRole("heading", { name: t("profile.guestTitle") })).toBeInTheDocument();
  });

  it("UT-PAGE-PROFILE-02 sends a guest to the login screen", async () => {
    const { user, t } = renderWithProviders(<ProfilePage />, {
      route: "/ar/profile",
      stores: { auth: { isLoggedIn: false, user: null } },
    });

    await user.click(screen.getByRole("button", { name: t("profile.login") }));

    expect(routerMock.push).toHaveBeenCalledWith("/ar/login");
  });

  it("UT-PAGE-PROFILE-03 shows the name and the email of the user", () => {
    renderProfile();

    expect(screen.getByRole("heading", { level: 1, name: "أحمد" })).toBeInTheDocument();
    expect(screen.getByText("user@nawyorders.com")).toBeInTheDocument();
  });

  it("UT-PAGE-PROFILE-04 shows the statistics of the user", () => {
    const { t } = renderProfile();

    expect(screen.getByText("120")).toBeInTheDocument();
    expect(screen.getByText(t("profile.points"))).toBeInTheDocument();
  });

  it("UT-PAGE-PROFILE-05 opens the personal information", async () => {
    const { user, t } = renderProfile();

    await user.click(screen.getByRole("button", { name: new RegExp(t("profile.personalInfo")) }));

    expect(routerMock.push).toHaveBeenCalledWith("/ar/profile/personal-info");
  });

  it("UT-PAGE-PROFILE-06 opens the addresses", async () => {
    const { user, t } = renderProfile();

    await user.click(screen.getByRole("button", { name: new RegExp(t("profile.addresses")) }));

    expect(routerMock.push).toHaveBeenCalledWith("/ar/profile/addresses");
  });

  it("UT-PAGE-PROFILE-07 opens the help", async () => {
    const { user, t } = renderProfile();

    await user.click(screen.getByRole("button", { name: new RegExp(t("profile.help")) }));

    expect(routerMock.push).toHaveBeenCalledWith("/ar/profile/help");
  });

  it("UT-PAGE-PROFILE-08 asks before logging out", async () => {
    const { user, t } = renderProfile();

    await user.click(screen.getByRole("button", { name: new RegExp(t("profile.logout")) }));

    expect(screen.getByRole("dialog", { name: t("profile.logoutTitle") })).toBeInTheDocument();
    expect(useAuthStore.getState().isLoggedIn).toBe(true);
  });

  it("UT-PAGE-PROFILE-09 logs the user out after the confirmation", async () => {
    const { user, t } = renderProfile();

    await user.click(screen.getByRole("button", { name: new RegExp(t("profile.logout")) }));
    const dialog = screen.getByRole("dialog");
    await user.click(within(dialog).getByRole("button", { name: t("profile.logout") }));

    expect(useAuthStore.getState().isLoggedIn).toBe(false);
    expect(routerMock.replace).toHaveBeenCalledWith("/ar");
  });

  it("UT-PAGE-PROFILE-10 tells the user that a row is not ready yet", async () => {
    const { user, t } = renderProfile();

    await user.click(screen.getByRole("button", { name: new RegExp(t("profile.payment")) }));

    expect(useUiStore.getState().toast?.message).toBe(t("profile.comingSoon"));
  });
});
