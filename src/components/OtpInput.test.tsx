import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { OtpInput } from "./OtpInput";
import { renderWithProviders } from "../../tests/utils/render";

function renderOtp(value = "", error = false) {
  const onChange = vi.fn();
  const view = renderWithProviders(
    <OtpInput value={value} onChange={onChange} error={error} ariaLabel="رمز التحقق" />,
  );
  return { ...view, onChange };
}

describe("OtpInput", () => {
  it("UT-OTP-01 renders six boxes with their own accessible names", () => {
    renderOtp();

    const boxes = screen.getAllByRole("textbox");
    expect(boxes).toHaveLength(6);
    expect(boxes[0]).toHaveAttribute("aria-label", "رمز التحقق 1");
    expect(boxes[5]).toHaveAttribute("aria-label", "رمز التحقق 6");
  });

  it("UT-OTP-02 marks the boxes as a one time code field", () => {
    renderOtp();

    for (const box of screen.getAllByRole("textbox")) {
      expect(box).toHaveAttribute("autocomplete", "one-time-code");
      expect(box).toHaveAttribute("inputmode", "numeric");
      expect(box).toHaveAttribute("maxlength", "1");
    }
  });

  it("UT-OTP-03 writes the typed digit and moves the focus to the next box", async () => {
    const { user, onChange } = renderOtp();

    await user.type(screen.getByLabelText("رمز التحقق 1"), "7");

    expect(onChange).toHaveBeenLastCalledWith("7");
    expect(screen.getByLabelText("رمز التحقق 2")).toHaveFocus();
  });

  it("UT-OTP-04 moves the focus back with Backspace on an empty box", async () => {
    const { user, onChange } = renderOtp("12");

    screen.getByLabelText("رمز التحقق 3").focus();
    await user.keyboard("{Backspace}");

    expect(onChange).toHaveBeenLastCalledWith("1");
    expect(screen.getByLabelText("رمز التحقق 2")).toHaveFocus();
  });

  it("UT-OTP-05 clears the current box with Backspace when it holds a digit", async () => {
    const { user, onChange } = renderOtp("12");

    screen.getByLabelText("رمز التحقق 2").focus();
    await user.keyboard("{Backspace}");

    expect(onChange).toHaveBeenLastCalledWith("1");
    expect(screen.getByLabelText("رمز التحقق 2")).toHaveFocus();
  });

  it("UT-OTP-06 fills every box on paste", async () => {
    const { user, onChange } = renderOtp();

    await user.click(screen.getByLabelText("رمز التحقق 1"));
    await user.paste("747123");

    expect(onChange).toHaveBeenLastCalledWith("747123");
  });

  it("UT-OTP-07 moves the focus with the arrow keys", async () => {
    const { user } = renderOtp();

    screen.getByLabelText("رمز التحقق 2").focus();
    await user.keyboard("{ArrowLeft}");
    expect(screen.getByLabelText("رمز التحقق 1")).toHaveFocus();

    await user.keyboard("{ArrowRight}");
    expect(screen.getByLabelText("رمز التحقق 2")).toHaveFocus();
  });

  it("UT-OTP-08 shakes the row and marks the boxes invalid when there is an error", () => {
    renderOtp("747", true);

    const group = screen.getByRole("group", { name: "رمز التحقق" });
    expect(group.className).toContain("animate-shake");
    for (const box of screen.getAllByRole("textbox")) {
      expect(box).toHaveAttribute("aria-invalid", "true");
    }
  });

  it("UT-OTP-09 highlights the boxes that hold a digit", () => {
    renderOtp("74");

    const filled = screen.getByLabelText("رمز التحقق 1");
    const empty = screen.getByLabelText("رمز التحقق 3");
    expect(filled.className).toContain("border-primary");
    expect(empty.className).toContain("border-line");
  });
});
