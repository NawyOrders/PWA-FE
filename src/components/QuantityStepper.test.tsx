import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { QuantityStepper } from "./QuantityStepper";
import { renderWithProviders } from "../../tests/utils/render";

function renderStepper(quantity = 2) {
  const onIncrement = vi.fn();
  const onDecrement = vi.fn();
  const view = renderWithProviders(
    <QuantityStepper
      quantity={quantity}
      onIncrement={onIncrement}
      onDecrement={onDecrement}
      decreaseLabel="إنقاص"
      increaseLabel="زيادة"
    />,
  );
  return { ...view, onIncrement, onDecrement };
}

describe("QuantityStepper", () => {
  it("UT-STEP-01 shows the current quantity", () => {
    renderStepper(3);

    expect(screen.getByText("3")).toBeInTheDocument();
  });

  it("UT-STEP-02 calls onIncrement when the increase button is pressed", async () => {
    const { user, onIncrement } = renderStepper();

    await user.click(screen.getByRole("button", { name: "زيادة" }));

    expect(onIncrement).toHaveBeenCalledTimes(1);
  });

  it("UT-STEP-03 calls onDecrement when the decrease button is pressed", async () => {
    const { user, onDecrement } = renderStepper();

    await user.click(screen.getByRole("button", { name: "إنقاص" }));

    expect(onDecrement).toHaveBeenCalledTimes(1);
  });

  it("UT-STEP-04 announces the quantity politely", () => {
    renderStepper(4);

    const live = screen.getByText("4");
    expect(live).toHaveAttribute("aria-live", "polite");
  });

  it("UT-STEP-05 uses the labels it receives for the accessible names", () => {
    renderStepper();

    expect(screen.getByRole("button", { name: "زيادة" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "إنقاص" })).toBeInTheDocument();
  });
});
