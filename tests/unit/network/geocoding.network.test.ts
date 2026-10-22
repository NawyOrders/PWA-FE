import { afterEach, describe, expect, it, vi } from "vitest";
import { reverseGeocode, searchAddresses } from "../../../src/lib/geocoding";
import {
  countRequests,
  respondAfter,
  respondOffline,
  respondWith,
  respondWithMalformedJson,
} from "../../mocks/network";

const LOCATION = { lat: 31.2001, lng: 29.9187 };

describe("network: reverseGeocode", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("UT-NET-01 resolves the display name on success", async () => {
    const address = await reverseGeocode(LOCATION);

    expect(address).toContain("الإسكندرية");
  });

  it("UT-NET-02 sends the language, the format and the coordinates", async () => {
    let captured: URL | null = null;
    const { server } = await import("../../mocks/server");
    const { http, HttpResponse } = await import("msw");
    server.use(
      http.get("https://nominatim.openstreetmap.org/reverse", ({ request }) => {
        captured = new URL(request.url);
        return HttpResponse.json({ display_name: "عنوان" });
      }),
    );

    await reverseGeocode({ lat: 30.5, lng: 31.25 }, undefined, "en");

    expect(captured).not.toBeNull();
    expect(captured!.searchParams.get("lat")).toBe("30.5");
    expect(captured!.searchParams.get("lon")).toBe("31.25");
    expect(captured!.searchParams.get("accept-language")).toBe("en");
    expect(captured!.searchParams.get("format")).toBe("jsonv2");
  });

  it("UT-NET-03 throws the Arabic message on a 500", async () => {
    respondWith(500);

    await expect(reverseGeocode(LOCATION, undefined, "ar")).rejects.toThrow(
      "تعذر الحصول على العنوان",
    );
  });

  it("UT-NET-04 throws the English message on a 404", async () => {
    respondWith(404);

    await expect(reverseGeocode(LOCATION, undefined, "en")).rejects.toThrow(
      "Unable to retrieve the address.",
    );
  });

  it("UT-NET-05 throws on a 429 rate limit", async () => {
    respondWith(429);

    await expect(reverseGeocode(LOCATION)).rejects.toThrow("تعذر الحصول على العنوان");
  });

  it("UT-NET-06 throws on a 400 validation error", async () => {
    respondWith(400, { error: "bad request" });

    await expect(reverseGeocode(LOCATION)).rejects.toThrow("تعذر الحصول على العنوان");
  });

  it("UT-NET-07 throws when the answer has no display name", async () => {
    respondWith(200, { lat: "1", lon: "2" });

    await expect(reverseGeocode(LOCATION, undefined, "en")).rejects.toThrow(
      "No address was found for this location.",
    );
  });

  it("UT-NET-08 rejects a malformed JSON body", async () => {
    respondWithMalformedJson();

    await expect(reverseGeocode(LOCATION)).rejects.toThrow();
  });

  it("UT-NET-09 rejects when the connection drops", async () => {
    respondOffline();

    await expect(reverseGeocode(LOCATION)).rejects.toThrow();
  });

  it("UT-NET-10 aborts the in-flight request with an AbortSignal", async () => {
    respondAfter(5_000, { display_name: "متأخر" });
    const controller = new AbortController();
    const pending = reverseGeocode(LOCATION, controller.signal);

    controller.abort();

    await expect(pending).rejects.toThrow();
  });

  it("UT-NET-11 never loses the first error on two failures in a row", async () => {
    respondWith(500);
    await expect(reverseGeocode(LOCATION, undefined, "en")).rejects.toThrow(
      "Unable to retrieve the address.",
    );

    respondWith(503);
    await expect(reverseGeocode(LOCATION, undefined, "en")).rejects.toThrow(
      "Unable to retrieve the address.",
    );
  });
});

describe("network: searchAddresses", () => {
  it("UT-NET-12 resolves a list of addresses", async () => {
    const results = await searchAddresses("الإسكندرية");

    expect(Array.isArray(results)).toBe(true);
    expect(results[0]).toHaveProperty("display_name");
    expect(results[0]).toHaveProperty("lat");
    expect(results[0]).toHaveProperty("lon");
  });

  it("UT-NET-13 reports the failure with the right language", async () => {
    respondWith(500);

    await expect(searchAddresses("x", undefined, "en")).rejects.toThrow(
      "Unable to search for this address.",
    );
    await expect(searchAddresses("x", undefined, "ar")).rejects.toThrow("تعذر البحث عن العنوان");
  });

  it("UT-NET-14 returns an empty list without throwing", async () => {
    respondWith(200, []);

    await expect(searchAddresses("myspace")).resolves.toEqual([]);
  });
});

describe("network: request counting", () => {
  it("UT-NET-15 issues exactly one request per call", async () => {
    const requests = countRequests();

    await reverseGeocode(LOCATION);
    expect(requests()).toBe(1);

    await reverseGeocode(LOCATION);
    expect(requests()).toBe(2);
  });
});
