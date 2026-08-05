#!/usr/bin/env node
/**
 * Nutritional catalog audit (integrity + soft density / near-duplicate flags).
 * Usage: npm run audit:foods
 */
import fs from "node:fs";
import { createRequire } from "node:module";
import { pathToFileURL } from "node:url";

// Use compiled-free duplicate of domain rules via dynamic import of TS is hard;
// keep script logic aligned with src/lib/domain/food-catalog-audit.ts
const foods = JSON.parse(fs.readFileSync("src/lib/data/foods.json", "utf8"));

const BEVERAGE_NAMES = /^(agua|café solo|cafe solo|té|te)$/i;
const VALID = new Set([
  "bedca_aligned",
  "bedca_standard_recipe",
  "label_or_typical",
  "multi_source",
  "pedagogical_estimate",
]);

function normalizeFoodName(name) {
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

const issues = [];
const seenIds = new Set();
const namePortion = new Map();
const normalizedNames = new Map();

for (const food of foods) {
  if (seenIds.has(food.id)) {
    issues.push({ code: "duplicate_id", detail: food.id, severity: "blocking" });
  }
  seenIds.add(food.id);

  if (food.carbsG < 0)
    issues.push({ code: "negative_carbs", detail: food.id, severity: "blocking" });
  if (food.grams < 0)
    issues.push({ code: "negative_grams", detail: food.id, severity: "blocking" });
  if (food.fiberG != null && food.fiberG > food.carbsG + 0.05) {
    issues.push({
      code: "fiber_gt_carbs",
      detail: `${food.id} fiber=${food.fiberG} carbs=${food.carbsG}`,
      severity: "blocking",
    });
  }

  const key = `${food.country}|${food.name.toLowerCase()}|${food.portionText}|${food.grams}|${food.carbsG}`;
  if (namePortion.has(key)) {
    issues.push({
      code: "duplicate_name_portion",
      detail: `${food.id} twin of ${namePortion.get(key)}`,
      severity: "blocking",
    });
  } else namePortion.set(key, food.id);

  const normKey = `${food.country}|${normalizeFoodName(food.name)}`;
  const existing = normalizedNames.get(normKey);
  if (existing && existing !== food.id) {
    issues.push({
      code: "near_duplicate_name",
      detail: `${food.id} ≈ ${existing}`,
      severity: "soft",
    });
  } else if (!existing) normalizedNames.set(normKey, food.id);

  if (food.category === "Lácteos" && BEVERAGE_NAMES.test(food.name.trim())) {
    issues.push({
      code: "inconsistent_category",
      detail: food.id,
      severity: "blocking",
    });
  }
  if (!food.dataSource) {
    issues.push({
      code: "missing_data_source",
      detail: food.id,
      severity: "blocking",
    });
  } else if (!VALID.has(food.dataSource)) {
    issues.push({
      code: "invalid_data_source",
      detail: `${food.id}=${food.dataSource}`,
      severity: "blocking",
    });
  }

  if (food.grams > 0 && food.carbsG > 0) {
    const density = (food.carbsG / food.grams) * 100;
    if (
      density > 95 &&
      food.category !== "Dulce" &&
      !/azúcar|miel|sirope/i.test(food.name)
    ) {
      issues.push({
        code: "out_of_range_carbs_density",
        detail: `${food.id} ${density.toFixed(0)}g/100g`,
        severity: "soft",
      });
    }
  }
}

const blocking = issues.filter((i) => i.severity === "blocking");
const soft = issues.filter((i) => i.severity === "soft");
const byCode = {};
for (const i of issues) byCode[i.code] = (byCode[i.code] || 0) + 1;

console.log(
  JSON.stringify(
    { total: issues.length, blocking: blocking.length, soft: soft.length, byCode, issues },
    null,
    2,
  ),
);
if (blocking.length) {
  console.error(`FAIL: ${blocking.length} blocking issue(s)`);
  process.exit(1);
}
console.log(`OK: no blocking catalog issues (${soft.length} soft warning(s))`);
