import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { FilterChip } from "./FilterChip";
import { renderWithProviders } from "../../tests/utils/render";

describe("FilterChip", () => {
  it("UT-CHIP-01 marks the selected chip as pressed", () => {
    renderWithProviders(
      <FilterChip active onClick={() => {}}>
        الكل
      </FilterChip>,
    );

    expect(screen.getByRole("button", { name: "الكل" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });

  it("UT-CHIP-02 marks the other chips as not pressed", () => {
    renderWithProviders(
      <FilterChip active={false} onClick={() => {}}>
        الكل
      </FilterChip>,
    );

    expect(screen.getByRole("button", { name: "الكل" })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
  });

  it("UT-CHIP-03 calls the click handler", async () => {
    const onClick = vi.fn();
    const { user } = renderWithProviders(
      <FilterChip active={false} onClick={onClick}>
        تم التوصيل
      </FilterChip>,
    );

    await user.click(screen.getByRole("button", { name: "تم التوصيل" }));

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("UT-CHIP-04 highlights the active chip with the primary gradient", () => {
    renderWithProviders(
      <FilterChip active onClick={() => {}}>
        الكل
      </FilterChip>,
    );

    expect(screen.getByRole("button", { name: "الكل" }).className).toContain(
      "bg-primary-gradient",
    );
  });
});
