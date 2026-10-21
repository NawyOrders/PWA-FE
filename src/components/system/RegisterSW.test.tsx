import { render, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { RegisterSW } from "./RegisterSW";

const unregister = vi.fn();
const register = vi.fn(() => Promise.resolve());
const getRegistrations = vi.fn(() => Promise.resolve([{ unregister }]));
const cacheDelete = vi.fn(() => Promise.resolve(true));
const cacheKeys = vi.fn(() => Promise.resolve(["v1"]));

function installServiceWorkerApi() {
  Object.defineProperty(navigator, "serviceWorker", {
    configurable: true,
    writable: true,
    value: { getRegistrations, register },
  });
  Object.defineProperty(globalThis, "caches", {
    configurable: true,
    writable: true,
    value: { keys: cacheKeys, delete: cacheDelete },
  });
}

function removeServiceWorkerApi() {
  Reflect.deleteProperty(navigator, "serviceWorker");
  Reflect.deleteProperty(globalThis, "caches");
}

describe("RegisterSW", () => {
  afterEach(() => {
    removeServiceWorkerApi();
    vi.unstubAllEnvs();
    vi.clearAllMocks();
  });

  it("UT-SW-01 renders nothing when the browser has no service worker support", () => {
    const { container } = render(<RegisterSW />);

    expect(container).toBeEmptyDOMElement();
  });

  it("UT-SW-02 unregisters service workers and clears caches outside production", async () => {
    installServiceWorkerApi();
    vi.stubEnv("NODE_ENV", "development");

    render(<RegisterSW />);

    await waitFor(() => expect(getRegistrations).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(unregister).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(cacheDelete).toHaveBeenCalledWith("v1"));
    expect(register).not.toHaveBeenCalled();
  });

  it("UT-SW-03 registers the service worker in production", async () => {
    installServiceWorkerApi();
    vi.stubEnv("NODE_ENV", "production");

    render(<RegisterSW />);

    await waitFor(() => expect(register).toHaveBeenCalledWith("/sw.js"));
    expect(getRegistrations).not.toHaveBeenCalled();
  });
});
