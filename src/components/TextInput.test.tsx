import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useState } from "react";
import { TextInput } from "./TextInput";
import { renderWithProviders } from "../../tests/utils/render";

function renderInput(props: Partial<Parameters<typeof TextInput>[0]> = {}) {
  const onChange = vi.fn();
  const view = renderWithProviders(
    <TextInput label="الاسم" value="" onChange={onChange} {...props} />,
  );
  return { ...view, onChange };
}

function ControlledInput(props: Partial<Parameters<typeof TextInput>[0]> = {}) {
  const [value, setValue] = useState("");
  return (
    <TextInput
      label="الاسم"
      value={value}
      onChange={(next) => {
        setValue(next);
        props.onChange?.(next);
      }}
      {...props}
    />
  );
}

describe("TextInput", () => {
  it("UT-TEXTINPUT-01 labels the field", () => {
    renderInput();

    expect(screen.getByLabelText(/الاسم/)).toBeInTheDocument();
  });

  it("UT-TEXTINPUT-02 marks a required field", () => {
    renderInput({ required: true });

    expect(screen.getByLabelText(/الاسم/)).toBeRequired();
  });

  it("UT-TEXTINPUT-03 reports the typed value", async () => {
    const { user, onChange } = renderInput();

    await user.type(screen.getByLabelText(/الاسم/), "أ");

    expect(onChange).toHaveBeenCalledWith("أ");
  });

  it("UT-TEXTINPUT-04 keeps the value of the parent", async () => {
    const { user } = renderWithProviders(<ControlledInput />);

    const input = screen.getByLabelText(/الاسم/);
    await user.type(input, "أحمد");

    expect(input).toHaveValue("أحمد");
  });

  it("UT-TEXTINPUT-05 shows the placeholder", () => {
    renderInput({ placeholder: "اكتب الاسم" });

    expect(screen.getByPlaceholderText("اكتب الاسم")).toBeInTheDocument();
  });

  it("UT-TEXTINPUT-06 announces the error", () => {
    renderInput({ error: "الاسم مطلوب" });

    expect(screen.getByRole("alert")).toHaveTextContent("الاسم مطلوب");
  });

  it("UT-TEXTINPUT-07 marks the field as invalid", () => {
    renderInput({ error: "الاسم مطلوب" });

    expect(screen.getByLabelText(/الاسم/)).toHaveAttribute("aria-invalid", "true");
  });

  it("UT-TEXTINPUT-08 links the error to the field", () => {
    renderInput({ error: "الاسم مطلوب" });

    const input = screen.getByLabelText(/الاسم/);
    const error = screen.getByRole("alert");
    expect(input).toHaveAttribute("aria-describedby", error.id);
  });

  it("UT-TEXTINPUT-09 links the helper text to the field", () => {
    renderInput({ helper: "٣ حروف على الأقل" });

    const input = screen.getByLabelText(/الاسم/);
    expect(input).toHaveAttribute("aria-describedby", expect.stringContaining("helper"));
  });

  it("UT-TEXTINPUT-10 uses the requested type and input mode", () => {
    renderInput({ type: "tel", inputMode: "tel" });

    const input = screen.getByLabelText(/الاسم/);
    expect(input).toHaveAttribute("type", "tel");
    expect(input).toHaveAttribute("inputmode", "tel");
  });
});
