import { NextResponse } from "next/server";
import { validateCheckout } from "@/server/checkout";
import { parseCheckoutInput } from "@/server/parse";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "INVALID_REQUEST" }, { status: 400 });
  }
  const input = parseCheckoutInput(body);
  if (!input) {
    return NextResponse.json({ error: "INVALID_REQUEST" }, { status: 400 });
  }
  return NextResponse.json(validateCheckout(input));
}
