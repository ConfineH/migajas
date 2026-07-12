import { calculateRations } from "./rations";

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

export function enrichFoodItem(item: FoodItem): EnrichedFoodItem {
  return {
    ...item,
    rations: calculateRations(item.carbsG),
  };
}

export function enrichFoods(items: FoodItem[]): EnrichedFoodItem[] {
  return items.map(enrichFoodItem);
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
