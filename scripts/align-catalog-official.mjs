/**
 * Align catalog HC with official high-reputation tables.
 * ES: Murillo (Fundación para la Salud / CIBERDEM) + BEDCA — 10 g = 1 ración
 * RD: USDA FDC + INCAP TCA + ADA/CDC 15 g carbohydrate choice — 15 g = 1 ración
 *
 * Re-run: node scripts/align-catalog-official.mjs
 */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const path = join(root, "src/lib/data/foods.json");
const foods = JSON.parse(readFileSync(path, "utf8"));

function round1(n) {
  return Math.round(n * 10) / 10;
}

function carbsFromDensity(grams, hcPer100) {
  return Math.round((grams * hcPer100) / 100);
}

function scaleFiber(food, nextGrams) {
  if (food.fiberG == null || !food.grams) return food.fiberG;
  return round1((food.fiberG / food.grams) * nextGrams);
}

function patch(id, fields) {
  const food = foods.find((item) => item.id === id);
  if (!food) {
    console.error("missing", id);
    process.exitCode = 1;
    return;
  }
  if (fields.grams != null && fields.grams !== food.grams && food.fiberG != null) {
    food.fiberG = scaleFiber(food, fields.grams);
  }
  Object.assign(food, fields);
}

const MURILLO =
  "Murillo 3ª ed. (Fundación para la Salud / CIBERDEM) + BEDCA. ES: 10 g HC = 1 ración. HC totales.";
const USDA = "USDA FoodData Central (SR Legacy). RD: 15 g HC = 1 ración. HC totales (no se resta fibra).";
const ADA_MILK =
  "ADA Choose Your Foods / CDC: 1 taza de leche ≈ 12 g HC (no 15). USDA ~4,8 g/100 ml.";

// --- España: densidad de Murillo (g de alimento que contienen 10 g HC) ---
patch("pan-blanco", {
  grams: 20,
  carbsG: 10,
  portionText: "1 rebanada (20 g)",
  notes: `${MURILLO} Pan blanco: 20 g = 1 ración.`,
  sourceId: "murillo-raciones",
  dataSource: "bedca_aligned",
  provenanceCode: "B",
});
patch("pan-integral", {
  grams: 23,
  carbsG: 10,
  portionText: "1 rebanada (23 g)",
  notes: `${MURILLO} Pan de trigo de grano entero: 23 g = 1 ración.`,
  sourceId: "murillo-raciones",
  dataSource: "bedca_aligned",
  provenanceCode: "B",
});
patch("barra-pequena", {
  grams: 30,
  carbsG: 15,
  notes: `${MURILLO} Pan blanco 50 g HC/100 g → 30 g = 1,5 raciones.`,
  sourceId: "murillo-raciones",
});
patch("arroz-cocido", {
  grams: 38,
  carbsG: 10,
  portionText: "1 ración (38 g hervido)",
  notes: `${MURILLO} Arroz blanco hervido: 38 g = 1 ración.`,
  sourceId: "murillo-raciones",
  dataSource: "bedca_aligned",
  provenanceCode: "B",
});
patch("pasta-cocida", {
  grams: 45,
  carbsG: 10,
  name: "Pasta cocida",
  portionText: "1 ración (45 g hervida)",
  notes: `${MURILLO} Pasta alimenticia hervida: 45 g = 1 ración.`,
  sourceId: "murillo-raciones",
  dataSource: "bedca_aligned",
  provenanceCode: "B",
});
patch("couscous-cocido", {
  grams: 45,
  carbsG: 10,
  name: "Cuscús cocido",
  portionText: "1 ración (45 g)",
  notes: `${MURILLO} Cuscús cocido: 45 g = 1 ración.`,
  sourceId: "murillo-raciones",
});
patch("patata-cocida", {
  grams: 65,
  carbsG: 10,
  portionText: "1 ración (65 g hervida)",
  notes: `${MURILLO} Patata hervida: 65 g = 1 ración.`,
  sourceId: "murillo-raciones",
});
patch("boniato", {
  grams: 50,
  carbsG: 10,
  portionText: "1 ración (50 g)",
  notes: `${MURILLO} Boniato: 50 g = 1 ración.`,
  sourceId: "murillo-raciones",
});
patch("lentejas-cocidas", {
  grams: 100,
  carbsG: 20,
  portionText: "1/2 taza (100 g cocidas)",
  notes: `${MURILLO} Lentejas hervidas: 50 g = 1 ración → 100 g = 2 raciones. No usar el intercambio ADA de 15 g en España.`,
  sourceId: "murillo-raciones",
});
patch("garbanzos-cocidos", {
  grams: 100,
  carbsG: 18,
  notes: `${MURILLO} Garbanzo hervido: 55 g = 1 ración → 100 g ≈ 1,8 raciones.`,
  sourceId: "murillo-raciones",
});
patch("alubias-cocidas", {
  grams: 100,
  carbsG: 18,
  notes: `${MURILLO} Judías blancas hervidas: 55 g = 1 ración → 100 g ≈ 1,8 raciones.`,
  sourceId: "murillo-raciones",
});
patch("manzana", {
  grams: 150,
  carbsG: 15,
  name: "Manzana",
  portionText: "1 unidad mediana (150 g comestible)",
  notes: `${MURILLO} Manzana: 100 g = 1 ración → 150 g = 1,5 raciones. Parte comestible.`,
  sourceId: "murillo-raciones",
});
patch("naranja", {
  grams: 150,
  carbsG: 15,
  name: "Naranja",
  portionText: "1 unidad mediana (150 g comestible)",
  notes: `${MURILLO} Naranja: 100 g = 1 ración → 150 g = 1,5 raciones.`,
  sourceId: "murillo-raciones",
});
patch("platano", {
  grams: 75,
  carbsG: 15,
  name: "Plátano",
  portionText: "1 unidad pequeña (75 g comestible)",
  notes: `${MURILLO} Plátano: 50 g = 1 ración → 75 g = 1,5 raciones.`,
  sourceId: "murillo-raciones",
});
patch("yogur-natural", {
  notes: `${MURILLO} Yogur natural: 200 g = 1 ración → unidad 125 g = 0,5 raciones.`,
  sourceId: "murillo-raciones",
});
patch("leche", {
  grams: 250,
  carbsG: 13,
  notes: `${MURILLO} Leche: 200 ml = 1 ración → 250 ml ≈ 1,3 raciones.`,
  sourceId: "murillo-raciones",
});
patch("leche-semi-200ml", {
  notes: `${MURILLO} Leche semidesnatada: vaso 200 ml = 1 ración.`,
  sourceId: "murillo-raciones",
});
patch("pan-molde", {
  grams: 25,
  carbsG: 12,
  portionText: "1 rebanada (25 g)",
  notes: `${MURILLO} Pan de molde: 20 g = 1 ración; rebanada 25 g = 1,2 raciones.`,
  sourceId: "murillo-raciones",
});
patch("arroz-cocido-150g", {
  carbsG: 39,
  notes: `${MURILLO} Arroz hervido 26,3 g HC/100 g → 150 g ≈ 3,9 raciones.`,
  sourceId: "murillo-raciones",
});
patch("pasta-cocida-140g", {
  carbsG: 31,
  notes: `${MURILLO} Pasta hervida 22,2 g HC/100 g → 140 g ≈ 3,1 raciones.`,
  sourceId: "murillo-raciones",
});
patch("arroz-integral-cocido-150g", {
  carbsG: 38,
  notes: `${MURILLO} Arroz integral hervido: 40 g = 1 ración → 150 g ≈ 3,8 raciones.`,
  sourceId: "murillo-raciones",
});
patch("patata-cocida-150g", {
  carbsG: 23,
  notes: `${MURILLO} Patata hervida 15,4 g HC/100 g → 150 g ≈ 2,3 raciones.`,
  sourceId: "murillo-raciones",
});
patch("boniato-asado-130g", {
  carbsG: 26,
  notes: `${MURILLO} Boniato 20 g HC/100 g → 130 g ≈ 2,6 raciones.`,
  sourceId: "murillo-raciones",
});
patch("lentejas-cocidas-200g", {
  carbsG: 40,
  notes: `${MURILLO} Lentejas hervidas 20 g HC/100 g → 200 g = 4 raciones.`,
  sourceId: "murillo-raciones",
});
patch("es-boniato", {
  carbsG: 20,
  notes: `${MURILLO} Boniato: 50 g = 1 ración → 100 g = 2 raciones.`,
  sourceId: "murillo-raciones",
});
patch("es-alubias", {
  carbsG: 18,
  notes: `${MURILLO} Judías blancas hervidas: 55 g = 1 ración → 100 g ≈ 1,8 raciones.`,
  sourceId: "murillo-raciones",
});
patch("guisantes-cocidos", {
  carbsG: carbsFromDensity(foods.find((f) => f.id === "guisantes-cocidos")?.grams ?? 100, 10),
  notes: `${MURILLO} Guisantes: 100 g = 1 ración.`,
  sourceId: "murillo-raciones",
});
patch("pan-integral-100g", {
  carbsG: 43,
  notes: `${MURILLO} Pan de grano entero ≈ 43 g HC/100 g.`,
  sourceId: "murillo-raciones",
});
patch("es-molde-integral", {
  grams: 23,
  carbsG: 10,
  notes: `${MURILLO} Pan integral: 23 g = 1 ración.`,
  sourceId: "murillo-raciones",
});

const patataFrita = foods.find((f) => f.id === "patata-frita");
if (patataFrita) {
  patch("patata-frita", {
    carbsG: carbsFromDensity(patataFrita.grams, 33.3),
    notes: `${MURILLO} Patatas fritas: 30 g = 1 ración (33 g HC/100 g).`,
    sourceId: "murillo-raciones",
  });
}
for (const id of ["patatas-fritas-150g", "patatas-fritas-100g"]) {
  const food = foods.find((item) => item.id === id);
  if (!food) continue;
  patch(id, {
    carbsG: carbsFromDensity(food.grams, 33.3),
    notes: `${MURILLO} Patatas fritas: 30 g = 1 ración.`,
    sourceId: "murillo-raciones",
  });
}

// --- República Dominicana: composición USDA/INCAP; raciones ÷ 15 ---
patch("casabe", {
  grams: 19,
  carbsG: 15,
  portionText: "1 pieza (19 g)",
  notes: `${USDA} Casabe (pan de yuca seco) ≈ 80 g HC/100 g → 19 g = 1 ración RD.`,
  sourceId: "usda-fdc",
  dataSource: "usda_fdc",
  provenanceCode: "I",
});
patch("arroz-blanco-do", {
  grams: 53,
  carbsG: 15,
  portionText: "1/3 taza (53 g cocido)",
  notes: `${USDA} Arroz blanco cocido 28,2 g HC/100 g (FDC 169753). ADA/CDC: 1/3 taza = 1 elección de 15 g.`,
  sourceId: "usda-fdc",
  dataSource: "usda_fdc",
  provenanceCode: "I",
});
patch("habichuelas-rojas", {
  grams: 100,
  carbsG: 23,
  portionText: "1/2 taza (100 g cocidas)",
  notes: `${USDA} Habichuela roja cocida ≈ 22,8 g HC/100 g (HC totales). 100 g ≈ 1,5 raciones RD. El intercambio ADA de 15 g aproxima HC disponibles, no totales.`,
  sourceId: "usda-fdc",
  dataSource: "usda_fdc",
  provenanceCode: "I",
});
patch("guandules", {
  grams: 100,
  carbsG: 23,
  notes: `${USDA} Gandul/guandul cocido ≈ 23 g HC/100 g.`,
  sourceId: "usda-fdc",
  dataSource: "usda_fdc",
  provenanceCode: "I",
});
patch("do-habichuelas-negras", {
  carbsG: 23,
  notes: `${USDA} Habichuela negra cocida ≈ 23 g HC/100 g.`,
  sourceId: "usda-fdc",
  dataSource: "usda_fdc",
  provenanceCode: "I",
});
patch("do-habichuelas-blancas", {
  carbsG: 23,
  notes: `${USDA} Habichuela blanca cocida ≈ 23 g HC/100 g.`,
  sourceId: "usda-fdc",
  dataSource: "usda_fdc",
  provenanceCode: "I",
});
patch("do-lentejas-do", {
  carbsG: 20,
  notes: `${MURILLO} Lentejas hervidas 20 g HC/100 g (misma composición; en RD 20 g = 1,3 raciones de 15 g).`,
  sourceId: "murillo-raciones",
  dataSource: "usda_fdc",
  provenanceCode: "I",
});
patch("do-yuca", {
  grams: 50,
  carbsG: 15,
  portionText: "1/3 taza (50 g cocida)",
  notes: `${MURILLO} Yuca cocida: 33 g = 10 g HC (30,3 g/100 g). ADA/CDC: 1/3 taza de yuca = 1 elección. 50 g ≈ 15 g HC = 1 ración RD.`,
  sourceId: "murillo-raciones",
  dataSource: "usda_fdc",
  provenanceCode: "I",
});
patch("mangu", {
  grams: 100,
  carbsG: 31,
  portionText: "1/2 taza (100 g)",
  notes: `${USDA} Plátano verde cocido/majado ≈ 31 g HC/100 g. 100 g ≈ 2 raciones RD.`,
  sourceId: "usda-fdc",
  dataSource: "usda_fdc",
  provenanceCode: "I",
});
patch("do-mangú", {
  grams: 200,
  carbsG: 62,
  portionText: "1 plato (200 g)",
  notes: "Receta estándar: 200 g de mangú (plátano verde majado, USDA 31 g HC/100 g). ≈ 4 raciones RD.",
  sourceId: "usda-fdc",
  dataSource: "pedagogical_estimate",
  provenanceCode: "R",
});
patch("guineo-verde", {
  grams: 50,
  carbsG: 16,
  portionText: "1/3 taza (50 g cocido)",
  notes: `${USDA} Guineo verde cocido ≈ 32 g HC/100 g. ADA: 1/3 taza de plátano = 1 elección.`,
  sourceId: "usda-fdc",
  dataSource: "usda_fdc",
  provenanceCode: "I",
});
patch("yautia", {
  grams: 45,
  carbsG: 15,
  portionText: "1/3 taza (45 g cocida)",
  notes: `${USDA} Yautía/malanga cocida (taro) ≈ 34,6 g HC/100 g → 45 g ≈ 1 ración RD.`,
  sourceId: "usda-fdc",
  dataSource: "usda_fdc",
  provenanceCode: "I",
});
patch("batata-do", {
  grams: 75,
  carbsG: 15,
  notes: `${MURILLO} Boniato/batata 20 g HC/100 g → 75 g = 1 ración RD. ADA: 1/2 taza de batata ≈ 15 g.`,
  sourceId: "murillo-raciones",
  dataSource: "usda_fdc",
  provenanceCode: "I",
});
patch("tostones", {
  grams: 50,
  carbsG: 20,
  notes: `${USDA} Plátano verde frito (tostones) ≈ 40 g HC/100 g → 50 g ≈ 1,3 raciones RD.`,
  sourceId: "usda-fdc",
  dataSource: "usda_fdc",
  provenanceCode: "I",
});
patch("do-tostones", {
  grams: 60,
  carbsG: 24,
  notes: `${USDA} Tostones ≈ 40 g HC/100 g → 60 g ≈ 1,6 raciones RD.`,
  sourceId: "usda-fdc",
  dataSource: "usda_fdc",
  provenanceCode: "I",
});
patch("platano-maduro", {
  grams: 50,
  carbsG: 16,
  portionText: "1/3 taza o 1/2 unidad (50 g)",
  notes: `${USDA} Plátano maduro cocido ≈ 31 g HC/100 g. ADA: 1/3 taza = 1 elección.`,
  sourceId: "usda-fdc",
  dataSource: "usda_fdc",
  provenanceCode: "I",
});
patch("mango", {
  grams: 100,
  carbsG: 15,
  portionText: "1/2 unidad o 1 taza (100 g comestible)",
  notes: `${USDA} Mango crudo ≈ 15 g HC/100 g = 1 ración RD.`,
  sourceId: "usda-fdc",
  dataSource: "usda_fdc",
  provenanceCode: "I",
});
patch("chinola", {
  grams: 65,
  carbsG: 15,
  notes: `${USDA} Maracuyá/chinola ≈ 23 g HC/100 g → 65 g ≈ 1 ración RD.`,
  sourceId: "usda-fdc",
  dataSource: "usda_fdc",
  provenanceCode: "I",
});
patch("do-banana", {
  grams: 66,
  carbsG: 15,
  portionText: "1 unidad pequeña (66 g comestible)",
  notes: `${USDA} Banana ≈ 22,8 g HC/100 g → 66 g = 1 ración RD.`,
  sourceId: "usda-fdc",
  dataSource: "usda_fdc",
  provenanceCode: "I",
});
patch("leche-do", {
  notes: ADA_MILK,
  sourceId: "ada-carb-choice",
  dataSource: "usda_fdc",
  provenanceCode: "I",
});
patch("do-yogur-do", {
  notes: `${USDA} Yogur natural ≈ 4,7–6 g HC/100 g. Unidad 125 g ≈ 8 g ≈ 0,5 raciones RD.`,
  sourceId: "usda-fdc",
  dataSource: "usda_fdc",
  provenanceCode: "I",
});
patch("pan-sobao", {
  grams: 40,
  carbsG: 20,
  notes: `${USDA} Pan de trigo ≈ 50 g HC/100 g → 40 g = 20 g HC ≈ 1,3 raciones RD.`,
  sourceId: "usda-fdc",
  dataSource: "usda_fdc",
  provenanceCode: "I",
});
patch("do-pan-sobao", {
  grams: 50,
  carbsG: 25,
  notes: `${USDA} Pan ≈ 50 g HC/100 g → 50 g = 25 g HC ≈ 1,7 raciones RD.`,
  sourceId: "usda-fdc",
  dataSource: "usda_fdc",
  provenanceCode: "I",
});
patch("do-pan-agua", {
  grams: 50,
  carbsG: 25,
  notes: `${USDA} Pan de agua ≈ 50 g HC/100 g → 50 g = 25 g HC ≈ 1,7 raciones RD.`,
  sourceId: "usda-fdc",
  dataSource: "usda_fdc",
  provenanceCode: "I",
});
patch("moro-habichuelas", {
  grams: 250,
  carbsG: 60,
  notes:
    "Receta estándar educativa: ~180 g arroz cocido (51 g HC, USDA 28,2 %) + ~70 g habichuelas (16 g HC). ≈ 4 raciones RD. Varía según el moro.",
  sourceId: "usda-fdc",
  dataSource: "pedagogical_estimate",
  provenanceCode: "R",
});
patch("la-bandera", {
  grams: 350,
  carbsG: 65,
  notes:
    "Receta estándar educativa: 150 g arroz cocido (42 g) + 100 g habichuelas (23 g) + carne (0). ≈ 4,3 raciones RD. No es un valor de etiquetado.",
  sourceId: "usda-fdc",
  dataSource: "pedagogical_estimate",
  provenanceCode: "R",
});
patch("pollo-do", {
  notes: "Modulador. Pollo sin empanar: 0 g HC (USDA). No suma raciones.",
  sourceId: "usda-fdc",
  dataSource: "usda_fdc",
  provenanceCode: "I",
});
patch("do-huevo-do", {
  notes: "Modulador. Huevo: <1 g HC. No suma raciones.",
  sourceId: "usda-fdc",
  dataSource: "usda_fdc",
  provenanceCode: "I",
});

const doName = foods.find((f) => f.id === "do-name");
if (doName) {
  patch("do-name", {
    carbsG: carbsFromDensity(doName.grams, 27.5),
    notes: `${USDA} Ñame cocido ≈ 27,5 g HC/100 g.`,
    sourceId: "usda-fdc",
    dataSource: "usda_fdc",
    provenanceCode: "I",
  });
}

const hallulla = foods.find((f) => f.id === "do-hallulla");
if (hallulla) {
  patch("do-hallulla", {
    carbsG: carbsFromDensity(hallulla.grams, 50),
    notes: `${USDA} Pan ≈ 50 g HC/100 g. Hallulla no es pan típico dominicano; se mantiene como pan genérico.`,
    sourceId: "usda-fdc",
    dataSource: "usda_fdc",
    provenanceCode: "I",
  });
}

if (!foods.some((f) => f.id === "do-agua")) {
  foods.push({
    id: "do-agua",
    country: "República Dominicana",
    category: "Bebida",
    name: "Agua",
    portionText: "1 vaso",
    grams: 250,
    carbsG: 0,
    difficulty: "Baja",
    itemType: "modulator",
    notes: "Modulador. 0 g de carbohidratos.",
    dataSource: "usda_fdc",
    countingPolicy: "always_count",
    provenanceCode: "I",
    portionBasis: "beverage",
    sourceId: "usda-fdc",
  });
}

if (!foods.some((f) => f.id === "do-aceite")) {
  foods.push({
    id: "do-aceite",
    country: "República Dominicana",
    category: "Grasa",
    name: "Aceite",
    portionText: "1 cucharada",
    grams: 10,
    carbsG: 0,
    difficulty: "Baja",
    itemType: "modulator",
    notes: "Modulador. El aceite no suma raciones; sí añade grasa al plato.",
    dataSource: "usda_fdc",
    countingPolicy: "always_count",
    provenanceCode: "I",
    portionBasis: "commercial_unit",
    sourceId: "usda-fdc",
  });
}

writeFileSync(path, `${JSON.stringify(foods, null, 2)}\n`);
console.log("aligned", foods.length, "foods");
