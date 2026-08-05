import type { FoodItem } from "@/lib/domain/foods";

export interface CatalogAuditIssue {
  code:
    | "negative_carbs"
    | "negative_grams"
    | "fiber_gt_carbs"
    | "duplicate_id"
    | "duplicate_name_portion"
    | "near_duplicate_name"
    | "inconsistent_category"
    | "absurd_portion"
    | "out_of_range_carbs_density"
    | "missing_data_source"
    | "invalid_data_source";
  foodId?: string;
  detail: string;
  /** soft = warn only; blocking codes omit severity or use blocking */
  severity?: "blocking" | "soft";
}

const BEVERAGE_NAMES = /^(agua|café solo|cafe solo|té|te)$/i;

const VALID_DATA_SOURCES = new Set([
  "bedca_aligned",
  "bedca_standard_recipe",
  "label_or_typical",
  "multi_source",
  "pedagogical_estimate",
]);

function normalizeFoodName(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/\([^)]*\)/g, "")
    .replace(/\b(de|del|la|el|los|las|con|y)\b/g, " ")
    .replace(/\s+/g, " ")
    .replace(/patatas\b/g, "patata")
    .replace(/s\b/g, "")
    .trim();
}

/** Soft density check: g HC per 100 g of portion (skip modulators / zero). */
export function carbsDensityPer100g(food: FoodItem): number | null {
  if (food.grams <= 0 || food.carbsG <= 0) return null;
  return (food.carbsG / food.grams) * 100;
}

export function auditFoodCatalog(foods: FoodItem[]): CatalogAuditIssue[] {
  const issues: CatalogAuditIssue[] = [];
  const seenIds = new Set<string>();
  const namePortion = new Map<string, string>();
  const normalizedNames = new Map<string, { id: string; name: string }>();

  for (const food of foods) {
    if (seenIds.has(food.id)) {
      issues.push({
        code: "duplicate_id",
        foodId: food.id,
        detail: `ID duplicado: ${food.id}`,
      });
    }
    seenIds.add(food.id);

    if (food.carbsG < 0) {
      issues.push({
        code: "negative_carbs",
        foodId: food.id,
        detail: `${food.name}: carbsG negativo`,
      });
    }
    if (food.grams < 0) {
      issues.push({
        code: "negative_grams",
        foodId: food.id,
        detail: `${food.name}: grams negativo`,
      });
    }
    if (
      food.fiberG != null &&
      food.carbsG >= 0 &&
      food.fiberG > food.carbsG + 0.05
    ) {
      issues.push({
        code: "fiber_gt_carbs",
        foodId: food.id,
        detail: `${food.name}: fibra (${food.fiberG}) > HC (${food.carbsG})`,
      });
    }

    const key = `${food.country}|${food.name.toLowerCase()}|${food.portionText}|${food.grams}|${food.carbsG}`;
    const prev = namePortion.get(key);
    if (prev) {
      issues.push({
        code: "duplicate_name_portion",
        foodId: food.id,
        detail: `Entrada idéntica a ${prev}: ${food.name} / ${food.portionText}`,
      });
    } else {
      namePortion.set(key, food.id);
    }

    const normKey = `${food.country}|${normalizeFoodName(food.name)}`;
    const existing = normalizedNames.get(normKey);
    if (existing && existing.id !== food.id) {
      issues.push({
        code: "near_duplicate_name",
        foodId: food.id,
        severity: "soft",
        detail: `Nombre casi duplicado de ${existing.id} («${existing.name}» ≈ «${food.name}»)`,
      });
    } else if (!existing) {
      normalizedNames.set(normKey, { id: food.id, name: food.name });
    }

    if (
      food.category === "Lácteos" &&
      BEVERAGE_NAMES.test(food.name.trim())
    ) {
      issues.push({
        code: "inconsistent_category",
        foodId: food.id,
        detail: `${food.name} está en Lácteos; debería ser Bebida`,
      });
    }

    if (food.grams === 0 && food.carbsG > 0) {
      issues.push({
        code: "absurd_portion",
        foodId: food.id,
        detail: `${food.name}: grams=0 con HC>0`,
      });
    }

    const density = carbsDensityPer100g(food);
    if (density != null && density > 95 && food.itemType !== "modulator") {
      if (food.category !== "Dulce" && !/azúcar|miel|sirope/i.test(food.name)) {
        issues.push({
          code: "out_of_range_carbs_density",
          foodId: food.id,
          severity: "soft",
          detail: `${food.name}: densidad ${density.toFixed(0)} g HC/100 g (revisar)`,
        });
      }
    }

    if (!food.dataSource && !food.provenanceCode) {
      issues.push({
        code: "missing_data_source",
        foodId: food.id,
        detail: `${food.name}: falta dataSource / provenanceCode`,
      });
    } else if (food.dataSource && !VALID_DATA_SOURCES.has(food.dataSource)) {
      issues.push({
        code: "invalid_data_source",
        foodId: food.id,
        detail: `${food.name}: dataSource inválido (${food.dataSource})`,
      });
    }

    // ES consistency: legumes should not be dry; cereals arroz/pasta should be cooked
    if (food.country === "España") {
      if (
        food.category === "Legumbres" &&
        !/hummus/i.test(food.name) &&
        (/sec[oa]|crudo/i.test(food.name) || food.portionBasis === "dry")
      ) {
        issues.push({
          code: "absurd_portion",
          foodId: food.id,
          detail: `${food.name}: legumbre seca/cruda en catálogo ES (debe ser cocida)`,
        });
      }
      if (
        /^(arroz|pasta)\b/i.test(food.name) &&
        /crudo|seco/i.test(food.name)
      ) {
        issues.push({
          code: "absurd_portion",
          foodId: food.id,
          detail: `${food.name}: arroz/pasta crudos en catálogo ES (debe ser cocido)`,
        });
      }
    }
  }

  return issues;
}

export function getBlockingCatalogIssues(
  issues: CatalogAuditIssue[],
): CatalogAuditIssue[] {
  return issues.filter(
    (i) =>
      i.severity !== "soft" &&
      i.code !== "out_of_range_carbs_density" &&
      i.code !== "near_duplicate_name",
  );
}

export function summarizeCatalogAudit(issues: CatalogAuditIssue[]) {
  const byCode: Record<string, number> = {};
  for (const issue of issues) {
    byCode[issue.code] = (byCode[issue.code] ?? 0) + 1;
  }
  return { total: issues.length, byCode };
}
