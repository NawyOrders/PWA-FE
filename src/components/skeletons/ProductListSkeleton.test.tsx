import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ProductListSkeleton } from "./ProductListSkeleton";
import { ProductCardSkeleton } from "./ProductCardSkeleton";

describe("skeletons", () => {
  it("UT-SKELETON-01 renders four placeholder cards by default", () => {
    const { container } = render(<ProductListSkeleton />);

    expect(container.querySelectorAll(".skeleton").length).toBeGreaterThan(0);
    expect(container.firstElementChild?.children).toHaveLength(4);
  });

  it("UT-SKELETON-02 honours the requested count", () => {
    const { container } = render(<ProductListSkeleton count={2} />);

    expect(container.firstElementChild?.children).toHaveLength(2);
  });

  it("UT-SKELETON-03 renders a single card placeholder", () => {
    const { container } = render(<ProductCardSkeleton />);

    expect(container.firstElementChild?.className).toContain("bg-surface");
  });
});
