import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { LanguageToggle } from "./LanguageToggle";
import { renderWithProviders } from "../../tests/utils/render";

function renderToggle(locale: "ar" | "en" = "ar") {
  const onChange = vi.fn();
  const view = renderWithProviders(
    <LanguageToggle label="اللغة" locale={locale} onChange={onChange} />,
  );
  return { ...view, onChange };
}

describe("LanguageToggle", () => {
  it("UT-LANG-01 shows the label", () => {
    renderToggle();

    expect(screen.getByText("اللغة")).toBeInTheDocument();
  });

  it("UT-LANG-02 marks the active language as pressed", () => {
    renderToggle("ar");

    expect(screen.getByRole("button", { name: "عربي" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: "ENG" })).toHaveAttribute("aria-pressed", "false");
  });

  it("UT-LANG-03 switches to English", async () => {
    const { user, onChange } = renderToggle("ar");

    await user.click(screen.getByRole("button", { name: "ENG" }));

    expect(onChange).toHaveBeenCalledWith("en");
  });

  it("UT-LANG-04 switches to Arabic", async () => {
    const { user, onChange } = renderToggle("en");

    await user.click(screen.getByRole("button", { name: "عربي" }));

    expect(onChange).toHaveBeenCalledWith("ar");
  });
});
