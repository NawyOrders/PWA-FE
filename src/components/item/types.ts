export type ItemSize = {
  id: "small" | "medium" | "large";
  label: string;
  price: number;
};

export type ItemAddon = {
  id: string;
  label: string;
  image: string;
  price: number;
  color: string;
};

export type CartItem = {
  id: string;
  name: string;
  sizeId: ItemSize["id"];
  sizeLabel: string;
  unitPrice: number;
  quantity: number;
  addonIds: string[];
  note: string;
  addedAt: number;
};
