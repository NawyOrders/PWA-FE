import { useState } from "react";
import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { PhoneInput } from "./PhoneInput";
import { renderWithProviders } from "../../tests/utils/render";

function ControlledPhoneInput({
  initial = "",
  onChange,
  onSend,
  ...rest
}: Partial<React.ComponentProps<typeof PhoneInput>> & {
  initial?: string;
  onChange?: (value: string) => void;
  onSend?: () => void;
}) {
  const [value, setValue] = useState(initial);
  return (
    <PhoneInput
      value={value}
      onChange={(next) => {
        setValue(next);
        onChange?.(next);
      }}
      onSend={() => onSend?.()}
      sendLabel="إرسال"
      ariaLabel="رقم الهاتف"
      {...rest}
    />
  );
}

function renderPhone(props: Partial<React.ComponentProps<typeof ControlledPhoneInput>> = {}) {
  const onChange = vi.fn();
  const onSend = vi.fn();
  const view = renderWithProviders(
    <ControlledPhoneInput {...props} onChange={onChange} onSend={onSend} />,
  );
  return { ...view, onChange, onSend };
}

describe("PhoneInput", () => {
  it("UT-PHONE-01 keeps the send button disabled until there are ten digits", () => {
    renderPhone({ initial: "12345" });

    expect(screen.getByRole("button", { name: "إرسال" })).toBeDisabled();
  });

  it("UT-PHONE-02 enables the send button with a complete number", () => {
    renderPhone({ initial: "1234567890" });

    expect(screen.getByRole("button", { name: "إرسال" })).toBeEnabled();
  });

  it("UT-PHONE-03 calls onSend when the send button is pressed", async () => {
    const { user, onSend } = renderPhone({ initial: "1234567890" });

    await user.click(screen.getByRole("button", { name: "إرسال" }));

    expect(onSend).toHaveBeenCalledTimes(1);
  });

  it("UT-PHONE-04 converts Arabic-Indic digits to Latin digits", async () => {
    const { user, onChange } = renderPhone();

    await user.type(screen.getByLabelText("رقم الهاتف"), "٠١٢");

    expect(onChange).toHaveBeenLastCalledWith("012");
  });

  it("UT-PHONE-05 keeps the value at ten digits", async () => {
    const { user, onChange } = renderPhone();

    await user.type(screen.getByLabelText("رقم الهاتف"), "12345678901234");

    expect(onChange).toHaveBeenLastCalledWith("1234567890");
    expect(screen.getByLabelText("رقم الهاتف")).toHaveValue("1234567890");
  });

  it("UT-PHONE-06 marks the input as a phone field in Latin direction", () => {
    renderPhone();

    const input = screen.getByLabelText("رقم الهاتف");
    expect(input).toHaveAttribute("dir", "ltr");
    expect(input).toHaveAttribute("inputmode", "numeric");
    expect(input).toHaveAttribute("autocomplete", "tel-national");
  });

  it("UT-PHONE-07 shows the error message and links it to the input", () => {
    renderPhone({ initial: "123", error: "رقم غير صحيح" });

    const input = screen.getByLabelText("رقم الهاتف");
    expect(input).toHaveAttribute("aria-invalid", "true");
    const error = screen.getByText("رقم غير صحيح");
    expect(input).toHaveAttribute("aria-describedby", error.id);
  });

  it("UT-PHONE-08 shows the countdown politely", () => {
    renderPhone({ countdown: 59, countdownLabel: "59 ثانية" });

    const countdown = screen.getByText("59 ثانية");
    expect(countdown).toHaveAttribute("aria-live", "polite");
  });
});
