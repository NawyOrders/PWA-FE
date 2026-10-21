import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { SettingsScreen } from "./SettingsScreen";
import { renderWithProviders } from "../../tests/utils/render";

function renderSettings(props: Partial<React.ComponentProps<typeof SettingsScreen>> = {}) {
  const onBack = vi.fn();
  const view = renderWithProviders(
    <SettingsScreen
      title="العناوين"
      subtitle="ادارة عناوين التوصيل الخاصة بك"
      backLabel="رجوع"
      onBack={onBack}
      {...props}
    >
      <p>المحتوى</p>
    </SettingsScreen>,
  );
  return { ...view, onBack };
}

describe("SettingsScreen", () => {
  it("UT-SETTINGS-01 shows the title as the only heading of the screen", () => {
    renderSettings();

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("العناوين");
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
  });

  it("UT-SETTINGS-02 shows the subtitle", () => {
    renderSettings();

    expect(screen.getByText("ادارة عناوين التوصيل الخاصة بك")).toBeInTheDocument();
  });

  it("UT-SETTINGS-03 goes back with the back button", async () => {
    const { user, onBack } = renderSettings();

    await user.click(screen.getByRole("button", { name: "رجوع" }));

    expect(onBack).toHaveBeenCalledTimes(1);
  });

  it("UT-SETTINGS-04 renders the call to action slot", () => {
    renderSettings({ cta: <button type="button">حفظ</button> });

    expect(screen.getByRole("button", { name: "حفظ" })).toBeInTheDocument();
  });

  it("UT-SETTINGS-05 has no call to action slot when there is none", () => {
    renderSettings();

    expect(screen.queryByRole("button", { name: "حفظ" })).not.toBeInTheDocument();
  });
});
