import type { ItemAddon, ItemSize } from "./types";

export const burgerItem = {
  id: "burger-baladi",
  name: "برجر لحم بلدي",
  description: "يحتوي على الخبز والخس والطماطم والبصل والجبن واللحم",
};

export const itemSizes: ItemSize[] = [
  { id: "small", label: "صغير", price: 190 },
  { id: "medium", label: "وسط", price: 240 },
  { id: "large", label: "كبير", price: 290 },
];

export const itemAddons: ItemAddon[] = [
  {
    id: "lettuce",
    label: "خس",
    image: "/icons/lettuce.png",
    price: 5,
    color: "#4b9b58",
  },
  { id: "tomato", label: "طماطم", image: "/icons/tomato.png", price: 5, color: "#e9474e" },
  { id: "onion", label: "بصل", image: "/icons/onion.png", price: 5, color: "#edaa65" },
  { id: "cheese", label: "جبنة", image: "/icons/cheese.png", price: 10, color: "#f0ae28" },
  { id: "pickles", label: "مخلل", image: "/icons/cucumber.png", price: 5, color: "#4f9d37" },
];
