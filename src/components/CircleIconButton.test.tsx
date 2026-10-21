import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { CircleIconButton } from "./CircleIconButton";
import { renderWithProviders } from "../../tests/utils/render";

function renderButton(props: Partial<Parameters<typeof CircleIconButton>[0]> = {}) {
  const onClick = vi.fn();
  const view = renderWithProviders(
    <CircleIconButton label="أضف للسلة" onClick={onClick} {...props}>
      <span aria-hidden>+</span>
    </CircleIconButton>,
  );
  return { ...view, onClick };
}

describe("CircleIconButton", () => {
  it("UT-CIRCLE-01 takes its name from the label", () => {
    renderButton();

    expect(screen.getByRole("button", { name: "أضف للسلة" })).toBeInTheDocument();
  });

  it("UT-CIRCLE-02 handles the click", async () => {
    const { user, onClick } = renderButton();

    await user.click(screen.getByRole("button", { name: "أضف للسلة" }));

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("UT-CIRCLE-03 does nothing while it is disabled", async () => {
    const { user, onClick } = renderButton({ disabled: true });

    await user.click(screen.getByRole("button", { name: "أضف للسلة" }));

    expect(onClick).not.toHaveBeenCalled();
  });

  it("UT-CIRCLE-04 keeps the icon out of the accessible name", () => {
    renderButton();

    expect(screen.getByRole("button", { name: "أضف للسلة" })).toHaveTextContent("+");
  });

  it("UT-CIRCLE-05 is a button of the type button", () => {
    renderButton();

    expect(screen.getByRole("button")).toHaveAttribute("type", "button");
  });
});
