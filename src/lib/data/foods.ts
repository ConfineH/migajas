import type { FoodItem } from "@/lib/domain/foods";
import { filterByRegion } from "@/lib/domain/foods";
import { getContentCache } from "@/lib/content-cache";

export function getFoods(): FoodItem[] {
  return getContentCache().foods;
}

export function getFoodsForCountry(foodCountry: string): FoodItem[] {
  return filterByRegion(getFoods(), foodCountry);
}

export function getFoodById(id: string): FoodItem | undefined {
  return getFoods().find((food) => food.id === id);
}
