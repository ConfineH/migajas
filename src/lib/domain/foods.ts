import { calculateRations, EXCHANGE_UNIT_G } from "./rations";
import { applyPlainLanguageDo } from "./plain-language-do";

export type Difficulty = "Baja" | "Media" | "Alta";
export type ItemType = "base" | "mixed" | "modulator";

export interface FoodItem {
  id: string;
  country: string;
  category: string;
  name: string;
  portionText: string;
  grams: number;
  carbsG: number;
  difficulty: Difficulty;
  itemType: ItemType;
  notes: string;
}

export interface EnrichedFoodItem extends FoodItem {
  rations: number;
}

export function localizeFoodDisplay(
  item: FoodItem,
  regionId: string,
): FoodItem {
  if (regionId !== "do") return item;
  return {
    ...item,
    name: applyPlainLanguageDo(item.name),
    category: applyPlainLanguageDo(item.category),
  };
}

export function enrichFoodItem(
  item: FoodItem,
  exchangeUnitG: number = EXCHANGE_UNIT_G,
  regionId?: string,
): EnrichedFoodItem {
  const display = regionId ? localizeFoodDisplay(item, regionId) : item;
  return {
    ...display,
    rations: calculateRations(item.carbsG, exchangeUnitG),
  };
}

export function enrichFoods(
  items: FoodItem[],
  exchangeUnitG: number = EXCHANGE_UNIT_G,
  regionId?: string,
): EnrichedFoodItem[] {
  return items.map((item) => enrichFoodItem(item, exchangeUnitG, regionId));
}

export function filterByRegion(items: FoodItem[], foodCountry: string): FoodItem[] {
  return items.filter((item) => item.country === foodCountry);
}

export function filterByCategory(
  items: FoodItem[],
  category: string,
): FoodItem[] {
  if (!category || category === "Todas") return items;
  return items.filter((item) => item.category === category);
}

export function searchFoods(items: FoodItem[], query: string): FoodItem[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return items;
  return items.filter((item) =>
    item.name.toLowerCase().includes(normalized),
  );
}

export function getCategories(items: FoodItem[]): string[] {
  const categories = new Set(items.map((item) => item.category));
  return Array.from(categories).sort((a, b) => a.localeCompare(b, "es"));
}

export function filterAndSearch(
  items: FoodItem[],
  category: string,
  query: string,
): FoodItem[] {
  return searchFoods(filterByCategory(items, category), query);
}
