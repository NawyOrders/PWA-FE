import type { CategoryId } from "@/data/categories";
import type { Dish } from "@/data/dishes";
import type { LocalizedText } from "@/lib/i18n/types";
import { getDictionary } from "@/lib/i18n";
import { normalize, normalizeTokens } from "@/lib/text";

export type CategorySearchLabels = Partial<Record<CategoryId, LocalizedText>>;

/**
 * Bilingual category labels for search. The active UI language never narrows
 * the search: a query in either language matches the dish in either language.
 */
export function getCategorySearchLabels(): Record<CategoryId, LocalizedText> {
  const ar = getDictionary("ar").categories;
  const en = getDictionary("en").categories;
  return {
    burger: { ar: ar.burger, en: en.burger },
    pizza: { ar: ar.pizza, en: en.pizza },
    shawarma: { ar: ar.shawarma, en: en.shawarma },
    noodles: { ar: ar.noodles, en: en.noodles },
    desserts: { ar: ar.desserts, en: en.desserts },
  };
}

export const categorySearchLabels = getCategorySearchLabels();

function searchableFields(dish: Dish, labels: CategorySearchLabels): string[] {
  const category = labels[dish.categoryId];
  return [
    dish.name.ar,
    dish.name.en,
    dish.description.ar,
    dish.description.en,
    dish.tag?.ar ?? "",
    dish.tag?.en ?? "",
    dish.keywords?.ar ?? "",
    dish.keywords?.en ?? "",
    category?.ar ?? "",
    category?.en ?? "",
    dish.id,
  ];
}

/**
 * Language-independent dish search. Every token must appear in at least one
 * Arabic or English search field, so an Arabic query finds the dish on the
 * English site and an English query finds it on the Arabic site.
 */
export function searchDishes(
  list: readonly Dish[],
  query: string,
  labels: CategorySearchLabels = categorySearchLabels,
): Dish[] {
  const tokens = normalizeTokens(query);
  if (tokens.length === 0) return [...list];

  return list.filter((dish) => {
    const fields = searchableFields(dish, labels).map(normalize);
    return tokens.every((token) => fields.some((field) => field.includes(token)));
  });
}
