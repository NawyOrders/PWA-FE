export type CategoryId = "burger" | "pizza" | "shawarma" | "noodles" | "desserts";

export interface Category {
  id: CategoryId;
  image: string;
}

export const categories: Category[] = [
  { id: "burger", image: "crack-burgers" },
  { id: "pizza", image: "cheese-pizza" },
  { id: "shawarma", image: "special-shawarma" },
  { id: "noodles", image: "bolognese-noodles" },
  { id: "desserts", image: "mixed-donuts" },
];
