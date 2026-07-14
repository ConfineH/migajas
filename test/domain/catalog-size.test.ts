import { describe, it, expect } from "vitest";
import { getFoods } from "@/lib/data/foods";
import { filterByRegion } from "@/lib/domain/foods";

describe("catalog size per territory", () => {
  it("has at least 80 foods for España and República Dominicana", () => {
    const foods = getFoods();
    const esCount = filterByRegion(foods, "España").length;
    const doCount = filterByRegion(foods, "República Dominicana").length;

    expect(esCount).toBeGreaterThanOrEqual(80);
    expect(doCount).toBeGreaterThanOrEqual(80);
  });
});
