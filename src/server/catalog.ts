import { branches, type BranchId } from "@/data/branches";
import { dishes, type Dish } from "@/data/dishes";
import type { ItemAvailability } from "@/lib/checkout";

export interface CatalogEntry {
  dishId: string;
  price: number;
  active: boolean;
  stock: Record<BranchId, ItemAvailability>;
}

type Catalog = Map<string, CatalogEntry>;

const branchIds = branches.map((branch) => branch.id);

function createInitialCatalog(): Catalog {
  return new Map(
    dishes.map((dish) => [
      dish.id,
      {
        dishId: dish.id,
        price: dish.price,
        active: true,
        stock: Object.fromEntries(
          branchIds.map((branchId) => [branchId, "available"]),
        ) as Record<BranchId, ItemAvailability>,
      },
    ]),
  );
}

let catalog = createInitialCatalog();

export function getDishById(id: string): Dish | undefined {
  return dishes.find((dish) => dish.id === id);
}

export function getCatalogEntry(id: string): CatalogEntry | undefined {
  return catalog.get(id);
}

export function getUnitPrice(entry: CatalogEntry, sizeId?: string): number {
  if (!sizeId || sizeId === "medium") return entry.price;
  if (sizeId !== "small" && sizeId !== "large") return entry.price;
  const dish = getDishById(entry.dishId);
  if (!dish || dish.price === 0) return entry.price;
  const ratio = dish.sizePrices[sizeId] / dish.price;
  return Math.round(entry.price * ratio);
}

export function getAvailability(
  entry: CatalogEntry,
  branchId: BranchId,
): ItemAvailability {
  if (!entry.active) return "inactive";
  return entry.stock[branchId] ?? "inactive";
}

export function updateCatalogEntry(input: {
  dishId: string;
  price?: number;
  active?: boolean;
  branchId?: BranchId;
  availability?: ItemAvailability;
}): CatalogEntry | null {
  const entry = catalog.get(input.dishId);
  if (!entry) return null;
  if (typeof input.price === "number" && Number.isInteger(input.price) && input.price > 0) {
    entry.price = input.price;
  }
  if (typeof input.active === "boolean") {
    entry.active = input.active;
  }
  if (input.branchId && input.availability) {
    entry.stock[input.branchId] = input.availability;
  }
  return entry;
}

export function resetCatalog(): void {
  catalog = createInitialCatalog();
}
