import { http, HttpResponse, delay } from "msw";
import { createOrder, quoteDelivery, validateCheckout } from "@/server/checkout";
import { parseCheckoutInput, parseCreateOrderInput } from "@/server/parse";

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

export const deliveryQuoteHandler = http.post("*/api/delivery/quote", async ({ request }) => {
  const body = (await request.json().catch(() => null)) as { zoneId?: unknown } | null;
  if (!body || typeof body.zoneId !== "string") {
    return HttpResponse.json({ error: "INVALID_REQUEST" }, { status: 400 });
  }
  const quote = quoteDelivery(body.zoneId);
  if (!quote) return HttpResponse.json({ error: "ZONE_UNAVAILABLE" }, { status: 422 });
  return HttpResponse.json(quote);
});

export const checkoutValidateHandler = http.post("*/api/checkout/validate", async ({ request }) => {
  const input = parseCheckoutInput(await request.json().catch(() => null));
  if (!input) return HttpResponse.json({ error: "INVALID_REQUEST" }, { status: 400 });
  return HttpResponse.json(validateCheckout(input));
});

export const createOrderHandler = http.post("*/api/orders", async ({ request }) => {
  const input = parseCreateOrderInput(await request.json().catch(() => null));
  if (!input) return HttpResponse.json({ error: "INVALID_REQUEST" }, { status: 400 });
  const result = createOrder(input);
  if ("issues" in result) {
    return HttpResponse.json({ error: "CHECKOUT_BLOCKED", issues: result.issues }, { status: 409 });
  }
  return HttpResponse.json(result, { status: result.duplicated ? 200 : 201 });
});

export const handlers = [
  reverseGeocodeHandler,
  searchAddressesHandler,
  deliveryQuoteHandler,
  checkoutValidateHandler,
  createOrderHandler,
];

export { GEOCODING_BASE, delay };
