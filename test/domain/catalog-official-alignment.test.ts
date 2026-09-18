import { describe, it, expect } from "vitest";
import { getFoodById, getFoodsForCountry } from "@/lib/data/foods";
import { getSourcesForRegion } from "@/lib/domain/content-sources";
import { calculateRations } from "@/lib/domain/rations";
import { resolveRegionalFoodId } from "@/lib/domain/content-localization";

function density(id: string) {
  const food = getFoodById(id);
  expect(food, id).toBeDefined();
  return (food!.carbsG / food!.grams) * 100;
}

describe("official catalog alignment", () => {
  it("Spain staples follow Murillo 10 g densities", () => {
    expect(density("pan-blanco")).toBeCloseTo(50, 0);
    expect(density("arroz-cocido")).toBeCloseTo(26.3, 0);
    expect(density("pasta-cocida")).toBeCloseTo(22.2, 0);
    expect(density("patata-cocida")).toBeCloseTo(15.4, 0);
    expect(density("lentejas-cocidas")).toBeCloseTo(20, 0);
    expect(getFoodById("pan-blanco")?.carbsG).toBe(10);
    expect(calculateRations(getFoodById("arroz-cocido")!.carbsG, 10)).toBe(1);
  });

  it("Dominican staples follow USDA/ADA 15 g rule without copying ES 10 g portions", () => {
    expect(density("arroz-blanco-do")).toBeCloseTo(28.3, 0);
    expect(density("habichuelas-rojas")).toBeCloseTo(23, 0);
    expect(density("do-yuca")).toBeCloseTo(30, 0);
    expect(density("casabe")).toBeCloseTo(79, 0);
    expect(calculateRations(getFoodById("arroz-blanco-do")!.carbsG, 15)).toBe(1);
    expect(calculateRations(getFoodById("habichuelas-rojas")!.carbsG, 15)).toBeCloseTo(
      1.53,
      1,
    );
    expect(getFoodById("leche-do")?.carbsG).toBe(12);
  });

  it("RD catalog includes water, oil, egg, fish and pan de agua", () => {
    const ids = new Set(getFoodsForCountry("República Dominicana").map((f) => f.id));
    for (const id of [
      "do-agua",
      "do-aceite",
      "do-huevo-do",
      "do-pescado-frito",
      "do-pan-agua",
      "casabe",
      "mangu",
      "la-bandera",
    ]) {
      expect(ids.has(id), id).toBe(true);
    }
  });

  it("exposes RD official sources and keeps BEDCA on Spain", () => {
    const doIds = getSourcesForRegion("do").map((s) => s.id);
    expect(doIds).toEqual(
      expect.arrayContaining([
        "incap-tca",
        "usda-fdc",
        "ada-carb-choice",
        "msp-pilon",
        "migajas-exchange-unit-do",
        "sjd-raciones",
      ]),
    );
    expect(doIds).not.toContain("bedca");
    expect(doIds).not.toContain("migajas-exchange-unit");

    const esIds = getSourcesForRegion("es").map((s) => s.id);
    expect(esIds).toEqual(
      expect.arrayContaining(["bedca", "murillo-raciones", "migajas-exchange-unit"]),
    );
    expect(esIds).not.toContain("migajas-exchange-unit-do");
  });

  it("maps Spain course foods to real Dominican equivalents", () => {
    expect(resolveRegionalFoodId("huevo", "do")).toBe("do-huevo-do");
    expect(resolveRegionalFoodId("pescado", "do")).toBe("do-pescado-frito");
    expect(resolveRegionalFoodId("patata-cocida", "do")).toBe("do-yuca");
    expect(resolveRegionalFoodId("es-gazpacho", "do")).toBe("do-sopa-criolla");
    expect(resolveRegionalFoodId("es-agua", "do")).toBe("do-agua");
  });
});
