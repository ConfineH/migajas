import type { Difficulty, FoodItem } from "@/lib/domain/foods";

export const GLYCEMIC_IMPACT_LABELS_ES: Record<Difficulty, string> = {
  Baja: "Impacto glucémico bajo",
  Media: "Impacto glucémico medio",
  Alta: "Impacto glucémico alto",
};

export const GLYCEMIC_IMPACT_HINTS_ES: Record<Difficulty, string> = {
  Baja: "Sube la glucosa de forma más lenta y moderada.",
  Media: "Sube la glucosa de forma intermedia. Vigila la porción.",
  Alta: "Puede subir la glucosa más rápido. Cuidado con la cantidad.",
};

export const FIBER_INFO_NOTE_ES =
  "Dato informativo. Las raciones de Migajas usan HC totales por defecto.";

export function parseFiberPer100gFromNotes(notes: string): number | null {
  const match = notes.match(/(\d+(?:[.,]\d+)?)\s*g\s*fibra\s*\/\s*100\s*g/i);
  if (!match) return null;
  const value = Number(match[1].replace(",", "."));
  return Number.isFinite(value) ? value : null;
}

export function resolveFoodFiberG(food: Pick<FoodItem, "notes" | "grams" | "fiberG">): number | null {
  if (typeof food.fiberG === "number" && food.fiberG >= 0) {
    return Math.round(food.fiberG * 10) / 10;
  }

  const per100g = parseFiberPer100gFromNotes(food.notes);
  if (per100g === null || food.grams <= 0) return null;

  return Math.round(((per100g * food.grams) / 100) * 10) / 10;
}

export function formatGlycemicImpact(
  difficulty: Difficulty,
  regionId = "es",
): string {
  if (regionId === "do") {
    return GLYCEMIC_IMPACT_LABELS_ES[difficulty];
  }
  return GLYCEMIC_IMPACT_LABELS_ES[difficulty];
}

export function getGlycemicImpactHint(
  difficulty: Difficulty,
  regionId = "es",
): string {
  void regionId;
  return GLYCEMIC_IMPACT_HINTS_ES[difficulty];
}
