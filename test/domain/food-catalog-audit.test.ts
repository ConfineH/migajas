import { describe, it, expect } from "vitest";
import {
  auditFoodCatalog,
  getBlockingCatalogIssues,
  summarizeCatalogAudit,
} from "@/lib/domain/food-catalog-audit";
import type { FoodItem } from "@/lib/domain/foods";
import foodsData from "@/lib/data/foods.json";

const sample: FoodItem = {
  id: "x",
  country: "España",
  category: "Fruta",
  name: "Test",
  portionText: "1",
  grams: 100,
  carbsG: 10,
  difficulty: "Baja",
  itemType: "base",
  notes: "",
  dataSource: "bedca_aligned",
};

describe("auditFoodCatalog", () => {
  it("flags negative carbs and fiber greater than carbs", () => {
    const issues = auditFoodCatalog([
      { ...sample, id: "bad-carbs", carbsG: -1 },
      { ...sample, id: "bad-fiber", carbsG: 5, fiberG: 8 },
    ]);
    expect(issues.some((i) => i.code === "negative_carbs")).toBe(true);
    expect(issues.some((i) => i.code === "fiber_gt_carbs")).toBe(true);
  });

  it("flags agua/café in Lácteos and missing dataSource", () => {
    const issues = auditFoodCatalog([
      {
        ...sample,
        id: "agua-bad",
        name: "Agua",
        category: "Lácteos",
        carbsG: 0,
        itemType: "modulator",
        dataSource: undefined,
      },
    ]);
    expect(issues.some((i) => i.code === "inconsistent_category")).toBe(true);
    expect(issues.some((i) => i.code === "missing_data_source")).toBe(true);
  });

  it("soft-flags near-duplicate names", () => {
    const issues = auditFoodCatalog([
      { ...sample, id: "a", name: "Tortilla de patata" },
      { ...sample, id: "b", name: "Tortilla de patatas", carbsG: 20 },
    ]);
    expect(issues.some((i) => i.code === "near_duplicate_name")).toBe(true);
    expect(getBlockingCatalogIssues(issues)).toEqual([]);
  });

  it("production ES/RD catalog has no blocking integrity issues", () => {
    const foods = foodsData as FoodItem[];
    const issues = auditFoodCatalog(foods);
    const blocking = getBlockingCatalogIssues(issues);
    expect(
      blocking,
      blocking.map((b) => `${b.code}:${b.detail}`).join("\n"),
    ).toEqual([]);
    const summary = summarizeCatalogAudit(issues);
    expect(summary.total).toBe(issues.length);
  });
});
