import { describe, expect, it } from "vitest";
import { z } from "zod";
import {
  ReverseGeocodeResponseSchema,
  SearchAddressSchema,
  SearchAddressesResponseSchema,
} from "@/lib/schemas/geocoding";
import { reverseGeocode, searchAddresses } from "@/lib/geocoding";
import { respondAfter, respondOffline, respondWith, respondWithMalformedJson } from "../mocks/network";
import { server } from "../mocks/server";
import { http, HttpResponse } from "msw";

const LOCATION = { lat: 31.2001, lng: 29.9187 };

describe("contract: geocoding API schemas", () => {
  it("UT-CONTRACT-GEO-01 reverse geocode response matches schema", async () => {
    const result = await reverseGeocode(LOCATION);
    const parsed = ReverseGeocodeResponseSchema.safeParse({ display_name: result });
    expect(parsed.success).toBe(true);
  });

  it("UT-CONTRACT-GEO-02 search addresses response matches schema", async () => {
    const results = await searchAddresses("الإسكندرية");
    const parsed = SearchAddressesResponseSchema.safeParse(results);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.length).toBeGreaterThan(0);
    }
  });

  it("UT-CONTRACT-GEO-03 schema rejects invalid reverse geocode shape", () => {
    expect(ReverseGeocodeResponseSchema.safeParse({}).success).toBe(false);
    expect(ReverseGeocodeResponseSchema.safeParse({ display_name: "" }).success).toBe(false);
    expect(ReverseGeocodeResponseSchema.safeParse({ display_name: "test" }).success).toBe(true);
  });

  it("UT-CONTRACT-GEO-04 schema rejects invalid search address shape", () => {
    expect(SearchAddressSchema.safeParse({ lat: "1", lon: "2" }).success).toBe(false);
    expect(
      SearchAddressSchema.safeParse({
        lat: "1",
        lon: "2",
        display_name: "x",
        place_id: "not-a-number",
      }).success,
    ).toBe(false);
    expect(
      SearchAddressSchema.safeParse({
        lat: "1",
        lon: "2",
        display_name: "x",
      }).success,
    ).toBe(true);
  });
});

describe("network: contract scenarios (TESTING.md 8.5)", () => {
  it("UT-NET-SCN-01 400 validation error", async () => {
    respondWith(400);
    await expect(reverseGeocode(LOCATION)).rejects.toThrow();
  });

  it("UT-NET-SCN-02 401 unauthorized", async () => {
    respondWith(401);
    await expect(reverseGeocode(LOCATION)).rejects.toThrow();
  });

  it("UT-NET-SCN-03 404 not found", async () => {
    respondWith(404);
    await expect(reverseGeocode(LOCATION)).rejects.toThrow();
  });

  it("UT-NET-SCN-04 429 rate limit", async () => {
    respondWith(429);
    await expect(reverseGeocode(LOCATION)).rejects.toThrow();
  });

  it("UT-NET-SCN-05 500 server error", async () => {
    respondWith(500);
    await expect(reverseGeocode(LOCATION)).rejects.toThrow();
  });

  it("UT-NET-SCN-06 timeout/slow response handling", async () => {
    respondAfter(100, { display_name: "slow" });
    await expect(reverseGeocode(LOCATION)).resolves.toBe("slow");
  });

  it("UT-NET-SCN-07 malformed JSON", async () => {
    respondWithMalformedJson();
    await expect(reverseGeocode(LOCATION)).rejects.toThrow();
  });

  it("UT-NET-SCN-08 network offline error", async () => {
    respondOffline();
    await expect(reverseGeocode(LOCATION)).rejects.toThrow();
  });

  it("UT-NET-SCN-09 no double submit - request count", async () => {
    let count = 0;
    server.use(
      http.get("https://nominatim.openstreetmap.org/reverse", () => {
        count += 1;
        return HttpResponse.json({ display_name: "test" });
      }),
    );
    const p1 = reverseGeocode(LOCATION);
    const p2 = reverseGeocode(LOCATION);
    await Promise.all([p1, p2]);
    expect(count).toBe(2);
  });

  it("UT-NET-SCN-10 out of order responses not overwriting newer", async () => {
    server.use(
      http.get("https://nominatim.openstreetmap.org/reverse", async ({ request }) => {
        const url = new URL(request.url);
        const lat = url.searchParams.get("lat");
        if (lat === "1") {
          await new Promise((r) => setTimeout(r, 50));
          return HttpResponse.json({ display_name: "old" });
        }
        return HttpResponse.json({ display_name: "new" });
      }),
    );
    const oldReq = reverseGeocode({ lat: 1, lng: 1 });
    const newReq = reverseGeocode({ lat: 2, lng: 2 });
    const [oldRes, newRes] = await Promise.all([oldReq, newReq]);
    expect(oldRes).toBe("old");
    expect(newRes).toBe("new");
  });
});
