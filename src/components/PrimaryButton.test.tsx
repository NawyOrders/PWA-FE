import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { PrimaryButton } from "./PrimaryButton";
import { renderWithProviders } from "../../tests/utils/render";

function renderButton(props: Partial<Parameters<typeof PrimaryButton>[0]> = {}) {
  const onClick = vi.fn();
  const view = renderWithProviders(
    <PrimaryButton onClick={onClick} {...props}>
      حفظ
    </PrimaryButton>,
  );
  return { ...view, onClick };
}

describe("PrimaryButton", () => {
  it("UT-PBUTTON-01 shows its label", () => {
    renderButton();

    expect(screen.getByRole("button", { name: "حفظ" })).toBeInTheDocument();
  });

  it("UT-PBUTTON-02 handles the click", async () => {
    const { user, onClick } = renderButton();

    await user.click(screen.getByRole("button", { name: "حفظ" }));

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("UT-PBUTTON-03 does nothing while it is disabled", async () => {
    const { user, onClick } = renderButton({ disabled: true });

    await user.click(screen.getByRole("button", { name: "حفظ" }));

    expect(onClick).not.toHaveBeenCalled();
  });

  it("UT-PBUTTON-04 announces the loading state", () => {
    renderButton({ loading: true });

    const button = screen.getByRole("button");
    expect(button).toHaveAttribute("aria-busy", "true");
    expect(button).toBeDisabled();
  });

  it("UT-PBUTTON-05 hides the label while it is loading", () => {
    renderButton({ loading: true });

    expect(screen.queryByText("حفظ")).not.toBeInTheDocument();
  });

  it("UT-PBUTTON-06 keeps the icon out of the loading state", () => {
    renderButton({ loading: true, icon: <span>أيقونة</span> });

    expect(screen.queryByText("أيقونة")).not.toBeInTheDocument();
  });

  it("UT-PBUTTON-07 shows the icon next to the label", () => {
    renderButton({ icon: <span>أيقونة</span> });

    expect(screen.getByText("أيقونة")).toBeInTheDocument();
  });

  it("UT-PBUTTON-08 is a button of the type button", () => {
    renderButton();

    expect(screen.getByRole("button")).toHaveAttribute("type", "button");
  });
});
