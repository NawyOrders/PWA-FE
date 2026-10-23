import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import HomePage from "./page";
import { renderWithProviders, type Locale } from "../../../../tests/utils/render";
import { useCartStore } from "@/store/cartStore";
import { useUiStore } from "@/store/uiStore";
import { categories } from "@/data/categories";
import { dishes } from "@/data/dishes";

function renderHome(stores = {}, locale: Locale = "ar") {
  return renderWithProviders(<HomePage />, {
    locale,
    route: `/${locale}`,
    stores: { auth: { isLoggedIn: false, user: null }, ...stores },
  });
}

describe("HomePage", () => {
  it("UT-PAGE-HOME-01 shows the brand and the greeting", () => {
    const { t } = renderHome();

    expect(screen.getAllByText(t("home.greeting")).length).toBeGreaterThan(0);
    // The mobile header and the desktop block each render a level one heading.
    expect(screen.getAllByRole("heading", { level: 1 }).length).toBe(2);
  });

  it("UT-PAGE-HOME-02 shows the featured dishes", () => {
    const { t } = renderHome();

    expect(screen.getByRole("region", { name: t("home.featured") })).toBeInTheDocument();
  });

  it("UT-PAGE-HOME-03 shows every category", () => {
    const { t } = renderHome();

    for (const category of categories) {
      expect(
        screen.getByRole("button", { name: new RegExp(t(`categories.${category.id}`)) }),
      ).toBeInTheDocument();
    }
  });

  it("UT-PAGE-HOME-04 filters the dishes with a category", async () => {
    const { user, t } = renderHome();

    await user.click(
      screen.getByRole("button", { name: new RegExp(t("categories.burger")) }),
    );

    expect(screen.getByRole("link", { name: dishes[2].name.ar })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: dishes[6].name.ar })).not.toBeInTheDocument();
  });

  it("UT-PAGE-HOME-05 marks the selected category as pressed", async () => {
    const { user, t } = renderHome();

    const category = screen.getByRole("button", { name: new RegExp(t("categories.pizza")) });
    expect(category).toHaveAttribute("aria-pressed", "false");

    await user.click(category);

    expect(category).toHaveAttribute("aria-pressed", "true");
  });

  it("UT-PAGE-HOME-06 filters the dishes with the search", async () => {
    const { user, t } = renderHome();

    await user.type(screen.getByRole("textbox", { name: t("common.search") }), "برجر");

    expect(screen.getAllByRole("link", { name: dishes[0].name.ar }).length).toBeGreaterThan(0);
    expect(screen.queryByText(t("home.noResults"))).not.toBeInTheDocument();
  });

  it("UT-PAGE-HOME-07 shows the empty state when nothing matches", async () => {
    const { user, t } = renderHome();

    await user.type(screen.getByRole("textbox", { name: t("common.search") }), "زززز");

    expect(await screen.findByText(t("home.noResults"))).toBeInTheDocument();
  });

  it("UT-PAGE-HOME-08 adds a dish to the cart", async () => {
    const { user, t } = renderHome();

    const addButtons = screen.getAllByRole("button", { name: t("product.addToCart") });
    await user.click(addButtons[0]);

    expect(useCartStore.getState().items).toHaveLength(1);
    expect(useUiStore.getState().toast?.message).toBe(t("toast.addedToCart"));
  });

  it("UT-PAGE-HOME-09 asks a guest to log in before a favorite", async () => {
    const { user, t } = renderHome();

    await user.click(screen.getAllByRole("button", { name: t("product.favorite") })[0]);

    expect(useUiStore.getState().loginModalOpen).toBe(true);
  });

  it("UT-PAGE-HOME-10 favorites a dish for a logged in user", async () => {
    const { user, t } = renderHome({ auth: { isLoggedIn: true, user: null } });

    await user.click(screen.getAllByRole("button", { name: t("product.favorite") })[0]);

    expect(useUiStore.getState().loginModalOpen).toBe(false);
  });

  it("UT-PAGE-HOME-11 links to the menu", () => {
    const { t } = renderHome();

    expect(screen.getByRole("link", { name: t("common.viewAll") })).toHaveAttribute(
      "href",
      "/ar/menu",
    );
  });

  it("UT-PAGE-HOME-12 opens the drawer from the header", async () => {
    const { user, t } = renderHome();

    await user.click(screen.getByRole("button", { name: t("common.menu") }));

    expect(useUiStore.getState().drawerOpen).toBe(true);
  });

  it("UT-PAGE-HOME-13 finds an Arabic-named dish on the English site", async () => {
    const { user, t } = renderHome({}, "en");

    await user.type(screen.getByRole("textbox", { name: t("common.search") }), "شاورما دجاج");

    expect(screen.getAllByRole("link", { name: dishes[5].name.en }).length).toBeGreaterThan(0);
    expect(screen.queryByText(t("home.noResults"))).not.toBeInTheDocument();
  });

  it("UT-PAGE-HOME-14 finds an English-named dish on the Arabic site", async () => {
    const { user, t } = renderHome();

    await user.type(screen.getByRole("textbox", { name: t("common.search") }), "pasta");

    expect(screen.getAllByRole("link", { name: dishes[8].name.ar }).length).toBeGreaterThan(0);
  });

  it("UT-PAGE-HOME-15 normalizes Arabic variants and diacritics", async () => {
    const { user, t } = renderHome();

    await user.type(screen.getByRole("textbox", { name: t("common.search") }), "طازجه");

    expect(screen.getAllByRole("link", { name: dishes[3].name.ar }).length).toBeGreaterThan(0);
  });

  it("UT-PAGE-HOME-16 matches the category name in either language", async () => {
    const { user, t } = renderHome({}, "en");

    await user.type(screen.getByRole("textbox", { name: t("common.search") }), "حلويات");

    expect(screen.getAllByRole("link", { name: dishes[10].name.en }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole("link", { name: dishes[12].name.en }).length).toBeGreaterThan(0);
  });
});
