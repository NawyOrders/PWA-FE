import { screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { AddressFormSheet } from "./AddressFormSheet";
import { renderWithProviders } from "../../../tests/utils/render";
import { createAddress } from "@/store/addressStore";

function renderSheet(
  mode: "add" | "edit" = "add",
  address = { ...createAddress(), area: "حي النخيل", street: "شارع السلطان محمد" },
) {
  const onSubmit = vi.fn();
  const onClose = vi.fn();
  const utils = renderWithProviders(
    <AddressFormSheet address={address} mode={mode} onClose={onClose} onSubmit={onSubmit} />,
    { route: "/ar/profile/addresses" },
  );
  return { ...utils, onSubmit, onClose, address };
}

describe("AddressFormSheet", () => {
  it("UT-ADDR-01 shows the add title", () => {
    const { t } = renderSheet("add");

    expect(screen.getByRole("heading", { name: t("addresses.formAddTitle") })).toBeInTheDocument();
  });

  it("UT-ADDR-02 shows the edit title", () => {
    const { t } = renderSheet("edit");

    expect(screen.getByRole("heading", { name: t("addresses.formEditTitle") })).toBeInTheDocument();
  });

  it("UT-ADDR-03 offers the three address types", () => {
    const { t } = renderSheet();

    expect(screen.getByRole("radio", { name: t("addresses.home") })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: t("addresses.work") })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: t("addresses.other") })).toBeInTheDocument();
  });

  it("UT-ADDR-04 shows the custom label only for the other type", async () => {
    const { user, t } = renderSheet();

    expect(screen.queryByLabelText(t("addresses.labelCustom"))).not.toBeInTheDocument();

    await user.click(screen.getByRole("radio", { name: t("addresses.other") }));

    expect(screen.getByLabelText(t("addresses.labelCustom"))).toBeInTheDocument();
  });

  it("UT-ADDR-05 requires the custom label for the other type", async () => {
    const { user, t } = renderSheet();

    await user.click(screen.getByRole("radio", { name: t("addresses.other") }));
    await user.click(screen.getByRole("button", { name: t("addresses.formSave") }));

    expect(screen.getByText(t("addresses.errorCustomLabel"))).toBeInTheDocument();
  });

  it("UT-ADDR-06 requires the area", async () => {
    const { user, t } = renderSheet("add", { ...createAddress() });

    await user.click(screen.getByRole("button", { name: t("addresses.formSave") }));

    expect(screen.getByText(t("addresses.errorArea"))).toBeInTheDocument();
  });

  it("UT-ADDR-07 requires the street", async () => {
    const { user, t } = renderSheet("add", { ...createAddress(), area: "حي النخيل" });

    await user.click(screen.getByRole("button", { name: t("addresses.formSave") }));

    expect(screen.getByText(t("addresses.errorStreet"))).toBeInTheDocument();
  });

  it("UT-ADDR-08 submits the trimmed address", async () => {
    const { user, t, onSubmit } = renderSheet("add", { ...createAddress() });

    await user.type(screen.getByLabelText(t("addresses.labelArea")), "  حي النخيل  ");
    await user.type(screen.getByLabelText(t("addresses.labelStreet")), "شارع السلطان محمد");
    await user.type(screen.getByLabelText(t("addresses.labelBuilding")), "12");
    await user.click(screen.getByRole("button", { name: t("addresses.formSave") }));

    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit.mock.calls[0][0]).toMatchObject({
      area: "حي النخيل",
      street: "شارع السلطان محمد",
      building: "12",
    });
  });

  it("UT-ADDR-09 does not submit while the form is invalid", async () => {
    const { user, t, onSubmit } = renderSheet("add", { ...createAddress() });

    await user.click(screen.getByRole("button", { name: t("addresses.formSave") }));

    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("UT-ADDR-10 toggles the default switch", async () => {
    const { user, t } = renderSheet();

    const toggle = screen.getByRole("switch", { name: t("addresses.setDefault") });
    expect(toggle).toHaveAttribute("aria-checked", "false");

    await user.click(toggle);

    expect(toggle).toHaveAttribute("aria-checked", "true");
  });

  it("UT-ADDR-11 closes the sheet", async () => {
    const { user, t, onClose } = renderSheet();

    const dialog = screen.getByRole("dialog");
    await user.click(within(dialog).getAllByRole("button", { name: t("common.close") })[0]);

    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
