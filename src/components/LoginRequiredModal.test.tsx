import { screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { LoginRequiredModal } from "./LoginRequiredModal";
import { useUiStore } from "@/store/uiStore";
import { routerMock } from "../../tests/mocks/router";
import { renderWithProviders } from "../../tests/utils/render";

describe("LoginRequiredModal", () => {
  it("UT-LOGINMODAL-01 shows nothing while the modal is closed", () => {
    renderWithProviders(<LoginRequiredModal />, { stores: { ui: { loginModalOpen: false } } });

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("UT-LOGINMODAL-02 opens with the localized title and body", () => {
    const { t } = renderWithProviders(<LoginRequiredModal />, {
      stores: { ui: { loginModalOpen: true } },
    });

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText(t("loginRequired.title"))).toBeInTheDocument();
    expect(screen.getByText(t("loginRequired.body"))).toBeInTheDocument();
  });

  it("UT-LOGINMODAL-03 sends the guest to the login screen", async () => {
    const { user, t } = renderWithProviders(<LoginRequiredModal />, {
      locale: "ar",
      stores: { ui: { loginModalOpen: true } },
    });

    await user.click(screen.getByRole("button", { name: t("loginRequired.cta") }));

    expect(routerMock.push).toHaveBeenCalledWith("/ar/login");
    expect(useUiStore.getState().loginModalOpen).toBe(false);
  });

  it("UT-LOGINMODAL-04 closes without navigating", async () => {
    const { user, t } = renderWithProviders(<LoginRequiredModal />, {
      stores: { ui: { loginModalOpen: true } },
    });

    const close = within(screen.getByRole("dialog")).getByRole("button", {
      name: t("common.close"),
    });
    await user.click(close);

    expect(useUiStore.getState().loginModalOpen).toBe(false);
    expect(routerMock.push).not.toHaveBeenCalled();
  });
});
