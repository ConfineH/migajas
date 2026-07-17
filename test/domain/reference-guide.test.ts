import { describe, it, expect } from "vitest";
import {
  buildConversionTable,
  carbsToRations,
  rationsToCarbs,
  buildReferenceTips,
} from "@/lib/domain/reference-guide";

describe("reference-guide", () => {
  it("builds conversion rows for Spain rule", () => {
    const table = buildConversionTable(10, 2, 1);
    expect(table).toEqual([
      { rations: 1, carbsG: 10 },
      { rations: 2, carbsG: 20 },
    ]);
  });

  it("builds conversion rows for Dominican rule", () => {
    const table = buildConversionTable(15, 1, 1);
    expect(table).toEqual([{ rations: 1, carbsG: 15 }]);
  });

  it("converts carbs to rations bidirectionally", () => {
    expect(carbsToRations(25, 10)).toBe(2.5);
    expect(rationsToCarbs(2.5, 10)).toBe(25);
    expect(carbsToRations(15, 15)).toBe(1);
  });

  it("rejects invalid inputs", () => {
    expect(carbsToRations(-1, 10)).toBeNull();
    expect(rationsToCarbs(Number.NaN, 10)).toBeNull();
  });

  it("builds region-specific tips", () => {
    const esTips = buildReferenceTips(10, "España", "es");
    expect(esTips[1]).toContain("España");
    expect(esTips[1]).toContain("10 g de HC");
    const joined = esTips.join(" ").toLowerCase();
    expect(joined).toMatch(/fibra|hc totales/);
    expect(joined).toMatch(/alcohol/);

    const doTips = buildReferenceTips(15, "República Dominicana", "do");
    expect(doTips[1]).toContain("República Dominicana");
    expect(doTips[1]).toContain("15 gramos de carbohidratos");
    expect(doTips.join(" ")).not.toMatch(/\bHC\b/);
    expect(doTips.join(" ")).not.toContain("moduladores");
  });
});
