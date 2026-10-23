import { screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ProductCard } from "./ProductCard";
import { renderWithProviders } from "../../tests/utils/render";
import { makeDish } from "../../tests/factories";
import { formatPrice } from "@/lib/format";
import type { Locale } from "@/lib/i18n/types";

function renderCard(
  overrides: Parameters<typeof makeDish>[0] = {},
  isFavorite = false,
  locale: Locale = "ar",
) {
  const dish = makeDish(overrides);
  const onAdd = vi.fn();
  const onToggleFavorite = vi.fn();
  const view = renderWithProviders(
    <ProductCard
      dish={dish}
      isFavorite={isFavorite}
      onAdd={onAdd}
      onToggleFavorite={onToggleFavorite}
    />,
    { locale },
  );
  return { ...view, dish, onAdd, onToggleFavorite };
}

describe("ProductCard", () => {
  it("UT-CARD-01 shows the name and the description of the dish", () => {
    const { dish, locale } = renderCard();

    expect(screen.getByRole("heading", { name: dish.name[locale] })).toBeInTheDocument();
    expect(screen.getByText(dish.description[locale])).toBeInTheDocument();
  });

  it("UT-CARD-02 shows the price in the currency of the locale", () => {
    renderCard({ price: 12000 });

    expect(screen.getByText(formatPrice(12000, "ar"))).toBeInTheDocument();
  });

  it("UT-CARD-03 strikes the old price through", () => {
    renderCard({ price: 12000, oldPrice: 15000 });

    expect(screen.getByText(formatPrice(15000, "ar"))).toHaveClass("line-through");
  });

  it("UT-CARD-04 hides the old price when there is none", () => {
    renderCard({ price: 12000 });

    expect(screen.queryByText(/line-through/)).not.toBeInTheDocument();
  });

  it("UT-CARD-05 links to the localized page of the dish", () => {
    const { dish } = renderCard();

    const link = screen.getByRole("link", { name: dish.name.ar });
    expect(link).toHaveAttribute("href", `/ar/item/${dish.id}`);
  });

  it("UT-CARD-06 adds the dish to the cart", async () => {
    const { user, t, onAdd } = renderCard();

    await user.click(screen.getByRole("button", { name: t("product.addToCart") }));

    expect(onAdd).toHaveBeenCalledTimes(1);
  });

  it("UT-CARD-07 toggles the favorite state", async () => {
    const { user, t, onToggleFavorite } = renderCard();

    await user.click(screen.getByRole("button", { name: t("product.favorite") }));

    expect(onToggleFavorite).toHaveBeenCalledTimes(1);
  });

  it("UT-CARD-08 offers to remove a favorite that is already set", () => {
    const { t } = renderCard({}, true);

    expect(screen.getByRole("button", { name: t("product.unfavorite") })).toBeInTheDocument();
  });

  it("UT-CARD-09 shows a decorative image and names the card link after the dish", () => {
    const { dish, container } = renderCard();

    const image = container.querySelector("img");
    expect(image).toHaveAttribute("src", expect.stringContaining("crack-burgers"));
    expect(image).toHaveAttribute("alt", "");
    expect(screen.getByRole("link", { name: dish.name.ar })).toBeInTheDocument();
  });

  it("UT-CARD-10 keeps the buttons inside the card", () => {
    const { t } = renderCard();

    const article = screen.getByRole("article");
    expect(within(article).getByRole("button", { name: t("product.addToCart") })).toBeInTheDocument();
  });

  it("UT-CARD-11 uses the English copy in the English locale", () => {
    const { dish, t } = renderCard({}, false, "en");

    expect(screen.getByRole("heading", { name: dish.name.en })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: t("product.addToCart") })).toBeInTheDocument();
  });
});
