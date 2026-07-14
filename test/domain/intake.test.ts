import { describe, it, expect } from "vitest";
import {
  assertSameDayEditable,
  buildIntakeEntry,
  isValidMealSlot,
  sumDailyCarbs,
  validateIntakeWrite,
} from "@/lib/domain/intake";
import type { FoodItem } from "@/lib/domain/foods";

const sampleFood: FoodItem = {
  id: "manzana-pequena",
  country: "España",
  category: "Fruta",
  name: "Manzana pequeña",
  portionText: "1 unidad",
  grams: 120,
  carbsG: 10,
  difficulty: "Baja",
  itemType: "base",
  notes: "",
};

describe("isValidMealSlot", () => {
  it("accepts allowed meal slots", () => {
    expect(isValidMealSlot("comida")).toBe(true);
    expect(isValidMealSlot("snack")).toBe(true);
  });

  it("rejects invalid meal slots", () => {
    expect(isValidMealSlot("brunch")).toBe(false);
  });
});

describe("validateIntakeWrite", () => {
  it("accepts valid write payload", () => {
    const result = validateIntakeWrite({
      food_id: "manzana-pequena",
      meal_slot: "comida",
      local_date: "2026-07-14",
      portion_multiplier: 1,
    });
    expect(result.ok).toBe(true);
  });

  it("rejects invalid meal slot", () => {
    const result = validateIntakeWrite({
      food_id: "manzana-pequena",
      meal_slot: "brunch",
      local_date: "2026-07-14",
    });
    expect(result.ok).toBe(false);
  });
});

describe("buildIntakeEntry", () => {
  it("denormalizes Spain rations at 10 g per ration", () => {
    const entry = buildIntakeEntry(
      {
        food_id: sampleFood.id,
        meal_slot: "comida",
        local_date: "2026-07-14",
        portion_multiplier: 2,
      },
      { ...sampleFood, carbsG: 20 },
      "es",
    );
    expect(entry.carbs_g).toBe(40);
    expect(entry.rations).toBe(4);
  });

  it("denormalizes RD rations at 15 g per ration", () => {
    const entry = buildIntakeEntry(
      {
        food_id: sampleFood.id,
        meal_slot: "cena",
        local_date: "2026-07-14",
        portion_multiplier: 1,
      },
      { ...sampleFood, carbsG: 30 },
      "do",
    );
    expect(entry.carbs_g).toBe(30);
    expect(entry.rations).toBe(2);
  });

  it("applies portion multiplier", () => {
    const entry = buildIntakeEntry(
      {
        food_id: sampleFood.id,
        meal_slot: "desayuno",
        local_date: "2026-07-14",
        portion_multiplier: 1.5,
      },
      sampleFood,
      "es",
    );
    expect(entry.carbs_g).toBe(15);
    expect(entry.rations).toBe(1.5);
  });
});

describe("assertSameDayEditable", () => {
  it("allows edits on the same local day", () => {
    expect(assertSameDayEditable("2026-07-14", "2026-07-14")).toBeNull();
  });

  it("blocks edits on prior days", () => {
    expect(assertSameDayEditable("2026-07-13", "2026-07-14")).not.toBeNull();
  });
});

describe("sumDailyCarbs", () => {
  it("totals carbs for the requested day", () => {
    const total = sumDailyCarbs(
      [
        { local_date: "2026-07-14", carbs_g: 10 },
        { local_date: "2026-07-14", carbs_g: 20 },
        { local_date: "2026-07-13", carbs_g: 99 },
      ],
      "2026-07-14",
    );
    expect(total).toBe(30);
  });
});
