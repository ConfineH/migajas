import { calculateRations, EXCHANGE_UNIT_G } from "./rations";
import { applyPlainLanguageDo } from "./plain-language-do";
import type {
  PortionBasis,
  ProvenanceCode,
} from "./catalog-provenance";
import { provenanceFromDataSource } from "./catalog-provenance";

export type Difficulty = "Baja" | "Media" | "Alta";
export type ItemType = "base" | "mixed" | "modulator";

/** @deprecated Prefer provenanceCode (B/F/E/R/P). Kept for legacy seeds. */
export type FoodDataSource =
  | "bedca_aligned"
  | "bedca_standard_recipe"
  | "label_or_typical"
  | "multi_source"
  | "pedagogical_estimate";

/**
 * How Migajas teaches counting for this item.
 * habitually_uncounted = low-HC veg in usual side portions (not “infinite free”).
 */
export type CountingPolicy = "always_count" | "habitually_uncounted";

export const FOOD_DATA_SOURCE_LABELS: Record<FoodDataSource, string> = {
  bedca_aligned: "BEDCA (tablas ES)",
  bedca_standard_recipe: "BEDCA + receta estándar",
  label_or_typical: "Etiquetado fabricante",
  multi_source: "Media de varias fuentes",
  pedagogical_estimate: "Estimación pedagógica",
};

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
  sourceId?: string;
  /** Grams of fiber for the listed portion (informative only). */
  fiberG?: number;
  dataSource?: FoodDataSource;
  /** Closed provenance: B BEDCA · F FEN · E etiquetado · R receta · P pedagógica */
  provenanceCode?: ProvenanceCode;
  /** How listed grams relate to the food (edible / cooked / beverage…). */
  portionBasis?: PortionBasis;
  countingPolicy?: CountingPolicy;
}

export function resolveProvenanceCode(food: FoodItem): ProvenanceCode {
  return food.provenanceCode ?? provenanceFromDataSource(food.dataSource);
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
