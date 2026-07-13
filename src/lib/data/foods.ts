import type { FoodItem } from "@/lib/domain/foods";
import { getContentCache } from "@/lib/content-cache";

export function getFoods(): FoodItem[] {
  return getContentCache().foods;
}

export function getFoodById(id: string): FoodItem | undefined {
  return getFoods().find((food) => food.id === id);
}
