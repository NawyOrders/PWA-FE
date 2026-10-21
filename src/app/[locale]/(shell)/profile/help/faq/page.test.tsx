import { screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import HelpFaqPage from "./page";
import { renderWithProviders } from "../../../../../../../tests/utils/render";
import { faqItems } from "@/data/faq";
import { brand } from "@/lib/brand";

function renderFaq() {
  return renderWithProviders(<HelpFaqPage />, { route: "/ar/profile/help/faq" });
}

/**
 * A highlighted question is split into `<mark>` and `<span>` parts, and the
 * accessible name computation of the test tooling drops the space between
 * them. The matcher ignores the white spaces to stay independent of it.
 */
function looseName(text: string) {
  return (accessibleName: string) =>
    accessibleName.replace(/\s+/g, "") === text.replace(/\s+/g, "");
}

afterEach(() => {
  window.history.replaceState({}, "", "/");
});

describe("HelpFaqPage", () => {
  it("UT-PAGE-FAQ-01 loads the questions", async () => {
    renderFaq();

    expect(
      await screen.findByRole("button", { name: faqItems[0].question.ar }, { timeout: 3000 }),
    ).toBeInTheDocument();
  });

  it("UT-PAGE-FAQ-02 opens the first question by default", async () => {
    renderFaq();

    const header = await screen.findByRole(
      "button",
      { name: faqItems[0].question.ar },
      { timeout: 3000 },
    );

    await waitFor(() => expect(header).toHaveAttribute("aria-expanded", "true"));
  });

  it("UT-PAGE-FAQ-03 closes a question when it is opened again", async () => {
    const { user } = renderFaq();

    const header = await screen.findByRole(
      "button",
      { name: faqItems[0].question.ar },
      { timeout: 3000 },
    );
    await waitFor(() => expect(header).toHaveAttribute("aria-expanded", "true"));
    await user.click(header);

    await waitFor(() => expect(header).toHaveAttribute("aria-expanded", "false"));
  });

  it("UT-PAGE-FAQ-04 filters the questions with the search", async () => {
    const { user, t } = renderFaq();

    await screen.findByRole("button", { name: faqItems[0].question.ar }, { timeout: 3000 });
    await user.type(screen.getByRole("textbox", { name: t("faq.searchPlaceholder") }), "دفع");

    await waitFor(() =>
      expect(
        screen.queryByRole("button", { name: faqItems[3].question.ar }),
      ).not.toBeInTheDocument(),
    );
    expect(
      screen.getByRole("button", { name: looseName(faqItems[1].question.ar) }),
    ).toBeInTheDocument();
  });

  it("UT-PAGE-FAQ-05 shows the number of the results", async () => {
    const { user, t } = renderFaq();

    await screen.findByRole("button", { name: faqItems[0].question.ar }, { timeout: 3000 });
    await user.type(screen.getByRole("textbox", { name: t("faq.searchPlaceholder") }), "دفع");

    expect(await screen.findByText(t("faq.results", { n: 1 }))).toBeInTheDocument();
  });

  it("UT-PAGE-FAQ-06 shows a message when nothing matches", async () => {
    const { user, t } = renderFaq();

    await screen.findByRole("button", { name: faqItems[0].question.ar }, { timeout: 3000 });
    await user.type(screen.getByRole("textbox", { name: t("faq.searchPlaceholder") }), "زيرو");

    expect(await screen.findByText(t("faq.noResults"))).toBeInTheDocument();
  });

  it("UT-PAGE-FAQ-07 restores the list with the clear button", async () => {
    const { user, t } = renderFaq();

    await screen.findByRole("button", { name: faqItems[0].question.ar }, { timeout: 3000 });
    const input = screen.getByRole("textbox", { name: t("faq.searchPlaceholder") });
    await user.type(input, "دفع");
    await user.click(await screen.findByRole("button", { name: t("faq.clear") }));

    await waitFor(() =>
      expect(screen.getByRole("button", { name: faqItems[3].question.ar })).toBeInTheDocument(),
    );
  });

  it("UT-PAGE-FAQ-08 prefills the search from the query of the link", async () => {
    window.history.replaceState({}, "", "/ar/profile/help/faq?q=" + encodeURIComponent("دفع"));

    const { t } = renderFaq();

    expect(screen.getByRole("textbox", { name: t("faq.searchPlaceholder") })).toHaveValue("دفع");
  });

  it("UT-PAGE-FAQ-09 offers a phone link for the contact call", () => {
    const { t } = renderFaq();

    expect(screen.getByRole("link", { name: t("faq.cta") })).toHaveAttribute(
      "href",
      `tel:${brand.support.phone}`,
    );
  });

  it("UT-PAGE-FAQ-10 opens the contact modal on a fine pointer", async () => {
    const { user, t } = renderFaq();

    await user.click(screen.getByRole("link", { name: t("faq.cta") }));

    expect(screen.getByRole("dialog", { name: t("help.contactTitle") })).toBeInTheDocument();
  });
});
