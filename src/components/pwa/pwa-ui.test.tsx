import { screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { renderWithProviders } from "../../../tests/utils/render";
import { expectNoAxeViolations } from "../../../tests/utils/axe";
import { PWA_RELOAD_FLAG, isInstallSnoozed, type BeforeInstallPromptEvent } from "@/lib/pwa";
import { usePwaStore } from "@/store/pwaStore";
import { OfflineBanner } from "./OfflineBanner";
import { UpdateToast } from "./UpdateToast";
import { InstallBanner } from "./InstallBanner";
import { InstallButton } from "./InstallButton";

function makeInstallEvent(outcome: "accepted" | "dismissed" = "accepted") {
  const prompt = vi.fn(() => Promise.resolve());
  const event: BeforeInstallPromptEvent = Object.assign(new Event("beforeinstallprompt"), {
    platforms: ["web"],
    prompt,
    userChoice: Promise.resolve({ outcome, platform: "web" }),
  });
  return { event, prompt };
}

beforeEach(() => {
  usePwaStore.setState({
    hydrated: true,
    updateReady: false,
    waitingWorker: null,
    installPromptEvent: null,
    installed: false,
    online: true,
  });
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("OfflineBanner", () => {
  it("UT-PWA-UI-01 announces the offline state and disappears online", () => {
    usePwaStore.setState({ online: false });
    const { container, rerender } = renderWithProviders(<OfflineBanner />);

    expect(screen.getByRole("status")).toHaveTextContent("لا يوجد اتصال");

    usePwaStore.setState({ online: true });
    rerender(<OfflineBanner />);
    expect(container).toBeEmptyDOMElement();
  });

  it("UT-PWA-UI-02 has no axe violations", async () => {
    usePwaStore.setState({ online: false });
    const { container } = renderWithProviders(<OfflineBanner />);

    await expectNoAxeViolations(container);
  });
});

describe("UpdateToast", () => {
  it("UT-PWA-UI-03 asks the waiting worker to activate", async () => {
    const postMessage = vi.fn();
    usePwaStore.setState({
      updateReady: true,
      waitingWorker: { postMessage } as unknown as ServiceWorker,
    });
    const { user } = renderWithProviders(<UpdateToast />);

    await user.click(screen.getByRole("button", { name: "تحديث الان" }));

    expect(postMessage).toHaveBeenCalledWith({ type: "SKIP_WAITING" });
    expect(sessionStorage.getItem(PWA_RELOAD_FLAG)).toBe("1");
  });

  it("UT-PWA-UI-04 blocks the reload while a form is dirty", async () => {
    const postMessage = vi.fn();
    usePwaStore.setState({
      updateReady: true,
      waitingWorker: { postMessage } as unknown as ServiceWorker,
    });
    const input = document.createElement("input");
    input.value = "unsaved";
    document.body.append(input);
    const { user } = renderWithProviders(<UpdateToast />);

    await user.click(screen.getByRole("button", { name: "تحديث الان" }));

    expect(postMessage).not.toHaveBeenCalled();
    expect(screen.getByText("احفظ تغييراتك أولا ثم حدّث")).toBeInTheDocument();
    input.remove();
  });

  it("UT-PWA-UI-05 can be dismissed", async () => {
    usePwaStore.setState({
      updateReady: true,
      waitingWorker: { postMessage: vi.fn() } as unknown as ServiceWorker,
    });
    const { user } = renderWithProviders(<UpdateToast />);

    await user.click(screen.getByRole("button", { name: "تجاهل" }));

    expect(usePwaStore.getState().updateReady).toBe(false);
  });

  it("UT-PWA-UI-06 has no axe violations", async () => {
    usePwaStore.setState({
      updateReady: true,
      waitingWorker: { postMessage: vi.fn() } as unknown as ServiceWorker,
    });
    const { container } = renderWithProviders(<UpdateToast />);

    await expectNoAxeViolations(container);
  });
});

describe("InstallBanner", () => {
  it("UT-PWA-UI-07 installs from the banner after the second session", async () => {
    localStorage.setItem("karam-pwa-sessions", "2");
    const { event, prompt } = makeInstallEvent("accepted");
    usePwaStore.setState({ installPromptEvent: event });
    const { user } = renderWithProviders(<InstallBanner />, { route: "/ar" });

    await waitFor(() =>
      expect(screen.getByRole("region", { name: "ثبّت التطبيق" })).toBeInTheDocument(),
    );
    await user.click(screen.getByRole("button", { name: "ثبّت التطبيق" }));

    expect(prompt).toHaveBeenCalledTimes(1);
    expect(usePwaStore.getState().installed).toBe(true);
    expect(screen.queryByRole("region", { name: "ثبّت التطبيق" })).not.toBeInTheDocument();
  });

  it("UT-PWA-UI-08 snoozes the banner for 14 days", async () => {
    localStorage.setItem("karam-pwa-sessions", "2");
    const { event } = makeInstallEvent();
    usePwaStore.setState({ installPromptEvent: event });
    const { user } = renderWithProviders(<InstallBanner />, { route: "/ar" });

    await waitFor(() =>
      expect(screen.getByRole("region", { name: "ثبّت التطبيق" })).toBeInTheDocument(),
    );
    await user.click(screen.getByRole("button", { name: "ليس الان" }));

    expect(isInstallSnoozed()).toBe(true);
    expect(screen.queryByRole("region", { name: "ثبّت التطبيق" })).not.toBeInTheDocument();
  });

  it("UT-PWA-UI-09 stays hidden on checkout", async () => {
    localStorage.setItem("karam-pwa-sessions", "2");
    usePwaStore.setState({ installPromptEvent: makeInstallEvent().event });
    renderWithProviders(<InstallBanner />, { route: "/ar/checkout" });

    expect(screen.queryByRole("region", { name: "ثبّت التطبيق" })).not.toBeInTheDocument();
  });
});

describe("InstallButton", () => {
  it("UT-PWA-UI-10 hides without an install event and shows with one", () => {
    const { container, rerender } = renderWithProviders(<InstallButton />);
    expect(container).toBeEmptyDOMElement();

    usePwaStore.setState({ installPromptEvent: makeInstallEvent().event });
    rerender(<InstallButton />);

    expect(screen.getByRole("button", { name: "ثبّت التطبيق" })).toBeInTheDocument();
  });

  it("UT-PWA-UI-11 prompts the browser and marks the app installed", async () => {
    const { event, prompt } = makeInstallEvent();
    usePwaStore.setState({ installPromptEvent: event });
    const { user } = renderWithProviders(<InstallButton />);

    await user.click(screen.getByRole("button", { name: "ثبّت التطبيق" }));

    expect(prompt).toHaveBeenCalledTimes(1);
    expect(usePwaStore.getState().installed).toBe(true);
    expect(usePwaStore.getState().installPromptEvent).toBeNull();
  });
});
