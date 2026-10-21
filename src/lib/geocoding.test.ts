import { http, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";
import { reverseGeocode, searchAddresses } from "./geocoding";
import { server } from "../../tests/mocks/server";

const BASE = "https://nominatim.openstreetmap.org";

describe("reverseGeocode", () => {
  it("UT-GEO-01 returns the display name of the location", async () => {
    const address = await reverseGeocode({ lat: 31.2001, lng: 29.9187 });
    expect(address).toContain("حي النخيل");
  });

  it("UT-GEO-02 sends the coordinates and the Arabic language by default", async () => {
    let url = "";
    server.use(
      http.get(`${BASE}/reverse`, ({ request }) => {
        url = request.url;
        return HttpResponse.json({ display_name: "عنوان تجريبي" });
      }),
    );

    await reverseGeocode({ lat: 31.5, lng: 29.9 });

    expect(url).toContain("format=jsonv2");
    expect(url).toContain("lat=31.5");
    expect(url).toContain("lon=29.9");
    expect(url).toContain("accept-language=ar");
  });

  it("UT-GEO-03 sends the English language when it is requested", async () => {
    let url = "";
    server.use(
      http.get(`${BASE}/reverse`, ({ request }) => {
        url = request.url;
        return HttpResponse.json({ display_name: "Test address" });
      }),
    );

    await reverseGeocode({ lat: 31.5, lng: 29.9 }, undefined, "en");

    expect(url).toContain("accept-language=en");
  });

  it("UT-GEO-04 throws the Arabic message when the request fails", async () => {
    server.use(
      http.get(`${BASE}/reverse`, () => new HttpResponse(null, { status: 500 })),
    );

    await expect(reverseGeocode({ lat: 31.5, lng: 29.9 })).rejects.toThrow(
      "تعذر الحصول على العنوان",
    );
  });

  it("UT-GEO-05 throws the English message when the request fails in English", async () => {
    server.use(
      http.get(`${BASE}/reverse`, () => new HttpResponse(null, { status: 500 })),
    );

    await expect(
      reverseGeocode({ lat: 31.5, lng: 29.9 }, undefined, "en"),
    ).rejects.toThrow("Unable to retrieve the address.");
  });

  it("UT-GEO-06 throws when the response has no display name", async () => {
    server.use(
      http.get(`${BASE}/reverse`, () => HttpResponse.json({ lat: "31.2" })),
    );

    await expect(reverseGeocode({ lat: 31.5, lng: 29.9 })).rejects.toThrow(
      "لم يتم العثور على عنوان لهذا الموقع",
    );
  });

  it("UT-GEO-07 passes the abort signal to the request", async () => {
    const controller = new AbortController();
    let receivedSignal: AbortSignal | null = null;
    server.use(
      http.get(`${BASE}/reverse`, ({ request }) => {
        receivedSignal = request.signal;
        return HttpResponse.json({ display_name: "عنوان تجريبي" });
      }),
    );

    await reverseGeocode({ lat: 31.5, lng: 29.9 }, controller.signal);

    expect(receivedSignal).not.toBeNull();
  });
});

describe("searchAddresses", () => {
  it("UT-GEO-08 returns the matching addresses", async () => {
    const results = await searchAddresses("النخيل");
    expect(results).toHaveLength(2);
    expect(results[0].display_name).toContain("حي النخيل");
    expect(typeof results[0].place_id).toBe("number");
  });

  it("UT-GEO-09 sends the query with a limit of five results", async () => {
    let url = "";
    server.use(
      http.get(`${BASE}/search`, ({ request }) => {
        url = request.url;
        return HttpResponse.json([]);
      }),
    );

    await searchAddresses("النخيل");

    expect(url).toContain("q=%D8%A7%D9%84%D9%86%D8%AE%D9%8A%D9%84");
    expect(url).toContain("limit=5");
    expect(url).toContain("addressdetails=1");
  });

  it("UT-GEO-10 throws the Arabic message when the request fails", async () => {
    server.use(
      http.get(`${BASE}/search`, () => new HttpResponse(null, { status: 500 })),
    );

    await expect(searchAddresses("النخيل")).rejects.toThrow("تعذر البحث عن العنوان");
  });

  it("UT-GEO-11 throws the English message when the request fails in English", async () => {
    server.use(
      http.get(`${BASE}/search`, () => new HttpResponse(null, { status: 500 })),
    );

    await expect(searchAddresses("النخيل", undefined, "en")).rejects.toThrow(
      "Unable to search for this address.",
    );
  });

  it("UT-GEO-12 returns an empty list when nothing matches", async () => {
    server.use(http.get(`${BASE}/search`, () => HttpResponse.json([])));

    await expect(searchAddresses("لا يوجد")).resolves.toEqual([]);
  });
});
