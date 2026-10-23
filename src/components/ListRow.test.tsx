import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ListRow } from "./ListRow";
import { renderWithProviders } from "../../tests/utils/render";

function renderRow(props: Partial<Parameters<typeof ListRow>[0]> = {}) {
  const onClick = vi.fn();
  const view = renderWithProviders(
    <ListRow
      icon={<span aria-hidden>👤</span>}
      title="المعلومات الشخصية"
      subtitle="الاسم ورقم الموبايل"
      onClick={onClick}
      {...props}
    />,
  );
  return { ...view, onClick };
}

describe("ListRow", () => {
  it("UT-ROW-01 shows the title", () => {
    renderRow();

    expect(screen.getByRole("button", { name: /المعلومات الشخصية/ })).toBeInTheDocument();
  });

  it("UT-ROW-02 shows the subtitle", () => {
    renderRow();

    expect(screen.getByText("الاسم ورقم الموبايل")).toBeInTheDocument();
  });

  it("UT-ROW-03 handles the click", async () => {
    const { user, onClick } = renderRow();

    await user.click(screen.getByRole("button", { name: /المعلومات الشخصية/ }));

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("UT-ROW-04 hides the subtitle when there is none", () => {
    renderRow({ subtitle: undefined });

    expect(screen.queryByText("الاسم ورقم الموبايل")).not.toBeInTheDocument();
  });
});
