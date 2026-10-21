import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { CartItemCard } from "./CartItemCard";
import { renderWithProviders } from "../../tests/utils/render";
import { makeDish } from "../../tests/factories";
import { formatPrice } from "@/lib/format";
import { dictionaries as legacyDictionaries } from "@/lib/i18n/dictionary";

function renderCard(overrides: Partial<Parameters<typeof makeDish>[0]> = {}, props = {}) {
  const dish = makeDish(overrides);
  const handlers = {
    onEdit: vi.fn(),
    onIncrement: vi.fn(),
    onDecrement: vi.fn(),
    onDelete: vi.fn(),
  };
  const view = renderWithProviders(
    <CartItemCard
      dish={dish}
      quantity={2}
      unitPrice={12000}
      addonIds={[]}
      note=""
      editLabel="تعديل"
      {...handlers}
      {...props}
    />,
  );
  return { ...view, dish, ...handlers };
}

describe("CartItemCard", () => {
  it("UT-CARTITEM-01 shows the name of the dish", () => {
    const { dish } = renderCard();

    expect(screen.getByRole("heading", { name: dish.name.ar })).toBeInTheDocument();
  });

  it("UT-CARTITEM-02 shows the price of the whole line", () => {
    renderCard({}, { quantity: 3, unitPrice: 12000 });

    expect(screen.getByText(formatPrice(36000, "ar"))).toBeInTheDocument();
  });

  it("UT-CARTITEM-03 increases the quantity", async () => {
    const { user, t, onIncrement } = renderCard();

    await user.click(screen.getByRole("button", { name: t("product.increase") }));

    expect(onIncrement).toHaveBeenCalledTimes(1);
  });

  it("UT-CARTITEM-04 decreases the quantity", async () => {
    const { user, t, onDecrement } = renderCard();

    await user.click(screen.getByRole("button", { name: t("product.decrease") }));

    expect(onDecrement).toHaveBeenCalledTimes(1);
  });

  it("UT-CARTITEM-05 edits the item", async () => {
    const { user, onEdit } = renderCard();

    await user.click(screen.getByRole("button", { name: "تعديل" }));

    expect(onEdit).toHaveBeenCalledTimes(1);
  });

  it("UT-CARTITEM-06 deletes the item", async () => {
    const { user, t, onDelete } = renderCard();

    await user.click(screen.getByRole("button", { name: t("common.delete") }));

    expect(onDelete).toHaveBeenCalledTimes(1);
  });

  it("UT-CARTITEM-07 lists the addons of the item", () => {
    renderCard({}, { addonIds: ["lettuce", "cheese"] });

    const details = screen.getByText(/lettuce|خس/).textContent ?? "";
    expect(details).toContain(legacyDictionaries.ar.addonLettuce);
    expect(details).toContain(legacyDictionaries.ar.addonCheese);
  });

  it("UT-CARTITEM-08 shows the note of the item", () => {
    renderCard({}, { note: "بدون بصل" });

    expect(screen.getByText(/بدون بصل/)).toBeInTheDocument();
  });

  it("UT-CARTITEM-09 hides the details when there is nothing to show", () => {
    renderCard();

    expect(screen.queryByText(/ملاحظات/)).not.toBeInTheDocument();
  });
});
