import { describe, expect, it } from "vitest";
import { dishes } from "@/data/dishes";
import { categorySearchLabels, searchDishes } from "./search";

const ids = (query: string) => searchDishes(dishes, query, categorySearchLabels).map((dish) => dish.id);

describe("searchDishes", () => {
  it("UT-SEARCH-01 finds an Arabic dish name from the English site data", () => {
    expect(ids("شاورما دجاج")).toContain("chicken-shawarma");
  });

  it("UT-SEARCH-02 finds an English dish name from the Arabic site data", () => {
    expect(ids("Chicken Shawarma")).toContain("chicken-shawarma");
  });

  it("UT-SEARCH-03 finds Arabic and English names on their own language data", () => {
    expect(ids("بيتزا")).toContain("cheese-pizza");
    expect(ids("pizza")).toContain("cheese-pizza");
  });

  it("UT-SEARCH-04 matches a mixed Arabic-English query", () => {
    expect(ids("شاورما chicken")).toEqual(["chicken-shawarma"]);
  });

  it("UT-SEARCH-05 folds alef, yaa and taa marbuta variants", () => {
    expect(ids("الأكثر مبيعا")).toContain("crack-burger");
    expect(ids("طازجه الان")).toContain("cheese-pizza");
    expect(ids("الأكثر مبيعا")).toEqual(ids("الاكثر مبيعا"));
  });

  it("UT-SEARCH-06 ignores diacritics and tatweel", () => {
    expect(ids("بُرْجَر")).toEqual(ids("برجر"));
    expect(ids("بـــرجر")).toEqual(ids("برجر"));
  });

  it("UT-SEARCH-07 is case insensitive and normalizes whitespace", () => {
    expect(ids("  PIZZA  ")).toEqual(ids("pizza"));
    expect(ids("GOURMET   CHEESE")).toEqual(["gourmet-burger"]);
  });

  it("UT-SEARCH-08 matches a partial word", () => {
    expect(ids("شاو")).toEqual(expect.arrayContaining(["chicken-shawarma", "beef-shawarma"]));
    expect(ids("don")).toContain("mixed-donuts");
  });

  it("UT-SEARCH-09 matches descriptions, tags, categories and keywords", () => {
    expect(ids("طحينة")).toContain("beef-shawarma");
    expect(ids("حلويات")).toHaveLength(3);
    expect(ids("desserts")).toHaveLength(3);
    expect(ids("pasta")).toContain("bolognese-noodles");
    expect(ids("جديد")).toContain("bolognese-noodles");
  });

  it("UT-SEARCH-10 returns all dishes for an empty or whitespace query", () => {
    expect(searchDishes(dishes, "")).toHaveLength(dishes.length);
    expect(searchDishes(dishes, "   ")).toHaveLength(dishes.length);
  });

  it("UT-SEARCH-11 returns no results for an unrelated query", () => {
    expect(ids("زززز")).toEqual([]);
    expect(ids("sushi")).toEqual([]);
  });

  it("UT-SEARCH-12 keeps a stable source order", () => {
    const first = ids("ا");
    const second = ids("ا");
    expect(first).toEqual(second);
    expect(first).toEqual(dishes.filter((dish) => first.includes(dish.id)).map((dish) => dish.id));
  });
});

