import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { EmptyState } from "./EmptyState";
import { renderWithProviders } from "../../tests/utils/render";

function renderEmpty(props: Partial<Parameters<typeof EmptyState>[0]> = {}) {
  const onAction = vi.fn();
  const view = renderWithProviders(
    <EmptyState
      icon={<span aria-hidden>🛒</span>}
      title="سلتك فاضية"
      hint="ابدأ بإضافة أطباقك المفضلة"
      onAction={onAction}
      {...props}
    />,
  );
  return { ...view, onAction };
}

describe("EmptyState", () => {
  it("UT-EMPTY-01 shows the title and the hint", () => {
    renderEmpty();

    expect(screen.getByRole("heading", { name: "سلتك فاضية" })).toBeInTheDocument();
    expect(screen.getByText("ابدأ بإضافة أطباقك المفضلة")).toBeInTheDocument();
  });

  it("UT-EMPTY-02 offers the action", () => {
    renderEmpty({ actionLabel: "تصفح القائمة" });

    expect(screen.getByRole("button", { name: "تصفح القائمة" })).toBeInTheDocument();
  });

  it("UT-EMPTY-03 runs the action", async () => {
    const { user, onAction } = renderEmpty({ actionLabel: "تصفح القائمة" });

    await user.click(screen.getByRole("button", { name: "تصفح القائمة" }));

    expect(onAction).toHaveBeenCalledTimes(1);
  });

  it("UT-EMPTY-04 hides the action without a label", () => {
    renderEmpty({ actionLabel: undefined });

    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("UT-EMPTY-05 shows the icon above the title", () => {
    renderEmpty();

    expect(screen.getByText("🛒")).toBeInTheDocument();
  });
});
