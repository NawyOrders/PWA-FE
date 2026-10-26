import { render, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { RegisterSW } from "./RegisterSW";

const unregister = vi.fn(() => Promise.resolve(true));
const getRegistrations = vi.fn(() => Promise.resolve([{ unregister }]));
const update = vi.fn(() => Promise.resolve());
const addRegistrationListener = vi.fn();
const removeRegistrationListener = vi.fn();
const addControllerListener = vi.fn();
const removeControllerListener = vi.fn();
const registration = {
  waiting: null,
  installing: null,
  update,
  addEventListener: addRegistrationListener,
  removeEventListener: removeRegistrationListener,
};
const register = vi.fn(() => Promise.resolve(registration));
const cacheDelete = vi.fn(() => Promise.resolve(true));
const cacheKeys = vi.fn(() => Promise.resolve(["karam-images-v1", "other-cache"]));

function installServiceWorkerApi() {
  Object.defineProperty(navigator, "serviceWorker", {
    configurable: true,
    writable: true,
    value: {
      controller: null,
      getRegistrations,
      register,
      addEventListener: addControllerListener,
      removeEventListener: removeControllerListener,
    },
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

  it("UT-SW-02 unregisters workers and clears only PWA caches outside production", async () => {
    installServiceWorkerApi();
    vi.stubEnv("NODE_ENV", "development");

    render(<RegisterSW />);

    await waitFor(() => expect(getRegistrations).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(unregister).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(cacheDelete).toHaveBeenCalledWith("karam-images-v1"));
    expect(cacheDelete).not.toHaveBeenCalledWith("other-cache");
    expect(register).not.toHaveBeenCalled();
  });

  it("UT-SW-03 registers the root service worker in production", async () => {
    installServiceWorkerApi();
    vi.stubEnv("NODE_ENV", "production");

    render(<RegisterSW />);

    await waitFor(() => expect(register).toHaveBeenCalledWith("/sw.js", { scope: "/" }));
    expect(getRegistrations).not.toHaveBeenCalled();
    expect(addRegistrationListener).toHaveBeenCalledWith("updatefound", expect.any(Function));
    expect(addControllerListener).toHaveBeenCalledWith("controllerchange", expect.any(Function));
    await waitFor(() => expect(update).toHaveBeenCalled());
  });
});
