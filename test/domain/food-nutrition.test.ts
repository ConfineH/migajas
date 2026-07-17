import { describe, it, expect } from "vitest";
import {
  formatGlycemicImpact,
  parseFiberPer100gFromNotes,
  resolveFoodFiberG,
} from "@/lib/domain/food-nutrition";

describe("food-nutrition", () => {
  it("parses fiber per 100 g from notes", () => {
    expect(parseFiberPer100gFromNotes("8 g fibra/100 g (BEDCA)")).toBe(8);
    expect(parseFiberPer100gFromNotes("12 g HC/100 g, 5 g fibra/100 g")).toBe(5);
    expect(parseFiberPer100gFromNotes("BEDCA")).toBeNull();
  });

  it("scales fiber to portion grams", () => {
    expect(
      resolveFoodFiberG({
        notes: "8 g fibra/100 g (BEDCA)",
        grams: 100,
      }),
    ).toBe(8);
    expect(
      resolveFoodFiberG({
        notes: "8 g fibra/100 g (BEDCA)",
        grams: 50,
      }),
    ).toBe(4);
  });

  it("prefers explicit fiberG when present", () => {
    expect(
      resolveFoodFiberG({
        notes: "8 g fibra/100 g",
        grams: 100,
        fiberG: 6,
      }),
    ).toBe(6);
  });

  it("maps difficulty to glycemic impact label", () => {
    expect(formatGlycemicImpact("Baja")).toContain("bajo");
    expect(formatGlycemicImpact("Alta")).toContain("alto");
  });
});
