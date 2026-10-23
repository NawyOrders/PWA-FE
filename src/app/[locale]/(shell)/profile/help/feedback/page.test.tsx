import { screen, waitFor, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import FeedbackPage from "./page";
import { renderWithProviders } from "../../../../../../../tests/utils/render";

const DRAFT_KEY = "nawy-feedback-draft";

function renderFeedback() {
  return renderWithProviders(<FeedbackPage />, { route: "/ar/profile/help/feedback" });
}

describe("FeedbackPage", () => {
  it("UT-PAGE-FB-01 shows the rating, the type and the message", () => {
    const { t } = renderFeedback();

    expect(screen.getByRole("radiogroup", { name: t("feedback.ratingLabel") })).toBeInTheDocument();
    expect(screen.getByLabelText(t("feedback.typeLabel"))).toBeInTheDocument();
    expect(screen.getByLabelText(t("feedback.messageLabel"))).toBeInTheDocument();
  });

  it("UT-PAGE-FB-02 shows the counter of the message", () => {
    const { t } = renderFeedback();

    expect(screen.getByText("0/500")).toBeInTheDocument();
    expect(t("feedback.messageLabel")).toBeTruthy();
  });

  it("UT-PAGE-FB-03 keeps the send button disabled without a rating", () => {
    const { t } = renderFeedback();

    expect(screen.getByRole("button", { name: new RegExp(t("feedback.send")) })).toBeDisabled();
  });

  it("UT-PAGE-FB-04 shows the rating error when the group is left without a choice", async () => {
    const { user, t } = renderFeedback();

    const firstStar = screen.getAllByRole("radio")[0];
    firstStar.focus();
    await user.tab();

    expect(
      await screen.findByText(t("feedback.errorRating"), { selector: "#feedback-rating-error" }),
    ).toBeInTheDocument();
  });

  it("UT-PAGE-FB-05 shows the error of a short message", async () => {
    const { user, t, dict } = renderFeedback();

    await user.click(screen.getByRole("radio", { name: dict.feedback.starLabels[2] }));
    await user.type(screen.getByLabelText(t("feedback.messageLabel")), "قصير");
    await user.tab();

    expect(await screen.findByText(t("feedback.errorShort"))).toBeInTheDocument();
  });

  it("UT-PAGE-FB-06 enables the send button with a rating and a message", async () => {
    const { user, t, dict } = renderFeedback();

    await user.click(screen.getByRole("radio", { name: dict.feedback.starLabels[2] }));
    await user.type(screen.getByLabelText(t("feedback.messageLabel")), "الخدمة كانت ممتازة جدا");

    await waitFor(() =>
      expect(screen.getByRole("button", { name: new RegExp(t("feedback.send")) })).toBeEnabled(),
    );
  });

  it("UT-PAGE-FB-07 sends the feedback and confirms it", async () => {
    const { user, t, dict } = renderFeedback();

    await user.click(screen.getByRole("radio", { name: dict.feedback.starLabels[2] }));
    await user.type(screen.getByLabelText(t("feedback.messageLabel")), "الخدمة كانت ممتازة جدا");
    await user.click(screen.getByRole("button", { name: new RegExp(t("feedback.send")) }));

    expect(
      await screen.findByText(t("feedback.successTitle"), {}, { timeout: 3000 }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: t("feedback.back") })).toBeInTheDocument();
  });

  it("UT-PAGE-FB-08 clears the draft after a successful send", async () => {
    const { user, t, dict } = renderFeedback();

    await user.click(screen.getByRole("radio", { name: dict.feedback.starLabels[2] }));
    await user.type(screen.getByLabelText(t("feedback.messageLabel")), "الخدمة كانت ممتازة جدا");
    await user.click(screen.getByRole("button", { name: new RegExp(t("feedback.send")) }));

    await screen.findByText(t("feedback.successTitle"), {}, { timeout: 3000 });

    expect(window.sessionStorage.getItem(DRAFT_KEY)).toBeNull();
  });

  it("UT-PAGE-FB-09 keeps the draft in the session storage", async () => {
    const { user, t, dict } = renderFeedback();

    await user.click(screen.getByRole("radio", { name: dict.feedback.starLabels[2] }));
    await user.type(screen.getByLabelText(t("feedback.messageLabel")), "الخدمة كانت ممتازة جدا");

    await waitFor(() => {
      const raw = window.sessionStorage.getItem(DRAFT_KEY);
      expect(raw).not.toBeNull();
      expect(JSON.parse(raw as string)).toMatchObject({ rating: 3 });
    });
  });

  it("UT-PAGE-FB-10 restores the draft of the session", async () => {
    window.sessionStorage.setItem(
      DRAFT_KEY,
      JSON.stringify({ rating: 4, type: "complaint", message: "رسالة محفوظة من قبل" }),
    );

    const { t, dict } = renderFeedback();

    await waitFor(() =>
      expect(screen.getByLabelText(t("feedback.messageLabel"))).toHaveValue("رسالة محفوظة من قبل"),
    );
    expect(screen.getByRole("radio", { name: dict.feedback.starLabels[3] })).toHaveAttribute(
      "aria-checked",
      "true",
    );
  });

  it("UT-PAGE-FB-11 asks before leaving with unsaved changes", async () => {
    const { user, t, dict } = renderFeedback();

    await user.click(screen.getByRole("radio", { name: dict.feedback.starLabels[2] }));
    await user.click(screen.getByRole("button", { name: t("common.back") }));

    expect(screen.getByRole("dialog", { name: t("feedback.discardTitle") })).toBeInTheDocument();
  });

  it("UT-PAGE-FB-12 drops the draft when the change is discarded", async () => {
    const { user, t, dict } = renderFeedback();

    await user.click(screen.getByRole("radio", { name: dict.feedback.starLabels[2] }));
    await user.click(screen.getByRole("button", { name: t("common.back") }));
    const dialog = screen.getByRole("dialog");
    await user.click(within(dialog).getByRole("button", { name: t("feedback.discardConfirm") }));

    expect(window.sessionStorage.getItem(DRAFT_KEY)).toBeNull();
  });
});
