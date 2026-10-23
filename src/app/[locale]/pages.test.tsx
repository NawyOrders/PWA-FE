import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import AddressPage from "./address/page";
import DeliveryPage from "./delivery/page";
import PaymentPage from "./payment/page";
import RestLocationPage from "./restLocation/page";
import TrackingPage from "./tracking/page";
import PayConfirmationPage from "./payConfirmation/page";
import AboutNawyOrdersPage from "./(shell)/aboutNawyOrders/page";
import AboutRestaurantPage from "./(shell)/aboutRestaurant/page";
import AboutSpaceTechPage from "./(shell)/aboutSpaceTech/page";
import PrivacyPolicyPage from "./(shell)/privacyPolicy/page";
import TermsAndConditionsPage from "./(shell)/termsAndConditions/page";
import DataProcessingAgreementPage from "./(shell)/dataProcessingAgreement/page";
import ItemPage from "./item/[slug]/page";
import DevComponentsPage from "./dev/components/page";
import { notFound } from "next/navigation";
import { renderWithProviders } from "../../../tests/utils/render";
import { dictionaries } from "@/lib/i18n/dictionary";

const legacy = dictionaries.ar;

describe("route pages", () => {
  it("UT-ROUTE-01 renders the address route", () => {
    renderWithProviders(<AddressPage />, { route: "/ar/address" });

    expect(screen.getByRole("heading", { level: 1, name: legacy.addressTitle })).toBeInTheDocument();
  });

  it("UT-ROUTE-02 renders the delivery route", () => {
    renderWithProviders(<DeliveryPage />, { route: "/ar/delivery" });

    expect(
      screen.getByRole("heading", { level: 1, name: legacy.deliveryMethod }),
    ).toBeInTheDocument();
  });

  it("UT-ROUTE-03 renders the payment route", () => {
    renderWithProviders(<PaymentPage />, { route: "/ar/payment" });

    expect(
      screen.getByRole("heading", { level: 1, name: legacy.paymentTitle }),
    ).toBeInTheDocument();
  });

  it("UT-ROUTE-04 renders the branch route", () => {
    renderWithProviders(<RestLocationPage />, { route: "/ar/restLocation" });

    expect(
      screen.getByRole("heading", { level: 1, name: legacy.chooseBranch }),
    ).toBeInTheDocument();
  });

  it("UT-ROUTE-05 renders the tracking route", () => {
    renderWithProviders(<TrackingPage />, { route: "/ar/tracking" });

    expect(
      screen.getByRole("heading", { level: 1, name: legacy.trackingTitle }),
    ).toBeInTheDocument();
  });

  it("UT-ROUTE-06 renders the confirmation route", () => {
    renderWithProviders(<PayConfirmationPage />, { route: "/ar/payConfirmation" });

    expect(
      screen.getByRole("heading", { level: 1, name: legacy.orderReceived }),
    ).toBeInTheDocument();
  });

  it("UT-ROUTE-07 renders the about restaurant route", () => {
    const { t } = renderWithProviders(<AboutRestaurantPage />, { route: "/ar/aboutRestaurant" });

    expect(
      screen.getByRole("heading", { level: 1, name: t("aboutRestaurant.title") }),
    ).toBeInTheDocument();
  });

  it("UT-ROUTE-08 renders the about platform route", () => {
    const { t } = renderWithProviders(<AboutNawyOrdersPage />, { route: "/ar/aboutNawyOrders" });

    expect(
      screen.getByRole("heading", { level: 1, name: t("aboutNawyOrders.title") }),
    ).toBeInTheDocument();
  });

  it("UT-ROUTE-09 renders the about space tech route", () => {
    const { t } = renderWithProviders(<AboutSpaceTechPage />, { route: "/ar/aboutSpaceTech" });

    expect(
      screen.getByRole("heading", { level: 1, name: t("aboutSpaceTech.name") }),
    ).toBeInTheDocument();
  });

  it("UT-ROUTE-10 renders the privacy policy route", () => {
    const { t } = renderWithProviders(<PrivacyPolicyPage />, { route: "/ar/privacyPolicy" });

    expect(
      screen.getByRole("heading", { level: 1, name: t("privacyPolicy.title") }),
    ).toBeInTheDocument();
  });

  it("UT-ROUTE-11 renders the terms route", () => {
    const { t } = renderWithProviders(<TermsAndConditionsPage />, {
      route: "/ar/termsAndConditions",
    });

    expect(
      screen.getByRole("heading", { level: 1, name: t("aboutRestaurant.terms") }),
    ).toBeInTheDocument();
  });

  it("UT-ROUTE-12 renders the data processing route", () => {
    const { t } = renderWithProviders(<DataProcessingAgreementPage />, {
      route: "/ar/dataProcessingAgreement",
    });

    expect(
      screen.getByRole("heading", { level: 1, name: t("aboutRestaurant.dataProcessing") }),
    ).toBeInTheDocument();
  });

  it("UT-ROUTE-13 renders the item route for a known slug", async () => {
    const page = await ItemPage({ params: Promise.resolve({ slug: "crack-burger" }) });

    renderWithProviders(page, { route: "/ar/item/crack-burger" });

    expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();
  });

  it("UT-ROUTE-14 renders the default item for the burger-baladi slug", async () => {
    const page = await ItemPage({ params: Promise.resolve({ slug: "burger-baladi" }) });

    renderWithProviders(page, { route: "/ar/item/burger-baladi" });

    expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();
  });

  it("UT-ROUTE-15 calls notFound for an unknown slug", async () => {
    await ItemPage({ params: Promise.resolve({ slug: "not-a-dish" }) }).catch(() => undefined);

    expect(notFound).toHaveBeenCalled();
  });

  it("UT-ROUTE-16 renders the dev showcase outside production", () => {
    renderWithProviders(<DevComponentsPage />, { route: "/ar/dev/components" });

    expect(screen.getByRole("heading", { level: 1, name: "Components — AR" })).toBeInTheDocument();
  });
});
