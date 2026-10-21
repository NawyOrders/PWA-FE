import { screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ChatSheet } from "./ChatSheet";
import { renderWithProviders } from "../../../tests/utils/render";
import { useUiStore } from "@/store/uiStore";
import { makeUser } from "../../../tests/factories";

function renderChat(online: boolean, onClose = vi.fn()) {
  const utils = renderWithProviders(
    <ChatSheet online={online} onlineLabel="متصل الآن" onClose={onClose} />,
    { route: "/ar/profile/help" },
  );
  return { ...utils, onClose };
}

describe("ChatSheet", () => {
  it("UT-CHAT-01 shows the online panel and the greeting", () => {
    const { t } = renderChat(true);

    expect(screen.getByRole("heading", { name: t("help.chatTitle") })).toBeInTheDocument();
    expect(screen.getByRole("log")).toHaveTextContent(t("help.chatGreeting"));
  });

  it("UT-CHAT-02 keeps the send button disabled for an empty message", () => {
    const { t } = renderChat(true);

    expect(screen.getByRole("button", { name: t("help.send") })).toBeDisabled();
  });

  it("UT-CHAT-03 adds the message to the log", async () => {
    const { user, t } = renderChat(true);

    await user.type(screen.getByLabelText(t("help.messageLabel")), "أريد الاستفسار عن الطلب");
    await user.click(screen.getByRole("button", { name: t("help.send") }));

    expect(screen.getByRole("log")).toHaveTextContent("أريد الاستفسار عن الطلب");
  });

  it("UT-CHAT-04 shows the offline form for a guest", () => {
    const { t } = renderChat(false);

    expect(screen.getByLabelText(t("help.nameLabel"))).toBeInTheDocument();
    expect(screen.getByLabelText(t("help.phoneLabel"))).toBeInTheDocument();
    expect(screen.getByLabelText(t("help.messageLabel"))).toBeInTheDocument();
  });

  it("UT-CHAT-05 hides the identity fields for a logged in user", () => {
    const { t } = renderWithProviders(
      <ChatSheet online={false} onlineLabel="خارج ساعات العمل" onClose={vi.fn()} />,
      {
        route: "/ar/profile/help",
        stores: { auth: { isLoggedIn: true, user: makeUser({ name: "أحمد", phone: "01000000000" }) } },
      },
    );

    expect(screen.queryByLabelText(t("help.nameLabel"))).not.toBeInTheDocument();
    expect(screen.getByLabelText(t("help.messageLabel"))).toBeInTheDocument();
  });

  it("UT-CHAT-06 refuses a short message", async () => {
    const { user, t } = renderChat(false);

    await user.type(screen.getByLabelText(t("help.messageLabel")), "قصير");
    await user.click(screen.getByRole("button", { name: t("help.send") }));

    expect(screen.getByText(t("help.errorShort"))).toBeInTheDocument();
  });

  it("UT-CHAT-07 requires the name and the phone of a guest", async () => {
    const { user, t } = renderChat(false);

    await user.type(screen.getByLabelText(t("help.messageLabel")), "رسالة طويلة كفاية للاختبار");
    await user.click(screen.getByRole("button", { name: t("help.send") }));

    expect(screen.getAllByText(t("help.errorRequired")).length).toBeGreaterThan(0);
  });

  it("UT-CHAT-08 sends the message and closes the sheet", async () => {
    const { user, t, onClose } = renderChat(false);

    await user.type(screen.getByLabelText(t("help.nameLabel")), "أحمد");
    await user.type(screen.getByLabelText(t("help.phoneLabel")), "01000000000");
    await user.type(screen.getByLabelText(t("help.messageLabel")), "رسالة طويلة كفاية للاختبار");
    await user.click(screen.getByRole("button", { name: t("help.send") }));

    await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
    expect(useUiStore.getState().toast?.message).toBe(t("help.chatSent"));
  });

  it("UT-CHAT-09 keeps the draft in the local storage", async () => {
    const { user, t } = renderChat(false);

    await user.type(screen.getByLabelText(t("help.messageLabel")), "مسودة الرسالة");

    expect(window.localStorage.getItem("nawy-support-chat-draft")).toBe("مسودة الرسالة");
  });
});
