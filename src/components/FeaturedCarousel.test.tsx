import { screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { FeaturedCarousel } from "./FeaturedCarousel";
import { renderWithProviders } from "../../tests/utils/render";
import { makeDish } from "../../tests/factories";
import { formatPrice } from "@/lib/format";
import type { Locale } from "@/lib/i18n/types";

const dishes = [
  makeDish({ id: "first", name: { ar: "الطبق الأول", en: "First dish" }, image: "crack-burgers" }),
  makeDish({ id: "second", name: { ar: "الطبق الثاني", en: "Second dish" }, image: "gourmet-burger" }),
  makeDish({ id: "third", name: { ar: "الطبق الثالث", en: "Third dish" }, image: "classic-burger" }),
];

function renderCarousel(list = dishes, locale: Locale = "ar") {
  const onAdd = vi.fn();
  const view = renderWithProviders(<FeaturedCarousel dishes={list} onAdd={onAdd} />, { locale });
  return { ...view, onAdd };
}

describe("FeaturedCarousel", () => {
  it("UT-CAROUSEL-01 shows the first dish at the start", () => {
    renderCarousel();

    expect(screen.getByRole("heading", { level: 2, name: dishes[0].name.ar })).toBeInTheDocument();
  });

  it("UT-CAROUSEL-02 moves to the next dish with the next button", async () => {
    const { user, t } = renderCarousel();

    await user.click(screen.getByRole("button", { name: t("common.next") }));

    expect(screen.getByRole("heading", { level: 2, name: dishes[1].name.ar })).toBeInTheDocument();
  });

  it("UT-CAROUSEL-03 wraps around at the end of the list", async () => {
    const { user, t } = renderCarousel();

    await user.click(screen.getByRole("button", { name: t("common.next") }));
    await user.click(screen.getByRole("button", { name: t("common.next") }));
    await user.click(screen.getByRole("button", { name: t("common.next") }));

    expect(screen.getByRole("heading", { level: 2, name: dishes[0].name.ar })).toBeInTheDocument();
  });

  it("UT-CAROUSEL-04 jumps to a slide with the dots", async () => {
    const { user, t } = renderCarousel();

    await user.click(screen.getByRole("button", { name: t("carousel.goTo").replace("{index}", "3") }));

    expect(screen.getByRole("heading", { level: 2, name: dishes[2].name.ar })).toBeInTheDocument();
  });

  it("UT-CAROUSEL-05 marks the current dot", async () => {
    const { user, t } = renderCarousel();

    await user.click(screen.getByRole("button", { name: t("carousel.goTo").replace("{index}", "2") }));

    const dots = screen.getAllByRole("button", { name: /goTo|الى|إلى/ });
    const current = dots.filter((dot) => dot.getAttribute("aria-current") === "true");
    expect(current).toHaveLength(1);
  });

  it("UT-CAROUSEL-06 adds the visible dish to the cart", async () => {
    const { user, t, onAdd } = renderCarousel();

    await user.click(screen.getByRole("button", { name: t("product.addToCart") }));

    expect(onAdd).toHaveBeenCalledWith(dishes[0]);
  });

  it("UT-CAROUSEL-07 shows the price of the visible dish", async () => {
    const { user, t } = renderCarousel([dishes[0], { ...dishes[1], price: 9500 }]);

    await user.click(screen.getByRole("button", { name: t("common.next") }));

    expect(screen.getByText(formatPrice(9500, "ar"))).toBeInTheDocument();
  });

  it("UT-CAROUSEL-08 renders nothing without dishes", () => {
    const { container } = renderCarousel([]);

    expect(container).toBeEmptyDOMElement();
  });

  it("UT-CAROUSEL-09 is announced as a carousel", () => {
    const { t } = renderCarousel();

    const region = screen.getByRole("region", { name: t("home.featured") });
    expect(region).toHaveAttribute("aria-roledescription", "carousel");
  });

  it("UT-CAROUSEL-10 links the slide to the item page", () => {
    renderCarousel();

    const links = screen.getAllByRole("link", { name: dishes[0].name.ar });
    expect(links[0]).toHaveAttribute("href", `/ar/item/${dishes[0].id}`);
  });

  it("UT-CAROUSEL-11 keeps the slide in the carousel region", () => {
    const { t } = renderCarousel();

    const region = screen.getByRole("region", { name: t("home.featured") });
    expect(within(region).getByRole("heading", { level: 2 })).toBeInTheDocument();
  });
});
