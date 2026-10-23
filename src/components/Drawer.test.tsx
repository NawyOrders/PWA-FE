import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import Link from "next/link";
import { Drawer } from "./Drawer";
import { renderWithProviders } from "../../tests/utils/render";

function renderDrawer(open = true) {
  const onClose = vi.fn();
  const view = renderWithProviders(
    <Drawer open={open} onClose={onClose}>
      <button type="button">أول</button>
      <Link href="/ar/cart">السلة</Link>
    </Drawer>,
  );
  return { ...view, onClose };
}

describe("Drawer", () => {
  it("UT-DRAWER-01 renders nothing while it is closed", () => {
    renderDrawer(false);

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("UT-DRAWER-02 opens as a modal dialog", () => {
    renderDrawer();

    const dialog = screen.getByRole("dialog");
    expect(dialog).toHaveAttribute("aria-modal", "true");
  });

  it("UT-DRAWER-03 closes when the backdrop is pressed", async () => {
    const { user, onClose, t } = renderDrawer();

    await user.click(screen.getByRole("button", { name: t("common.close") }));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("UT-DRAWER-04 closes with the escape key", async () => {
    const { user, onClose } = renderDrawer();

    await user.keyboard("{Escape}");

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("UT-DRAWER-05 moves the focus into the drawer", () => {
    renderDrawer();

    expect(screen.getByRole("button", { name: "أول" })).toHaveFocus();
  });

  it("UT-DRAWER-06 keeps the tab order inside the drawer", async () => {
    const { user } = renderDrawer();

    await user.tab();

    expect(screen.getByRole("link", { name: "السلة" })).toHaveFocus();
  });

  it("UT-DRAWER-07 traps the focus on the last element", async () => {
    const { user } = renderDrawer();

    await user.tab();
    await user.tab();

    expect(screen.getByRole("button", { name: "أول" })).toHaveFocus();
  });

  it("UT-DRAWER-08 names the dialog with the given label", () => {
    renderWithProviders(
      <Drawer open onClose={() => undefined} labelledBy="drawer-title">
        <p id="drawer-title">القائمة</p>
      </Drawer>,
    );

    expect(screen.getByRole("dialog", { name: "القائمة" })).toBeInTheDocument();
  });

  it("UT-DRAWER-09 shows the content of the drawer", () => {
    renderDrawer();

    expect(screen.getByText("السلة")).toBeInTheDocument();
  });
});
