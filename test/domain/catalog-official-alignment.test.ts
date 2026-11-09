import { describe, it, expect } from "vitest";
import { getFoodById, getFoodsForCountry } from "@/lib/data/foods";
import { getSourcesForRegion } from "@/lib/domain/content-sources";
import { formatHabitualMeasure } from "@/lib/domain/foods";
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

  it("recomputed cups follow BEDCA carbohydrate density", () => {
    expect(density("es-brocoli")).toBeCloseTo(1.1, 1);
    expect(density("es-judias-verdes")).toBeCloseTo(4, 0);
    expect(density("es-zanahoria")).toBeCloseTo(7, 0);
    expect(density("zanahoria")).toBeCloseTo(5, 0);
    expect(density("melon")).toBeCloseTo(6, 0);
    expect(density("sandia")).toBeCloseTo(4.5, 1);
    expect(density("es-albaricoque")).toBeCloseTo(9.5, 1);
    expect(density("calabaza")).toBeCloseTo(2.1, 1);
    expect(density("es-hummus")).toBeCloseTo(10, 0);
  });

  it("keeps boiled, roasted and fried potato as separate densities", () => {
    expect(getFoodById("patata-cocida")?.name).toBe("Patata hervida");
    expect(density("patata-cocida")).toBeCloseTo(15.4, 0);
    expect(density("es-patata-asada")).toBeCloseTo(46, 0);
    expect(density("patatas-fritas-100g")).toBeCloseTo(30, 0);
    expect(density("patatas-fritas-150g")).toBeCloseTo(30, 0);
    expect(formatHabitualMeasure(getFoodById("patatas-fritas-100g")!)).toBe(
      "Guarnición (60 g) = 1.8 raciones",
    );
  });

  it("computes the household measure from the food density", () => {
    expect(formatHabitualMeasure(getFoodById("pan-blanco")!)).toBe(
      "Barra de cuarto (180 g) = 9.0 raciones",
    );
    expect(formatHabitualMeasure(getFoodById("arroz-cocido-150g")!)).toBe(
      "Plato mediano (160 g) = 4.2 raciones",
    );
    expect(formatHabitualMeasure(getFoodById("es-judias-verdes")!)).toBe(
      "Plato grande (250 g) = 1.0 raciones",
    );
    expect(formatHabitualMeasure(getFoodById("leche")!)).toBe(
      "Vaso (200 ml) = 1.0 raciones",
    );
    expect(formatHabitualMeasure(getFoodById("es-brocoli")!)).toBe(
      "Plato grande (300 g) = 0.3 raciones",
    );
  });

  it("maps Spain course foods to real Dominican equivalents", () => {
    expect(resolveRegionalFoodId("huevo", "do")).toBe("do-huevo-do");
    expect(resolveRegionalFoodId("pescado", "do")).toBe("do-pescado-frito");
    expect(resolveRegionalFoodId("patata-cocida", "do")).toBe("do-yuca");
    expect(resolveRegionalFoodId("es-gazpacho", "do")).toBe("do-sopa-criolla");
    expect(resolveRegionalFoodId("es-agua", "do")).toBe("do-agua");
  });
});
