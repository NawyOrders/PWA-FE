import { screen, waitFor, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import PersonalInfoPage from "./page";
import { renderWithProviders } from "../../../../../../tests/utils/render";
import { routerMock } from "../../../../../../tests/mocks/router";
import { useAuthStore } from "@/store/authStore";
import { useUiStore } from "@/store/uiStore";
import { makeUser } from "../../../../../../tests/factories";

function renderPage(stores = {}) {
  return renderWithProviders(<PersonalInfoPage />, {
    route: "/ar/profile/personal-info",
    stores: {
      auth: { isLoggedIn: true, user: makeUser({ name: "أحمد" }) },
      ...stores,
    },
  });
}

describe("PersonalInfoPage", () => {
  it("UT-PAGE-PI-01 shows the current name of the user", () => {
    const { t } = renderPage();

    expect(screen.getByLabelText(t("personalInfo.label"))).toHaveValue("أحمد");
  });

  it("UT-PAGE-PI-02 keeps the save button disabled without a change", () => {
    const { t } = renderPage();

    expect(screen.getByRole("button", { name: t("personalInfo.save") })).toBeDisabled();
  });

  it("UT-PAGE-PI-03 enables the save button after a change", async () => {
    const { user, t } = renderPage();

    await user.type(screen.getByLabelText(t("personalInfo.label")), "ا");

    expect(screen.getByRole("button", { name: t("personalInfo.save") })).toBeEnabled();
  });

  it("UT-PAGE-PI-04 refuses a name that is too short", async () => {
    const { user, t } = renderPage();

    const input = screen.getByLabelText(t("personalInfo.label"));
    await user.clear(input);
    await user.type(input, "أ");
    await user.tab();

    expect(await screen.findByText(t("personalInfo.errorShort"))).toBeInTheDocument();
  });

  it("UT-PAGE-PI-05 refuses a name with digits", async () => {
    const { user, t } = renderPage();

    const input = screen.getByLabelText(t("personalInfo.label"));
    await user.clear(input);
    await user.type(input, "أحمد12");
    await user.tab();

    expect(await screen.findByText(t("personalInfo.errorLetters"))).toBeInTheDocument();
  });

  it("UT-PAGE-PI-06 saves the new name", async () => {
    const { user, t } = renderPage();

    const input = screen.getByLabelText(t("personalInfo.label"));
    await user.clear(input);
    await user.type(input, "محمود");
    await user.click(screen.getByRole("button", { name: t("personalInfo.save") }));

    await waitFor(() => expect(useAuthStore.getState().user?.name).toBe("محمود"));
    expect(useUiStore.getState().toast?.message).toBe(t("personalInfo.saved"));
    expect(routerMock.replace).toHaveBeenCalledWith("/ar/profile");
  });

  it("UT-PAGE-PI-07 asks before leaving a dirty form", async () => {
    const { user, t } = renderPage();

    await user.type(screen.getByLabelText(t("personalInfo.label")), "ا");
    await user.click(screen.getByRole("button", { name: t("common.back") }));

    expect(screen.getByRole("dialog", { name: t("personalInfo.discardTitle") })).toBeInTheDocument();
  });

  it("UT-PAGE-PI-08 leaves without asking when nothing changed", async () => {
    const { user, t } = renderPage();

    await user.click(screen.getByRole("button", { name: t("common.back") }));

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("UT-PAGE-PI-09 discards the change after the confirmation", async () => {
    const { user, t } = renderPage();

    await user.type(screen.getByLabelText(t("personalInfo.label")), "ا");
    await user.click(screen.getByRole("button", { name: t("common.back") }));
    const dialog = screen.getByRole("dialog");
    await user.click(within(dialog).getByRole("button", { name: t("personalInfo.discardConfirm") }));

    // The history of the test browser has a single entry, so the page falls
    // back to the profile route instead of going back.
    expect(routerMock.replace).toHaveBeenCalledWith("/ar/profile");
  });

  it("UT-PAGE-PI-10 asks a guest to log in", () => {
    renderPage({ auth: { isLoggedIn: false, user: null } });

    expect(useUiStore.getState().loginModalOpen).toBe(true);
  });
});
