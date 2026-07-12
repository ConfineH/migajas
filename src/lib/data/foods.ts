import foodsData from "@/lib/data/foods.json";
import type { FoodItem } from "@/lib/domain/foods";

export function getFoods(): FoodItem[] {
  return foodsData as FoodItem[];
}

export function getFoodById(id: string): FoodItem | undefined {
  return getFoods().find((food) => food.id === id);
}
