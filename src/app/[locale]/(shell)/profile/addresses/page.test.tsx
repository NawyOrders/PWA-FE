import { screen, waitFor, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import AddressesPage from "./page";
import { renderWithProviders } from "../../../../../../tests/utils/render";
import { routerMock } from "../../../../../../tests/mocks/router";
import { useAddressStore, type Address } from "@/store/addressStore";
import { useUiStore } from "@/store/uiStore";
import { Toast } from "@/components/Toast";

function makeAddress(id: string, overrides: Partial<Address> = {}): Address {
  return {
    id,
    type: "home",
    customLabel: "",
    area: "حي النخيل",
    street: "شارع السلطان محمد",
    building: "12",
    floorApartment: "3 / 8",
    landmark: "",
    notes: "",
    isDefault: false,
    ...overrides,
  };
}

function renderPage(addresses?: Address[]) {
  return renderWithProviders(
    <>
      <AddressesPage />
      <Toast />
    </>,
    {
      route: "/ar/profile/addresses",
      stores: {
        auth: { isLoggedIn: true, user: null },
        address: addresses ? { addresses } : undefined,
      },
    },
  );
}

describe("AddressesPage", () => {
  it("UT-PAGE-ADDR-01 shows the saved addresses", async () => {
    const { t } = renderPage();

    expect(
      await screen.findByRole("button", { name: `${t("addresses.editLabel")}: ${t("addresses.home")}` }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: `${t("addresses.editLabel")}: ${t("addresses.work")}` }),
    ).toBeInTheDocument();
  });

  it("UT-PAGE-ADDR-02 shows the empty state without addresses", async () => {
    const { t } = renderPage([]);

    expect(await screen.findByText(t("addresses.empty"))).toBeInTheDocument();
    expect(screen.getByText(t("addresses.emptyHint"))).toBeInTheDocument();
  });

  it("UT-PAGE-ADDR-03 keeps the save button disabled without a change", async () => {
    const { t } = renderPage();

    await screen.findByRole("button", { name: `${t("addresses.editLabel")}: ${t("addresses.home")}` });

    expect(screen.getByRole("button", { name: t("addresses.save") })).toBeDisabled();
  });

  it("UT-PAGE-ADDR-04 stages the deletion of an address", async () => {
    const { t } = renderPage();

    const del = await screen.findByRole("button", {
      name: `${t("addresses.deleteLabel")}: ${t("addresses.home")}`,
    });
    await waitFor(() => expect(del).toBeEnabled());
    await del.click();

    await waitFor(() =>
      expect(screen.getByRole("button", { name: t("addresses.save") })).toBeEnabled(),
    );
  });

  it("UT-PAGE-ADDR-05 restores a deleted address with the undo action", async () => {
    const { user, t } = renderPage();

    const del = await screen.findByRole("button", {
      name: `${t("addresses.deleteLabel")}: ${t("addresses.home")}`,
    });
    await waitFor(() => expect(del).toBeEnabled());
    await del.click();

    const undo = await screen.findByRole("button", { name: t("addresses.undo") });
    await user.click(undo);

    await waitFor(() =>
      expect(
        screen.getByRole("button", { name: `${t("addresses.editLabel")}: ${t("addresses.home")}` }),
      ).toBeInTheDocument(),
    );
  });

  it("UT-PAGE-ADDR-06 opens the form of a new address", async () => {
    const { user, t } = renderPage();

    await user.click(await screen.findByRole("button", { name: t("addresses.add") }));

    expect(screen.getByRole("dialog", { name: t("addresses.formAddTitle") })).toBeInTheDocument();
  });

  it("UT-PAGE-ADDR-07 refuses an address without an area", async () => {
    const { user, t } = renderPage();

    await user.click(await screen.findByRole("button", { name: t("addresses.add") }));
    const dialog = screen.getByRole("dialog");
    await user.click(within(dialog).getByRole("button", { name: t("addresses.formSave") }));

    expect(within(dialog).getByText(t("addresses.errorArea"))).toBeInTheDocument();
    expect(within(dialog).getByText(t("addresses.errorStreet"))).toBeInTheDocument();
  });

  it("UT-PAGE-ADDR-08 adds a valid address to the draft", async () => {
    const { user, t } = renderPage();

    await user.click(await screen.findByRole("button", { name: t("addresses.add") }));
    const dialog = screen.getByRole("dialog");
    await user.type(within(dialog).getByLabelText(t("addresses.labelArea")), "حي النخيل");
    await user.type(within(dialog).getByLabelText(t("addresses.labelStreet")), "شارع 1");
    await user.click(within(dialog).getByRole("button", { name: t("addresses.formSave") }));

    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    expect(screen.getByRole("button", { name: t("addresses.save") })).toBeEnabled();
  });

  it("UT-PAGE-ADDR-09 blocks the add button at the limit", async () => {
    const { t } = renderPage([
      makeAddress("a1"),
      makeAddress("a2"),
      makeAddress("a3"),
      makeAddress("a4"),
      makeAddress("a5"),
    ]);

    expect(await screen.findByText(t("addresses.limit"))).toBeInTheDocument();
    expect(screen.getByRole("button", { name: t("addresses.add") })).toBeDisabled();
  });

  it("UT-PAGE-ADDR-10 asks before leaving with unsaved changes", async () => {
    const { user, t } = renderPage();

    const del = await screen.findByRole("button", {
      name: `${t("addresses.deleteLabel")}: ${t("addresses.home")}`,
    });
    await waitFor(() => expect(del).toBeEnabled());
    await del.click();
    await waitFor(() =>
      expect(screen.getByRole("button", { name: t("addresses.save") })).toBeEnabled(),
    );
    await user.click(screen.getByRole("button", { name: t("common.back") }));

    expect(screen.getByRole("dialog", { name: t("addresses.discardTitle") })).toBeInTheDocument();
  });

  it("UT-PAGE-ADDR-11 saves the staged changes", async () => {
    const { user, t } = renderPage();

    const del = await screen.findByRole("button", {
      name: `${t("addresses.deleteLabel")}: ${t("addresses.home")}`,
    });
    await waitFor(() => expect(del).toBeEnabled());
    await del.click();
    await waitFor(() =>
      expect(screen.getByRole("button", { name: t("addresses.save") })).toBeEnabled(),
    );
    await user.click(screen.getByRole("button", { name: t("addresses.save") }));

    await waitFor(() => expect(useAddressStore.getState().addresses).toHaveLength(2));
    expect(useUiStore.getState().toast?.message).toBe(t("addresses.saved"));
    expect(routerMock.replace).toHaveBeenCalledWith("/ar/profile");
  });

  it("UT-PAGE-ADDR-12 asks a guest to log in", async () => {
    renderWithProviders(<AddressesPage />, {
      route: "/ar/profile/addresses",
      stores: { auth: { isLoggedIn: false, user: null } },
    });

    await waitFor(() => expect(useUiStore.getState().loginModalOpen).toBe(true));
  });
});
