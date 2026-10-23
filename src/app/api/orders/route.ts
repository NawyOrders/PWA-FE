import { NextResponse } from "next/server";
import { createOrder } from "@/server/checkout";
import { parseCreateOrderInput } from "@/server/parse";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "INVALID_REQUEST" }, { status: 400 });
  }
  const input = parseCreateOrderInput(body);
  if (!input) {
    return NextResponse.json({ error: "INVALID_REQUEST" }, { status: 400 });
  }
  const result = createOrder(input);
  if ("issues" in result) {
    return NextResponse.json(
      { error: "CHECKOUT_BLOCKED", issues: result.issues },
      { status: 409 },
    );
  }
  return NextResponse.json(result, { status: result.duplicated ? 200 : 201 });
}
