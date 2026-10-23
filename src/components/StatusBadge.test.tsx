import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { StatusBadge } from "./StatusBadge";
import { renderWithProviders } from "../../tests/utils/render";

describe("StatusBadge", () => {
  it("UT-BADGE-01 shows the label of the status", () => {
    renderWithProviders(<StatusBadge status="delivered" label="تم التوصيل" />);

    expect(screen.getByText("تم التوصيل")).toBeInTheDocument();
  });

  it("UT-BADGE-02 uses the success tone for a delivered order", () => {
    renderWithProviders(<StatusBadge status="delivered" label="تم التوصيل" />);

    const badge = screen.getByText("تم التوصيل");
    expect(badge.className).toContain("bg-success-bg");
    expect(badge.className).toContain("text-success");
  });

  it("UT-BADGE-03 uses the danger tone for a cancelled order", () => {
    renderWithProviders(<StatusBadge status="cancelled" label="ملغي" />);

    const badge = screen.getByText("ملغي");
    expect(badge.className).toContain("bg-danger-bg");
    expect(badge.className).toContain("text-danger");
  });

  it("UT-BADGE-04 uses the primary tone for a processing order", () => {
    renderWithProviders(<StatusBadge status="processing" label="قيد التجهيز" />);

    const badge = screen.getByText("قيد التجهيز");
    expect(badge.className).toContain("bg-primary-tint");
    expect(badge.className).toContain("text-primary");
  });
});
