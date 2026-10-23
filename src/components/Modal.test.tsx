import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Modal } from "./Modal";
import { renderWithProviders } from "../../tests/utils/render";

function renderModal(
  props: Partial<React.ComponentProps<typeof Modal>> = {},
  options: Parameters<typeof renderWithProviders>[1] = {},
) {
  const onClose = vi.fn();
  const view = renderWithProviders(
    <Modal open onClose={onClose} labelledBy="title" {...props}>
      <h2 id="title">عنوان</h2>
      <button type="button">إغلاق</button>
    </Modal>,
    options,
  );
  return { ...view, onClose };
}

describe("Modal", () => {
  it("UT-MODAL-01 renders nothing when it is closed", () => {
    renderModal({ open: false });

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("UT-MODAL-02 renders a modal dialog with the given label", () => {
    renderModal();

    const dialog = screen.getByRole("dialog");
    expect(dialog).toHaveAttribute("aria-modal", "true");
    expect(dialog).toHaveAttribute("aria-labelledby", "title");
  });

  it("UT-MODAL-03 closes on the backdrop", async () => {
    const { user, onClose, t } = renderModal();

    await user.click(screen.getByRole("button", { name: t("common.close") }));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("UT-MODAL-04 closes on Escape", async () => {
    const { user, onClose } = renderModal();

    await user.keyboard("{Escape}");

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("UT-MODAL-05 moves the focus inside the dialog", () => {
    renderModal();

    expect(screen.getByRole("dialog").contains(document.activeElement)).toBe(true);
  });
});
