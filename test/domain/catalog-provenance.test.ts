import { describe, it, expect } from "vitest";
import {
  CATALOG_GOVERNANCE,
  PROVENANCE_CODES,
  provenanceFromDataSource,
} from "@/lib/domain/catalog-provenance";
import { resolveProvenanceCode, type FoodItem } from "@/lib/domain/foods";
import foodsData from "@/lib/data/foods.json";

describe("catalog provenance governance", () => {
  it("exposes closed B/F/E/R/P codes", () => {
    expect(Object.keys(PROVENANCE_CODES).sort()).toEqual([
      "B",
      "E",
      "F",
      "P",
      "R",
    ]);
  });

  it("maps legacy dataSource to provenance codes", () => {
    expect(provenanceFromDataSource("bedca_aligned")).toBe("B");
    expect(provenanceFromDataSource("bedca_standard_recipe")).toBe("R");
    expect(provenanceFromDataSource("label_or_typical")).toBe("E");
    expect(provenanceFromDataSource("pedagogical_estimate")).toBe("P");
  });

  it("marks external review as pending until signed", () => {
    expect(CATALOG_GOVERNANCE.reviewStatus).toBe("pending_external");
    expect(CATALOG_GOVERNANCE.methodologyPath).toMatch(/CATALOG-METHODOLOGY/);
  });

  it("every catalog food resolves a provenance code and portion basis", () => {
    const foods = foodsData as FoodItem[];
    for (const food of foods) {
      const code = resolveProvenanceCode(food);
      expect(PROVENANCE_CODES[code], food.id).toBeDefined();
      expect(food.portionBasis, `missing portionBasis on ${food.id}`).toBeTruthy();
    }
  });
});
