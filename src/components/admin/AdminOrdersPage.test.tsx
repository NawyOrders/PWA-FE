import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AdminOrdersPage } from "./AdminOrdersPage";
import { renderWithProviders } from "../../../tests/utils/render";
import { dictionaries } from "@/lib/i18n/dictionary";
import { orders } from "@/data/orders";

const t = dictionaries.ar;

describe("AdminOrdersPage", () => {
  it("UT-ADMIN-01 lists accepted orders with a print control", () => {
    renderWithProviders(<AdminOrdersPage />, {
      route: "/ar/admin/orders",
      stores: { ui: { hydrated: true } },
    });

    expect(screen.getByRole("heading", { level: 1, name: t.adminOrdersTitle })).toBeInTheDocument();
    expect(screen.getAllByRole("heading", { level: 2 })).toHaveLength(orders.length);
    expect(screen.getByText(`#${orders[0].number}`)).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: t.printSlip }).length).toBeGreaterThan(0);
  });

  it("UT-ADMIN-02 shows the empty state when there are no orders", () => {
    renderWithProviders(<AdminOrdersPage />, {
      route: "/ar/admin/orders",
      stores: { ui: { hydrated: true }, orders: { orders: [] } },
    });

    expect(screen.getByText(t.printNoOrders)).toBeInTheDocument();
  });
});
