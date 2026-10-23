import { describe, expect, it } from "vitest";
import { renderWithProviders, LOCALES } from "../../utils/render";
import { expectNoAxeViolations } from "../../utils/axe";
import { dishes } from "@/data/dishes";
import { makeUser } from "../../factories";
import HomePage from "@/app/[locale]/(shell)/page";
import MenuPage from "@/app/[locale]/(shell)/menu/page";
import FavoritesPage from "@/app/[locale]/(shell)/favorites/page";
import CartPage from "@/app/[locale]/(shell)/cart/page";
import OrdersPage from "@/app/[locale]/(shell)/orders/page";
import ProfilePage from "@/app/[locale]/(shell)/profile/page";
import AddressesPage from "@/app/[locale]/(shell)/profile/addresses/page";
import HelpPage from "@/app/[locale]/(shell)/profile/help/page";
import HelpFaqPage from "@/app/[locale]/(shell)/profile/help/faq/page";
import FeedbackPage from "@/app/[locale]/(shell)/profile/help/feedback/page";
import PersonalInfoPage from "@/app/[locale]/(shell)/profile/personal-info/page";
import LoginPage from "@/app/[locale]/login/page";
import SplashPage from "@/app/[locale]/splash/page";
import OfflinePage from "@/app/[locale]/offline/page";

/**
 * The axe sweep of the screens (TESTING.md section 8.3).
 *
 * The screens are rendered with a populated store so the empty state does not
 * hide the content of the real screens.
 */
const screens: Array<{ name: string; route: string; render: () => React.ReactElement }> = [
  { name: "home", route: "/ar", render: () => <HomePage /> },
  { name: "menu", route: "/ar/menu", render: () => <MenuPage /> },
  { name: "favorites", route: "/ar/favorites", render: () => <FavoritesPage /> },
  { name: "cart", route: "/ar/cart", render: () => <CartPage /> },
  { name: "orders", route: "/ar/orders", render: () => <OrdersPage /> },
  { name: "profile", route: "/ar/profile", render: () => <ProfilePage /> },
  { name: "addresses", route: "/ar/profile/addresses", render: () => <AddressesPage /> },
  { name: "help", route: "/ar/profile/help", render: () => <HelpPage /> },
  { name: "faq", route: "/ar/profile/help/faq", render: () => <HelpFaqPage /> },
  { name: "feedback", route: "/ar/profile/help/feedback", render: () => <FeedbackPage /> },
  { name: "personal-info", route: "/ar/profile/personal-info", render: () => <PersonalInfoPage /> },
  { name: "login", route: "/ar/login", render: () => <LoginPage /> },
  { name: "splash", route: "/ar/splash", render: () => <SplashPage /> },
  { name: "offline", route: "/ar/offline", render: () => <OfflinePage /> },
];

const stores = {
  auth: { isLoggedIn: true, user: makeUser({ name: "محمد" }) },
  cart: {
    items: [
      {
        dishId: dishes[0].id,
        quantity: 2,
        unitPrice: dishes[0].price,
        addonIds: [],
        note: "",
      },
    ],
  },
  favorites: { ids: [dishes[0].id, dishes[1].id] },
};

describe("axe: the screens", () => {
  for (const [locale, dir] of LOCALES) {
    for (const screen of screens) {
      it(`UT-A11Y-SCREEN-${screen.name.toUpperCase()}-${locale.toUpperCase()} has no violation in ${dir}`, async () => {
        const { container } = renderWithProviders(screen.render(), {
          locale,
          route: screen.route.replace("/ar", `/${locale}`),
          stores,
        });

        const summary = await expectNoAxeViolations(container);

        expect(summary.violations).toEqual([]);
      });
    }
  }
});


