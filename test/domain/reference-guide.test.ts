import { describe, it, expect } from "vitest";
import {
  buildConversionTable,
  carbsToRations,
  rationsToCarbs,
} from "@/lib/domain/reference-guide";

describe("reference-guide", () => {
  it("builds conversion rows for Spain rule", () => {
    const table = buildConversionTable(2, 1);
    expect(table).toEqual([
      { rations: 1, carbsG: 10 },
      { rations: 2, carbsG: 20 },
    ]);
  });

  it("converts carbs to rations bidirectionally", () => {
    expect(carbsToRations(25)).toBe(2.5);
    expect(rationsToCarbs(2.5)).toBe(25);
  });

  it("rejects invalid inputs", () => {
    expect(carbsToRations(-1)).toBeNull();
    expect(rationsToCarbs(Number.NaN)).toBeNull();
  });
});
