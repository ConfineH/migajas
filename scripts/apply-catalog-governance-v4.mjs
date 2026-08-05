/**
 * Adds provenanceCode + portionBasis to all foods; small consistency fixes.
 * Run: node scripts/apply-catalog-governance-v4.mjs
 */
import fs from "node:fs";

const path = "src/lib/data/foods.json";
const foods = JSON.parse(fs.readFileSync(path, "utf8"));

function provenanceFromDataSource(dataSource) {
  switch (dataSource) {
    case "bedca_aligned":
      return "B";
    case "bedca_standard_recipe":
      return "R";
    case "label_or_typical":
      return "E";
    case "multi_source":
    case "pedagogical_estimate":
    default:
      return "P";
  }
}

function inferPortionBasis(f) {
  if (f.category === "Bebida" || /zumo|cerveza|vino|leche|café|te|té|agua/i.test(f.name)) {
    if (f.category === "Lácteos" || /leche|yogur|nata|helado/i.test(f.name)) {
      // milk etc stay beverage if liquid
      if (/leche|zumo|cerveza|vino|agua|café|te|té|bebida/i.test(f.name)) return "beverage";
    }
    if (f.category === "Bebida") return "beverage";
  }
  if (f.itemType === "mixed" || f.category === "Plato mixto") return "prepared_dish";
  if (f.category === "Legumbres") {
    if (/hummus/i.test(f.name)) return "prepared_dish";
    return "cooked";
  }
  if (f.category === "Cereales") {
    if (/tortita|galleta|barrita|donut|gofre|magdalena|bizcocho|muesli|pan rallado/i.test(f.name)) {
      return "commercial_unit";
    }
    return "cooked";
  }
  if (f.category === "Tubérculos") {
    if (/nachos|fritas bolsa|frita/i.test(f.name)) return "commercial_unit";
    return "cooked";
  }
  if (f.category === "Fruta") {
    if (/zumo|compota|almíbar|pasas|dátil/i.test(f.name)) {
      if (/zumo/i.test(f.name)) return "beverage";
      if (/compota|almíbar/i.test(f.name)) return "prepared_dish";
      return "commercial_unit";
    }
    return "edible";
  }
  if (f.category === "Verdura") return "cooked"; // listed as prepared/served portions; leafy often raw but grams are edible
  if (f.category === "Pan") {
    if (/100 g/i.test(f.portionText) || f.grams === 100) return "commercial_unit";
    return "commercial_unit";
  }
  if (f.category === "Dulce" || f.category === "Salsa" || f.category === "Embutido") {
    return "commercial_unit";
  }
  if (f.itemType === "modulator") return "commercial_unit";
  return "edible";
}

// Leafy/raw veg: edible is better than cooked
const RAWISH_VEG = /lechuga|pepino|tomate|pimiento|apio|champi|calabacín|ensalada/i;

let next = foods.map((f) => {
  const provenanceCode = f.provenanceCode || provenanceFromDataSource(f.dataSource);
  let portionBasis = f.portionBasis || inferPortionBasis(f);
  if (f.category === "Verdura" && RAWISH_VEG.test(f.name) && !/cocid/i.test(f.name)) {
    portionBasis = "edible";
  }
  if (f.category === "Verdura" && /cocid/i.test(f.name)) {
    portionBasis = "cooked";
  }

  const patch = {
    ...f,
    provenanceCode,
    portionBasis,
  };

  if (f.id === "es-alubias") {
    patch.name = "Alubias blancas cocidas";
    patch.portionBasis = "cooked";
  }

  // Fruit methodology note (once)
  if (f.category === "Fruta" && portionBasis === "edible" && !/parte comestible|comestible/i.test(f.notes || "")) {
    patch.notes = [f.notes, "Porción sobre parte comestible habitual."]
      .filter(Boolean)
      .join(" ");
  }

  return patch;
});

// Add alcohol-free beer if missing
if (!next.some((f) => f.id === "cerveza-sin-alcohol")) {
  next.push({
    id: "cerveza-sin-alcohol",
    country: "España",
    category: "Bebida",
    name: "Cerveza sin alcohol",
    portionText: "1 caña (200 ml)",
    grams: 200,
    carbsG: 5,
    difficulty: "Media",
    itemType: "base",
    notes:
      "Valor educativo estándar (~5 g HC / 200 ml). Varía según marca; lee la etiqueta. Diferenciada de la cerveza lager con alcohol.",
    dataSource: "label_or_typical",
    provenanceCode: "E",
    portionBasis: "beverage",
    countingPolicy: "always_count",
  });
}

fs.writeFileSync(path, JSON.stringify(next, null, 2) + "\n");
console.log("foods", foods.length, "→", next.length);
