import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ScreenHeader } from "./ScreenHeader";
import { renderWithProviders } from "../../tests/utils/render";

function renderHeader(props: Partial<Parameters<typeof ScreenHeader>[0]> = {}) {
  const onAction = vi.fn();
  const closeAction = vi.fn();
  const view = renderWithProviders(
    <ScreenHeader title="السلة" onAction={onAction} closeAction={closeAction} {...props} />,
  );
  return { ...view, onAction, closeAction };
}

describe("ScreenHeader", () => {
  it("UT-HEADER-01 shows the title", () => {
    renderHeader();

    expect(screen.getByRole("heading", { level: 1, name: "السلة" })).toBeInTheDocument();
  });

  it("UT-HEADER-02 shows the kicker and the counter", () => {
    renderHeader({ kicker: "الطلب", counter: "٣ أصناف" });

    expect(screen.getByText("الطلب")).toBeInTheDocument();
    expect(screen.getByText("٣ أصناف")).toBeInTheDocument();
  });

  it("UT-HEADER-03 shows the menu button by default", async () => {
    const { user, onAction } = renderHeader({ actionLabel: "القائمة" });

    await user.click(screen.getByRole("button", { name: "القائمة" }));

    expect(onAction).toHaveBeenCalledTimes(1);
  });

  it("UT-HEADER-04 moves the action in front of the title for a close action", () => {
    renderHeader({ action: "close", actionLabel: "إغلاق" });

    const header = screen.getByRole("banner");
    const button = screen.getByRole("button", { name: "إغلاق" });
    const title = screen.getByRole("heading", { level: 1 });

    expect(button.compareDocumentPosition(title) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(header).toContainElement(button);
  });

  it("UT-HEADER-05 shows the close button of a sheet", async () => {
    const { user, closeAction } = renderHeader({ closeLabel: "إغلاق" });

    await user.click(screen.getByRole("button", { name: "إغلاق" }));

    expect(closeAction).toHaveBeenCalledTimes(1);
  });

  it("UT-HEADER-06 hides the close button of a sheet for a back action", () => {
    renderHeader({ action: "back", actionLabel: "رجوع", closeLabel: "إغلاق" });

    expect(screen.queryByRole("button", { name: "إغلاق" })).not.toBeInTheDocument();
  });
});
