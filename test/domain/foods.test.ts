import { describe, it, expect } from "vitest";
import {
  filterByCategory,
  searchFoods,
  getCategories,
  enrichFoodItem,
} from "@/lib/domain/foods";
import type { FoodItem } from "@/lib/domain/foods";

const sampleFoods: FoodItem[] = [
  {
    id: "pan-blanco",
    country: "España",
    category: "Pan",
    name: "Pan blanco",
    portionText: "1 rebanada",
    grams: 25,
    carbsG: 10,
    difficulty: "Baja",
    itemType: "base",
    notes: "Base",
  },
  {
    id: "manzana",
    country: "España",
    category: "Fruta",
    name: "Manzana pequeña",
    portionText: "1 unidad",
    grams: 120,
    carbsG: 15,
    difficulty: "Baja",
    itemType: "base",
    notes: "Base",
  },
  {
    id: "pollo",
    country: "España",
    category: "Proteína",
    name: "Pollo",
    portionText: "1 porción",
    grams: 100,
    carbsG: 0,
    difficulty: "Baja",
    itemType: "modulator",
    notes: "Modulador",
  },
];

describe("enrichFoodItem", () => {
  it("derives rations from carbs", () => {
    const enriched = enrichFoodItem(sampleFoods[0]);
    expect(enriched.rations).toBe(1);
  });
});

describe("filterByCategory", () => {
  it("returns only items in the given category", () => {
    const result = filterByCategory(sampleFoods, "Pan");
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe("Pan blanco");
  });
});

describe("searchFoods", () => {
  it("finds foods by name (case insensitive)", () => {
    const result = searchFoods(sampleFoods, "manzana");
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe("Manzana pequeña");
  });

  it("returns empty array when no match", () => {
    expect(searchFoods(sampleFoods, "pizza")).toHaveLength(0);
  });
});

describe("getCategories", () => {
  it("returns unique sorted categories", () => {
    const categories = getCategories(sampleFoods);
    expect(categories).toEqual(["Fruta", "Pan", "Proteína"]);
  });
});
