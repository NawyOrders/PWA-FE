import { screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ReportSheet } from "./ReportSheet";
import { renderWithProviders } from "../../../tests/utils/render";
import { useUiStore } from "@/store/uiStore";
import { makeUser } from "../../../tests/factories";

function renderReport(onClose = vi.fn()) {
  const utils = renderWithProviders(<ReportSheet onClose={onClose} />, {
    route: "/ar/profile/help",
  });
  return { ...utils, onClose };
}

describe("ReportSheet", () => {
  it("UT-REPORT-01 shows the title and the four categories", () => {
    const { t } = renderReport();

    expect(screen.getByRole("heading", { name: t("help.reportTitle") })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: t("help.categoryOrder") })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: t("help.categoryPayment") })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: t("help.categoryBug") })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: t("help.categoryOther") })).toBeInTheDocument();
  });

  it("UT-REPORT-02 selects the order category by default", () => {
    const { t } = renderReport();

    expect(screen.getByRole("button", { name: t("help.categoryOrder") })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });

  it("UT-REPORT-03 changes the category", async () => {
    const { user, t } = renderReport();

    await user.click(screen.getByRole("button", { name: t("help.categoryBug") }));

    expect(screen.getByRole("button", { name: t("help.categoryBug") })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(screen.getByRole("button", { name: t("help.categoryOrder") })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
  });

  it("UT-REPORT-04 refuses a short description", async () => {
    const { user, t } = renderReport();

    await user.type(screen.getByLabelText(t("help.descriptionLabel")), "قصير");
    await user.click(screen.getByRole("button", { name: t("help.send") }));

    expect(screen.getByText(t("help.errorShort"))).toBeInTheDocument();
  });

  it("UT-REPORT-05 counts the characters of the description", async () => {
    const { user, t } = renderReport();

    await user.type(screen.getByLabelText(t("help.descriptionLabel")), "abc");

    expect(screen.getByText("3/1000")).toBeInTheDocument();
  });

  it("UT-REPORT-06 shows the order picker for a logged in user", () => {
    const { t } = renderWithProviders(<ReportSheet onClose={vi.fn()} />, {
      route: "/ar/profile/help",
      stores: { auth: { isLoggedIn: true, user: makeUser({ name: "أحمد", phone: "01000000000" }) } },
    });

    expect(screen.getByLabelText(t("help.orderPickerLabel"))).toBeInTheDocument();
  });

  it("UT-REPORT-07 hides the order picker for a guest", () => {
    const { t } = renderReport();

    expect(screen.queryByLabelText(t("help.orderPickerLabel"))).not.toBeInTheDocument();
  });

  it("UT-REPORT-08 sends the report and shows the ticket", async () => {
    const { user, t } = renderReport();

    await user.type(
      screen.getByLabelText(t("help.descriptionLabel")),
      "وصف طويل enough للاختبار",
    );
    await user.click(screen.getByRole("button", { name: t("help.send") }));

    expect(await screen.findByRole("heading", { name: t("help.reportSent") })).toBeInTheDocument();
  });

  it("UT-REPORT-09 keeps the attachment name", async () => {
    const { user } = renderReport();

    const input = document.getElementById("report-file") as HTMLInputElement;
    await user.upload(input, new File(["x"], "proof.png", { type: "image/png" }));

    expect(await screen.findByText("proof.png")).toBeInTheDocument();
  });

  it("UT-REPORT-10 removes the attachment", async () => {
    const { user, t } = renderReport();

    const input = document.getElementById("report-file") as HTMLInputElement;
    await user.upload(input, new File(["x"], "proof.png", { type: "image/png" }));
    await user.click(await screen.findByRole("button", { name: t("help.attachmentRemove") }));

    await waitFor(() => expect(screen.queryByText("proof.png")).not.toBeInTheDocument());
  });

  it("UT-REPORT-11 closes the sheet", async () => {
    const { user, t, onClose } = renderReport();

    const dialog = screen.getByRole("dialog");
    const closeButton = screen
      .getAllByRole("button", { name: t("common.close") })
      .find((node) => dialog.contains(node));
    await user.click(closeButton as HTMLElement);

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("UT-REPORT-12 does not show a toast for a valid report", async () => {
    const { user, t } = renderReport();

    await user.type(
      screen.getByLabelText(t("help.descriptionLabel")),
      "وصف طويل enough للاختبار",
    );
    await user.click(screen.getByRole("button", { name: t("help.send") }));

    await screen.findByRole("heading", { name: t("help.reportSent") });
    expect(useUiStore.getState().toast).toBeNull();
  });
});
