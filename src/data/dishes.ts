import type { LocalizedText } from "@/lib/i18n/types";
import type { CategoryId } from "./categories";

export interface Dish {
  id: string;
  name: LocalizedText;
  description: LocalizedText;
  price: number;
  sizePrices: { small: number; medium: number; large: number };
  oldPrice?: number;
  image: string;
  categoryId: CategoryId;
  featured?: boolean;
  tag?: LocalizedText;
}

// Prices use minor currency units; medium matches the listed price, with small/large at 80%/120%.
export const dishes: Dish[] = [
  {
    id: "crack-burger",
    name: { ar: "كراك برجر", en: "Crack Burger" },
    description: {
      ar: "قطعة برجر مشوية مع جبنة ذائبة وخبز طري",
      en: "Grilled patty, melted cheese and soft bun",
    },
    price: 12000,
    sizePrices: { small: 9600, medium: 12000, large: 14400 },
    oldPrice: 15000,
    image: "crack-burgers",
    categoryId: "burger",
    featured: true,
    tag: { ar: "الاكثر مبيعا", en: "Best seller" },
  },
  {
    id: "gourmet-burger",
    name: { ar: "برجر جورميه بالجبن", en: "Gourmet Cheese Burger" },
    description: {
      ar: "برجر لحم مع جبنة شيدر وبطاطس مقرمشة",
      en: "Beef burger with cheddar and crispy fries",
    },
    price: 14500,
    sizePrices: { small: 11600, medium: 14500, large: 17400 },
    oldPrice: 18000,
    image: "gourmet-burger",
    categoryId: "burger",
    featured: true,
    tag: { ar: "مع بطاطس", en: "With fries" },
  },
  {
    id: "classic-burger",
    name: { ar: "برجر كلاسيك", en: "Classic Burger" },
    description: {
      ar: "برجر لحم مشوي مع صوص خاص ومخلل",
      en: "Grilled beef burger with house sauce and pickles",
    },
    price: 9500,
    sizePrices: { small: 7600, medium: 9500, large: 11400 },
    image: "classic-burger",
    categoryId: "burger",
  },
  {
    id: "cheese-pizza",
    name: { ar: "بيتزا الجبن", en: "Cheese Pizza" },
    description: {
      ar: "عجينة مقرمشة مع موزاريلا وجبنة رومي",
      en: "Crispy dough with mozzarella and romano cheese",
    },
    price: 11000,
    sizePrices: { small: 8800, medium: 11000, large: 13200 },
    oldPrice: 13500,
    image: "cheese-pizza",
    categoryId: "pizza",
    featured: true,
    tag: { ar: "طازجة الآن", en: "Fresh now" },
  },
  {
    id: "margherita-pizza",
    name: { ar: "بيتزا مارجريتا", en: "Margherita Pizza" },
    description: {
      ar: "صلصة طماطم ايطالية مع ريحان وموزاريلا",
      en: "Italian tomato sauce with basil and mozzarella",
    },
    price: 12500,
    sizePrices: { small: 10000, medium: 12500, large: 15000 },
    image: "margherita-pizza",
    categoryId: "pizza",
  },
  {
    id: "chicken-shawarma",
    name: { ar: "شاورما دجاج", en: "Chicken Shawarma" },
    description: {
      ar: "شاورما دجاج متبلة مع صوص الثوم والمخلل",
      en: "Seasoned chicken shawarma with garlic sauce and pickles",
    },
    price: 8000,
    sizePrices: { small: 6400, medium: 8000, large: 9600 },
    oldPrice: 10000,
    image: "chicken-shawarma",
    categoryId: "shawarma",
    featured: true,
    tag: { ar: "ملفوف في خبز صاح", en: "Wrapped in saj bread" },
  },
  {
    id: "beef-shawarma",
    name: { ar: "شاورما لحم", en: "Beef Shawarma" },
    description: {
      ar: "شاورما لحم مشوية على الفحم مع طحينة",
      en: "Charcoal-grilled beef shawarma with tahini",
    },
    price: 9500,
    sizePrices: { small: 7600, medium: 9500, large: 11400 },
    image: "beef-shawarma",
    categoryId: "shawarma",
    tag: { ar: "على الفحم", en: "Charcoal" },
  },
  {
    id: "special-shawarma",
    name: { ar: "شاورما خاصة", en: "Special Shawarma" },
    description: {
      ar: "شاورما بالجبنة والصوص الخاص من كرم الشام",
      en: "Shawarma with cheese and Karam El Sham sauce",
    },
    price: 10500,
    sizePrices: { small: 8400, medium: 10500, large: 12600 },
    image: "special-shawarma",
    categoryId: "shawarma",
  },
  {
    id: "bolognese-noodles",
    name: { ar: "نودلز بولونيز", en: "Bolognese Noodles" },
    description: {
      ar: "نودلز بصلصة الطماطم واللحم المفروم",
      en: "Noodles with tomato sauce and minced beef",
    },
    price: 9000,
    sizePrices: { small: 7200, medium: 9000, large: 10800 },
    oldPrice: 11500,
    image: "bolognese-noodles",
    categoryId: "noodles",
    featured: true,
    tag: { ar: "جديد", en: "New" },
  },
  {
    id: "chef-noodles",
    name: { ar: "نودلز الشيف", en: "Chef Noodles" },
    description: {
      ar: "نودلز مقرمشة مع خضار وصوص الصويا",
      en: "Crispy noodles with vegetables and soy sauce",
    },
    price: 10000,
    sizePrices: { small: 8000, medium: 10000, large: 12000 },
    image: "chef-noodles",
    categoryId: "noodles",
  },
  {
    id: "mixed-donuts",
    name: { ar: "دوناتس متنوعة", en: "Mixed Donuts" },
    description: {
      ar: "تشكيلة دوناتس طازجة بحشوات مختلفة",
      en: "A fresh mix of donuts with assorted fillings",
    },
    price: 6500,
    sizePrices: { small: 5200, medium: 6500, large: 7800 },
    oldPrice: 8000,
    image: "mixed-donuts",
    categoryId: "desserts",
    featured: true,
    tag: { ar: "حلو المذاق", en: "Sweet treat" },
  },
  {
    id: "three-donuts",
    name: { ar: "ثلاث دوناتس", en: "Three Donuts" },
    description: {
      ar: "ثلاث قطع دوناتس مزينة بالسكر الملون",
      en: "Three donuts topped with colorful sprinkles",
    },
    price: 5000,
    sizePrices: { small: 4000, medium: 5000, large: 6000 },
    image: "three-donuts",
    categoryId: "desserts",
  },
  {
    id: "sweet-box",
    name: { ar: "علبة الحلويات", en: "Sweet Box" },
    description: {
      ar: "علبة حلويات مشكلة للمشاركة",
      en: "An assorted dessert box to share",
    },
    price: 14000,
    sizePrices: { small: 11200, medium: 14000, large: 16800 },
    image: "sweet-box",
    categoryId: "desserts",
  },
];

export const featuredDishes = dishes.filter((dish) => dish.featured);

export function getDish(id: string): Dish | undefined {
  return dishes.find((dish) => dish.id === id);
}
