import { useState } from "react";
import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { SearchPill } from "./SearchPill";
import { renderWithProviders } from "../../tests/utils/render";

function ControlledSearchPill({
  initial = "",
  onChange,
  onSubmit,
  ...rest
}: Partial<React.ComponentProps<typeof SearchPill>> & {
  initial?: string;
  onChange?: (value: string) => void;
  onSubmit?: () => void;
}) {
  const [value, setValue] = useState(initial);
  return (
    <SearchPill
      value={value}
      onChange={(next) => {
        setValue(next);
        onChange?.(next);
      }}
      onSubmit={() => onSubmit?.()}
      placeholder="ابحث عن أكلة"
      buttonLabel="بحث"
      clearLabel="مسح"
      {...rest}
    />
  );
}

function renderSearch(props: Partial<React.ComponentProps<typeof SearchPill>> = {}) {
  const onChange = vi.fn();
  const onSubmit = vi.fn();
  const view = renderWithProviders(
    <ControlledSearchPill {...props} onChange={onChange} onSubmit={onSubmit} />,
  );
  return { ...view, onChange, onSubmit };
}

describe("SearchPill", () => {
  it("UT-SEARCH-01 renders a search landmark with the placeholder as the name", () => {
    renderSearch();

    expect(screen.getByRole("search")).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: "ابحث عن أكلة" })).toBeInTheDocument();
  });

  it("UT-SEARCH-02 has no clear button while the field is empty", () => {
    renderSearch();

    expect(screen.queryByRole("button", { name: "مسح" })).not.toBeInTheDocument();
  });

  it("UT-SEARCH-03 clears the value with the clear button", async () => {
    const { user, onChange } = renderSearch({ value: "برجر" });

    await user.click(screen.getByRole("button", { name: "مسح" }));

    expect(onChange).toHaveBeenCalledWith("");
  });

  it("UT-SEARCH-04 submits with the button", async () => {
    const { user, onSubmit } = renderSearch({ value: "برجر" });

    await user.click(screen.getByRole("button", { name: "بحث" }));

    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it("UT-SEARCH-05 submits with the Enter key", async () => {
    const { user, onSubmit } = renderSearch({ value: "برجر" });

    await user.click(screen.getByRole("textbox", { name: "ابحث عن أكلة" }));
    await user.keyboard("{Enter}");

    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it("UT-SEARCH-06 reports the typed text", async () => {
    const { user, onChange } = renderSearch();

    await user.type(screen.getByRole("textbox", { name: "ابحث عن أكلة" }), "برجر");

    expect(onChange).toHaveBeenLastCalledWith("برجر");
  });

  it("UT-SEARCH-07 uses an icon button in the large variant", () => {
    renderSearch({ size: "lg" });

    const submit = screen.getByRole("button", { name: "بحث" });
    expect(submit).toHaveAttribute("type", "submit");
    expect(screen.getByRole("textbox", { name: "ابحث عن أكلة" })).toBeInTheDocument();
  });
});
