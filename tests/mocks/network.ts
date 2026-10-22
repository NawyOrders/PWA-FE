import { HttpResponse, delay, http } from "msw";
import { server } from "./server";
import { GEOCODING_BASE } from "./handlers";
import "./handlers";

/**
 * Network helpers for the resilience suites (TESTING.md sections 8.5 and 8.6).
 *
 * Only `fetch` and the clock are involved: no application module is mocked.
 */
export function respondWith(status: number, body?: unknown): void {
  server.use(
    http.get(`${GEOCODING_BASE}/reverse`, () =>
      body === undefined ? new HttpResponse(null, { status }) : HttpResponse.json(body as any, { status }),
    ),
    http.get(`${GEOCODING_BASE}/search`, () =>
      body === undefined ? new HttpResponse(null, { status }) : HttpResponse.json(body as any, { status }),
    ),
  );
}

export function respondWithMalformedJson(): void {
  server.use(
    http.get(`${GEOCODING_BASE}/reverse`, () =>
      HttpResponse.text("<html>not json</html>", {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    ),
    http.get(`${GEOCODING_BASE}/search`, () =>
      HttpResponse.text("<html>not json</html>", {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    ),
  );
}

export function respondAfter(ms: number, body: unknown): void {
  server.use(
    http.get(`${GEOCODING_BASE}/reverse`, async () => {
      await delay(ms);
      return HttpResponse.json(body as any);
    }),
    http.get(`${GEOCODING_BASE}/search`, async () => {
      await delay(ms);
      return HttpResponse.json(body as any);
    }),
  );
}

/** Rejects the request the way a dropped connection does. */
export function respondOffline(): void {
  server.use(
    http.get(`${GEOCODING_BASE}/reverse`, () => HttpResponse.error()),
    http.get(`${GEOCODING_BASE}/search`, () => HttpResponse.error()),
  );
}

/**
 * A counting handler: returns the number of requests seen so far, so a test
 * can assert that a call happens exactly once.
 */
export function countRequests(): () => number {
  let count = 0;
  server.use(
    http.get(`${GEOCODING_BASE}/reverse`, () => {
      count += 1;
      return HttpResponse.json({ display_name: "عنوان", lat: "1", lon: "2" });
    }),
  );
  return () => count;
}
