import { NextResponse } from "next/server";
import type { BranchId } from "@/data/branches";
import type { ItemAvailability } from "@/lib/checkout";
import { updateCatalogEntry } from "@/server/catalog";

const BRANCH_IDS: BranchId[] = ["downtown", "nakheel", "karmouz"];
const STATUSES: ItemAvailability[] = ["available", "out-of-stock", "inactive"];

export async function PATCH(request: Request) {
  const token = process.env.ADMIN_API_TOKEN;
  if (!token) {
    return NextResponse.json({ error: "ADMIN_NOT_CONFIGURED" }, { status: 503 });
  }
  if (request.headers.get("authorization") !== `Bearer ${token}`) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "INVALID_REQUEST" }, { status: 400 });
  }
  if (typeof body !== "object" || body === null) {
    return NextResponse.json({ error: "INVALID_REQUEST" }, { status: 400 });
  }
  const record = body as Record<string, unknown>;
  const dishId = typeof record.dishId === "string" ? record.dishId : null;
  if (!dishId) {
    return NextResponse.json({ error: "INVALID_REQUEST" }, { status: 400 });
  }
  const branchId = BRANCH_IDS.find((id) => id === record.branchId);
  const availability = STATUSES.find((status) => status === record.availability);
  if (record.branchId !== undefined && !branchId) {
    return NextResponse.json({ error: "INVALID_BRANCH" }, { status: 400 });
  }
  if (record.availability !== undefined && !availability) {
    return NextResponse.json({ error: "INVALID_AVAILABILITY" }, { status: 400 });
  }
  if (record.price !== undefined && typeof record.price !== "number") {
    return NextResponse.json({ error: "INVALID_PRICE" }, { status: 400 });
  }

  const entry = updateCatalogEntry({
    dishId,
    price: typeof record.price === "number" ? record.price : undefined,
    active: typeof record.active === "boolean" ? record.active : undefined,
    branchId,
    availability,
  });
  if (!entry) {
    return NextResponse.json({ error: "DISH_NOT_FOUND" }, { status: 404 });
  }
  return NextResponse.json({ entry });
}
