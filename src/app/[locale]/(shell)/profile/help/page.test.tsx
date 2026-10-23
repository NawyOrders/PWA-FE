import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import HelpPage from "./page";
import { renderWithProviders } from "../../../../../../tests/utils/render";
import { brand } from "@/lib/brand";

function renderHelp() {
  return renderWithProviders(<HelpPage />, { route: "/ar/profile/help" });
}

describe("HelpPage", () => {
  it("UT-PAGE-HELP-01 shows the four help options", () => {
    const { t } = renderHelp();

    expect(
      screen.getByRole("link", { name: `${t("help.faq")}، ${t("help.faqSub")}` }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: `${t("help.feedback")}، ${t("help.feedbackSub")}` }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: `${t("help.report")}، ${t("help.reportSub")}` }),
    ).toBeInTheDocument();
  });

  it("UT-PAGE-HELP-02 links the questions to the faq screen", () => {
    const { t } = renderHelp();

    expect(
      screen.getByRole("link", { name: `${t("help.faq")}، ${t("help.faqSub")}` }),
    ).toHaveAttribute("href", "/ar/profile/help/faq");
  });

  it("UT-PAGE-HELP-03 links the feedback to the feedback screen", () => {
    const { t } = renderHelp();

    expect(
      screen.getByRole("link", { name: `${t("help.feedback")}، ${t("help.feedbackSub")}` }),
    ).toHaveAttribute("href", "/ar/profile/help/feedback");
  });

  it("UT-PAGE-HELP-04 shows the live support status on the chat card", () => {
    const { t } = renderHelp();

    expect(
      screen.getByRole("button", { name: `${t("help.chat")}، ${t("help.chatSub")}` }),
    ).toBeInTheDocument();
  });

  it("UT-PAGE-HELP-05 opens the chat sheet", async () => {
    const { user, t } = renderHelp();

    await user.click(screen.getByRole("button", { name: `${t("help.chat")}، ${t("help.chatSub")}` }));

    expect(screen.getByRole("dialog", { name: t("help.chatTitle") })).toBeInTheDocument();
  });

  it("UT-PAGE-HELP-06 opens the report sheet", async () => {
    const { user, t } = renderHelp();

    await user.click(screen.getByRole("button", { name: `${t("help.report")}، ${t("help.reportSub")}` }));

    expect(screen.getByRole("dialog", { name: t("help.reportTitle") })).toBeInTheDocument();
  });

  it("UT-PAGE-HELP-07 offers a phone link for the contact call", () => {
    const { t } = renderHelp();

    const cta = screen.getByRole("link", { name: t("help.contactCta") });

    expect(cta).toHaveAttribute("href", `tel:${brand.support.phone}`);
  });

  it("UT-PAGE-HELP-08 opens the contact modal on a fine pointer", async () => {
    const { user, t } = renderHelp();

    await user.click(screen.getByRole("link", { name: t("help.contactCta") }));

    expect(screen.getByRole("dialog", { name: t("help.contactTitle") })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: new RegExp(t("help.contactEmail")) })).toHaveAttribute(
      "href",
      `mailto:${brand.support.email}`,
    );
  });
});
