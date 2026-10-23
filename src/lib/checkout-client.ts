import type {
  CheckoutIssue,
  CheckoutValidation,
  CheckoutValidationInput,
  CreateOrderInput,
  CreateOrderResult,
  DeliveryQuote,
} from "./checkout";

export class CheckoutRequestError extends Error {
  status: number;
  issues: CheckoutIssue[];

  constructor(message: string, status = 0, issues: CheckoutIssue[] = []) {
    super(message);
    this.name = "CheckoutRequestError";
    this.status = status;
    this.issues = issues;
  }
}

async function postJson<T>(url: string, body: unknown): Promise<T> {
  let response: Response;
  try {
    response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch {
    throw new CheckoutRequestError("NETWORK_ERROR");
  }

  const data = (await response.json().catch(() => null)) as
    | { issues?: CheckoutIssue[]; error?: string }
    | T
    | null;
  if (!response.ok) {
    const issues =
      data && typeof data === "object" && "issues" in data && Array.isArray(data.issues)
        ? data.issues
        : [];
    const message =
      data && typeof data === "object" && "error" in data && typeof data.error === "string"
        ? data.error
        : "REQUEST_FAILED";
    throw new CheckoutRequestError(message, response.status, issues);
  }
  if (!data) throw new CheckoutRequestError("INVALID_RESPONSE", response.status);
  return data as T;
}

export function validateCheckout(
  input: CheckoutValidationInput,
): Promise<CheckoutValidation> {
  return postJson<CheckoutValidation>("/api/checkout/validate", input);
}

export function requestDeliveryQuote(zoneId: string): Promise<DeliveryQuote> {
  return postJson<DeliveryQuote>("/api/delivery/quote", { zoneId });
}

export function createServerOrder(
  input: CreateOrderInput,
): Promise<CreateOrderResult> {
  return postJson<CreateOrderResult>("/api/orders", input);
}
