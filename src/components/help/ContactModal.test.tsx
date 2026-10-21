import { screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ContactModal } from "./ContactModal";
import { renderWithProviders } from "../../../tests/utils/render";
import { brand } from "@/lib/brand";

function renderContact(onClose = vi.fn()) {
  const utils = renderWithProviders(<ContactModal onClose={onClose} />, {
    route: "/ar/profile/help",
  });
  return { ...utils, onClose };
}

describe("ContactModal", () => {
  it("UT-CONTACT-01 shows the title and the support hours", () => {
    const { t } = renderContact();

    expect(screen.getByRole("heading", { name: t("help.contactTitle") })).toBeInTheDocument();
    expect(screen.getByText(new RegExp("10:00 ص"))).toBeInTheDocument();
    expect(screen.getByText(new RegExp("11:00 م"))).toBeInTheDocument();
  });

  it("UT-CONTACT-02 links to the phone number", () => {
    renderContact();

    expect(screen.getByRole("link", { name: brand.support.phoneDisplay })).toHaveAttribute(
      "href",
      `tel:${brand.support.phone}`,
    );
  });

  it("UT-CONTACT-03 links to WhatsApp and to the email", () => {
    const { t } = renderContact();

    expect(screen.getByRole("link", { name: t("help.contactWhatsapp") })).toHaveAttribute(
      "href",
      brand.support.whatsapp,
    );
    expect(screen.getByRole("link", { name: new RegExp(t("help.contactEmail")) })).toHaveAttribute(
      "href",
      `mailto:${brand.support.email}`,
    );
  });

  it("UT-CONTACT-04 copies the phone number", async () => {
    const { user, t } = renderContact();

    await user.click(screen.getByRole("button", { name: t("help.contactCopy") }));

    await waitFor(async () =>
      expect(await navigator.clipboard.readText()).toBe(brand.support.phone),
    );
    expect(await screen.findByRole("button", { name: t("help.contactCopied") })).toBeInTheDocument();
  });

  it("UT-CONTACT-05 closes the modal", async () => {
    const { user, t, onClose } = renderContact();

    const dialog = screen.getByRole("dialog");
    const closeButton = screen
      .getAllByRole("button", { name: t("common.close") })
      .find((node) => dialog.contains(node));
    await user.click(closeButton as HTMLElement);

    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
