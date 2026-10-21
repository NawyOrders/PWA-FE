import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ComponentsShowcase } from "./ComponentsShowcase";
import { renderWithProviders } from "../../../tests/utils/render";
import { useUiStore } from "@/store/uiStore";

describe("ComponentsShowcase", () => {
  it("UT-DEV-01 renders the showcase with its sections", () => {
    renderWithProviders(<ComponentsShowcase />, { route: "/ar/dev/components" });

    expect(screen.getByRole("heading", { level: 1, name: "Components — AR" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2, name: "Buttons" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2, name: "Overlays" })).toBeInTheDocument();
  });

  it("UT-DEV-02 opens the demo modal", async () => {
    const { user } = renderWithProviders(<ComponentsShowcase />, { route: "/ar/dev/components" });

    await user.click(screen.getByRole("button", { name: "Open modal" }));

    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("UT-DEV-03 opens the demo drawer", async () => {
    const { user } = renderWithProviders(<ComponentsShowcase />, { route: "/ar/dev/components" });

    await user.click(screen.getByRole("button", { name: "Open drawer" }));

    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("UT-DEV-04 shows a toast from the showcase", async () => {
    const { user, t } = renderWithProviders(<ComponentsShowcase />, {
      route: "/ar/dev/components",
    });

    await user.click(screen.getByRole("button", { name: "Show toast" }));

    expect(useUiStore.getState().toast?.message).toBe(t("toast.couponApplied"));
  });
});
