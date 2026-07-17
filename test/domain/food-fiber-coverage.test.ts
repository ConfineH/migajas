import { describe, it, expect } from "vitest";
import { getFoods } from "@/lib/data/foods";
import { resolveFoodFiberG } from "@/lib/domain/food-nutrition";

const KEY_FIBER_FOODS = [
  "pan-integral-100g",
  "lentejas-cocidas-200g",
  "garbanzos-cocidos",
  "arroz-integral-cocido-150g",
  "es-brocoli",
  "manzana",
];

describe("food fiber coverage (ES catalog)", () => {
  it("key curriculum foods expose portion fiber", () => {
    const foods = getFoods();
    for (const id of KEY_FIBER_FOODS) {
      const food = foods.find((item) => item.id === id);
      expect(food, `missing ${id}`).toBeDefined();
      expect(resolveFoodFiberG(food!), `no fiber for ${id}`).toBeGreaterThan(0);
    }
  });

  it("has fiber data on at least 40 Spain foods", () => {
    const spainWithFiber = getFoods().filter(
      (food) =>
        food.country === "España" && resolveFoodFiberG(food) !== null,
    );
    expect(spainWithFiber.length).toBeGreaterThanOrEqual(40);
  });
});
