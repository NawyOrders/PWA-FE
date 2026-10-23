import { NextRequest } from "next/server";
import { describe, expect, it } from "vitest";
import { proxy } from "./proxy";

function request(pathname: string, locale?: string) {
  const url = new URL(`https://nawyorders.test${pathname}`);
  const nextRequest = new NextRequest(url);
  if (locale) nextRequest.cookies.set("locale", locale);
  return nextRequest;
}

describe("proxy", () => {
  it("UT-PROXY-01 keeps a request that already carries a locale", () => {
    const response = proxy(request("/ar/menu"));

    expect(response.headers.get("location")).toBeNull();
    expect(response.status).toBe(200);
  });

  it("UT-PROXY-02 keeps the English locale", () => {
    const response = proxy(request("/en/menu"));

    expect(response.headers.get("location")).toBeNull();
  });

  it("UT-PROXY-03 keeps API requests", () => {
    const response = proxy(request("/api/orders"));

    expect(response.headers.get("location")).toBeNull();
  });

  it("UT-PROXY-04 keeps static files and Next internals", () => {
    expect(proxy(request("/sw.js")).headers.get("location")).toBeNull();
    expect(proxy(request("/_next/static/chunk.js")).headers.get("location")).toBeNull();
  });

  it("UT-PROXY-05 redirects a bare path to the default locale", () => {
    const response = proxy(request("/menu"));

    expect(response.headers.get("location")).toBe("https://nawyorders.test/ar/menu");
  });

  it("UT-PROXY-06 redirects the root to the default locale", () => {
    const response = proxy(request("/"));

    expect(response.headers.get("location")).toBe("https://nawyorders.test/ar");
  });

  it("UT-PROXY-07 uses the locale cookie when it is known", () => {
    const response = proxy(request("/menu", "en"));

    expect(response.headers.get("location")).toBe("https://nawyorders.test/en/menu");
  });

  it("UT-PROXY-08 falls back to the default locale for an unknown cookie", () => {
    const response = proxy(request("/menu", "fr"));

    expect(response.headers.get("location")).toBe("https://nawyorders.test/ar/menu");
  });
});
