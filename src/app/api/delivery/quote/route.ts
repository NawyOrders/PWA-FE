import { NextResponse } from "next/server";
import { quoteDelivery } from "@/server/checkout";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "INVALID_REQUEST" }, { status: 400 });
  }
  const zoneId =
    typeof body === "object" && body !== null && "zoneId" in body
      ? body.zoneId
      : undefined;
  if (typeof zoneId !== "string") {
    return NextResponse.json({ error: "INVALID_REQUEST" }, { status: 400 });
  }
  const quote = quoteDelivery(zoneId);
  if (!quote) {
    return NextResponse.json({ error: "ZONE_UNAVAILABLE" }, { status: 422 });
  }
  return NextResponse.json(quote);
}
