import { http, HttpResponse, delay } from "msw";

const GEOCODING_BASE = "https://nominatim.openstreetmap.org";

export const reverseGeocodeHandler = http.get(
  `${GEOCODING_BASE}/reverse`,
  () =>
    HttpResponse.json({
      display_name: "حي النخيل، شارع السلطان محمد، الإسكندرية، مصر",
      lat: "31.2001",
      lon: "29.9187",
    }),
);

export const searchAddressesHandler = http.get(
  `${GEOCODING_BASE}/search`,
  () =>
    HttpResponse.json([
      {
        lat: "31.2001",
        lon: "29.9187",
        display_name: "حي النخيل، شارع السلطان محمد، الإسكندرية، مصر",
        place_id: 1,
      },
      {
        lat: "31.2100",
        lon: "29.9300",
        display_name: "كرموز، شارع الورديانية، الإسكندرية، مصر",
        place_id: 2,
      },
    ]),
);

export const handlers = [reverseGeocodeHandler, searchAddressesHandler];

export { GEOCODING_BASE, delay };
