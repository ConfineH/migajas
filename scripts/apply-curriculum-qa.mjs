/**
 * One-shot catalog cleanup for pedagogical + reviewer feedback.
 * Run: node scripts/apply-curriculum-qa.mjs
 */
import fs from "node:fs";

const foodsPath = "src/lib/data/foods.json";
const foods = JSON.parse(fs.readFileSync(foodsPath, "utf8"));

/** IDs to remove (exact duplicates / worse twin; keep referenced IDs). */
const REMOVE_IDS = new Set([
  "es-paella", // identical to paella
  "es-lentejas-estofado", // identical to lentejas-estofadas
  "es-garbanzos-cocidos", // twin of garbanzos-cocidos
  "cebolla", // twin of es-cebolla (keep 8 g HC)
  "do-moro-habichuelas",
  "do-dulce-leche-do",
  "do-berenjena-do",
  "do-leche-condensada-do",
  "do-agua-coco",
]);

/** Habitually uncounted veggies (low HC in usual side portions). */
const HABITUALLY_UNCOUNTED = new Set([
  "es-lechuga",
  "lechuga",
  "es-espinacas",
  "espinacas-cocidas",
  "es-pepino",
  "pepino",
  "es-tomate",
  "es-coliflor",
  "coliflor-cocida",
  "es-apio",
  "apio",
  "es-calabacin",
  "calabacin",
  "es-champinones",
  "champinones",
  "es-pimiento",
  "pimiento",
  "ensalada-mixta",
]);

/** Always count (material HC in listed portion). */
const ALWAYS_COUNT = new Set([
  "es-brocoli",
  "brocoli-cocido",
  "judias-verdes-cocidas",
  "es-judias-verdes",
  "calabaza",
  "es-calabaza",
  "zanahoria",
  "zanahoria-cocida",
  "zanahoria-cruda",
  "maiz-grano",
  "es-cebolla",
  "guisantes-cocidos",
  "tomate", // large portion 300 g
]);

const BEVERAGE_IDS = new Set(["agua", "es-agua", "cafe-solo", "es-cafe", "te", "es-te"]);

function inferDataSource(food) {
  if (food.itemType === "mixed") return "pedagogical_estimate";
  if (/chocolate|donut|gofre|barrita|boll|croissant|pizza|bocadillo|sandwich/i.test(food.name)) {
    return "label_or_typical";
  }
  if (food.country === "España" && food.itemType === "base") return "bedca_aligned";
  if (food.country === "República Dominicana") return "multi_source";
  return "pedagogical_estimate";
}

function inferCountingPolicy(food) {
  if (HABITUALLY_UNCOUNTED.has(food.id)) return "habitually_uncounted";
  if (ALWAYS_COUNT.has(food.id)) return "always_count";
  if (food.category === "Verdura" && food.carbsG <= 5) return "habitually_uncounted";
  if (food.category === "Verdura") return "always_count";
  return "always_count";
}

const patchById = {
  bocadillo: {
    name: "Bocadillo de barra (estimado)",
    portionText: "1 unidad (~100 g de pan)",
    grams: 150,
    carbsG: 50,
    notes:
      "Estimación pedagógica: ~100 g de pan de barra ≈ 50 g HC. El relleno sin pan no suma. Varía según panadería.",
    dataSource: "pedagogical_estimate",
  },
  "bocadillo-jamon": {
    notes:
      "Estimación pedagógica alineada con ~100 g de pan (~50 g HC). El jamón no suma raciones de HC.",
    dataSource: "pedagogical_estimate",
  },
  "chocolate-negro": {
    name: "Chocolate negro (~50–60 % cacao)",
    notes:
      "Valor típico para tableta ~50–60 % cacao. Un 85 % suele aportar menos HC; lee la etiqueta.",
    dataSource: "label_or_typical",
  },
  "chocolate-leche": {
    notes: "Valor típico por 100 g de chocolate con leche; lee la etiqueta de tu marca.",
    dataSource: "label_or_typical",
  },
  "es-gazpacho": {
    notes:
      "Preparación estándar educativa (1 bol ~300 g ≈ 15 g HC). Un vaso de 250 ml de otra receta puede acercarse a ~10 g HC; los platos tradicionales varían según receta.",
    dataSource: "pedagogical_estimate",
  },
  "tortilla-patata": {
    portionText: "1 porción (~180 g)",
    notes:
      "Porción de catálogo ~180 g ≈ 20 g HC (2,0 raciones). Una porción más pequeña (~100 g) puede acercarse a ~10 g HC según cantidad de patata.",
    dataSource: "pedagogical_estimate",
  },
  "tortilla-patatas": {
    notes:
      "Porción de catálogo ~150 g ≈ 20 g HC. Varía según proporción de patata; estimación educativa.",
    dataSource: "pedagogical_estimate",
  },
  paella: {
    notes:
      "Estimación educativa de 1 plato (~300 g). Los platos tradicionales varían según receta y cantidad de arroz.",
    dataSource: "pedagogical_estimate",
  },
  // Clarify duplicate display names (keep distinct IDs / portions)
  "pan-integral": { name: "Pan integral (rebanada fina)" },
  "es-pan-integral": { name: "Pan integral (rebanada)" },
  "pan-integral-100g": { name: "Pan integral (100 g)" },
  "pasta-cocida": { name: "Pasta cocida (1/3 taza)" },
  "pasta-cocida-140g": { name: "Pasta cocida (1 taza)" },
  "couscous-cocido": { name: "Cuscús cocido (1/2 taza)" },
  "es-cuscus": { name: "Cuscús cocido (1/3 taza)" },
  "lentejas-cocidas": { name: "Lentejas cocidas (1/2 taza)" },
  "lentejas-cocidas-200g": { name: "Lentejas cocidas (1 plato)" },
  "garbanzos-cocidos": { name: "Garbanzos cocidos (1/2 taza, 100 g)" },
  "es-cebolla": { name: "Cebolla" },
  tomate: { name: "Tomate (ración grande)" },
  "es-tomate": { name: "Tomate (1 taza)" },
  "es-leche-semidesnatada": { name: "Leche semidesnatada (1 taza / 250 ml)" },
  "leche-semi-200ml": { name: "Leche semidesnatada (vaso 200 ml)" },
  "patatas-fritas-150g": { name: "Patatas fritas (ración mediana)" },
  "patatas-fritas-100g": { name: "Patatas fritas (ración pequeña)" },
  "brocoli-cocido": {
    countingPolicy: "always_count",
    notes:
      "En cantidades de guarnición pequeña a menudo no se contabiliza en algunos protocolos; la porción de catálogo (1 taza) aporta ~10 g HC y sí cuenta en Migajas.",
  },
  "judias-verdes-cocidas": {
    countingPolicy: "always_count",
    category: "Verdura",
    notes:
      "No se tratan como «libres» en Migajas: 1 taza ≈ 10 g HC (1 ración). Habitualmente no contabilizadas solo en porciones muy pequeñas según protocolo del equipo.",
  },
};

let next = foods.filter((f) => !REMOVE_IDS.has(f.id));

next = next.map((f) => {
  const patch = patchById[f.id] ?? {};
  const category =
    patch.category ??
    (BEVERAGE_IDS.has(f.id) ||
    (f.category === "Lácteos" &&
      /^(agua|café|cafe|té|te)$/i.test(f.name.trim()))
      ? "Bebida"
      : f.category);

  // Move agua/café/té by name if IDs differ
  const forceBeverage =
    category === "Lácteos" &&
    /^(agua|café solo|cafe solo|té|te)$/i.test(f.name.trim());

  return {
    ...f,
    ...patch,
    category: forceBeverage ? "Bebida" : category,
    dataSource: patch.dataSource ?? f.dataSource ?? inferDataSource({ ...f, ...patch }),
    countingPolicy:
      patch.countingPolicy ??
      f.countingPolicy ??
      inferCountingPolicy({ ...f, category: forceBeverage ? "Bebida" : category }),
  };
});

// Ensure agua/café/té named items moved
next = next.map((f) => {
  if (
    f.country === "España" &&
    f.category === "Lácteos" &&
    /agua|café|cafe|^té$|^te$/i.test(f.name)
  ) {
    return { ...f, category: "Bebida" };
  }
  return f;
});

fs.writeFileSync(foodsPath, JSON.stringify(next, null, 2) + "\n", "utf8");
console.log(
  "foods:",
  foods.length,
  "→",
  next.length,
  "removed",
  foods.length - next.length,
);
