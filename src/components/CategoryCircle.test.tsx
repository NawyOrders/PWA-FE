import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { CategoryCircle } from "./CategoryCircle";
import { renderWithProviders } from "../../tests/utils/render";

function renderCategory(active = false) {
  const onClick = vi.fn();
  const view = renderWithProviders(
    <CategoryCircle label="برجر" image="crack-burgers" active={active} onClick={onClick} />,
  );
  return { ...view, onClick };
}

describe("CategoryCircle", () => {
  it("UT-CATEGORY-01 shows the label of the category", () => {
    renderCategory();

    expect(screen.getByRole("button", { name: /برجر/ })).toBeInTheDocument();
    expect(screen.getByText("برجر")).toBeInTheDocument();
  });

  it("UT-CATEGORY-02 marks the selected category as pressed", () => {
    renderCategory(true);

    expect(screen.getByRole("button", { name: /برجر/ })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });

  it("UT-CATEGORY-03 calls the click handler", async () => {
    const { user, onClick } = renderCategory();

    await user.click(screen.getByRole("button", { name: /برجر/ }));

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("UT-CATEGORY-04 gives the image the name of the category", () => {
    renderCategory();

    const image = screen.getByRole("img", { name: "برجر" });
    expect(image).toHaveAttribute("src", expect.stringContaining("crack-burgers"));
  });

  it("UT-CATEGORY-05 uses the primary ring and label for the active category", () => {
    renderCategory(true);

    expect(screen.getByText("برجر").className).toContain("text-primary");
    expect(screen.getByRole("img", { name: "برجر" }).parentElement?.className).toContain(
      "ring-primary",
    );
  });
});
