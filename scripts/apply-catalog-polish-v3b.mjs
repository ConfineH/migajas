/**
 * Catalog polish from post-v3 reviewer feedback.
 * Run: node scripts/apply-catalog-polish-v3b.mjs
 */
import fs from "node:fs";

const foodsPath = "src/lib/data/foods.json";
const lessonsPath = "src/lib/data/lessons.json";
const exercisesPath = "src/lib/data/exercises.json";

const foods = JSON.parse(fs.readFileSync(foodsPath, "utf8"));
const lessons = JSON.parse(fs.readFileSync(lessonsPath, "utf8"));
const exercises = JSON.parse(fs.readFileSync(exercisesPath, "utf8"));

const REMOVE = new Set([
  "es-tortilla-patatas", // twin of tortilla-patata
  "pizza", // generic; keep margarita + pepperoni
]);

// Retarget refs pizza → es-pizza-es (margarita)
for (const lesson of lessons) {
  for (const step of lesson.steps || []) {
    if (step.foodId === "pizza") step.foodId = "es-pizza-es";
  }
}
for (const ex of exercises) {
  if (ex.foodId === "pizza") ex.foodId = "es-pizza-es";
}

// Lesson pizza copy
for (const lesson of lessons) {
  for (const step of lesson.steps || []) {
    if (step.id === "l4-lesson-3-s3") {
      step.title = "Pizza (margarita / pepperoni)";
      step.body =
        "1 porción de pizza margarita (~150 g) = ~30 g HC (3 raciones) por la masa. La pepperoni (~125 g) ≈ 30 g HC. Cuanto más fina la masa, menos HC. El queso y la mayoría de toppings no suman. Valores educativos estándar; varían según pizzería.";
      step.foodId = "es-pizza-es";
    }
    if (step.id === "l5-lesson-3-s1") {
      step.body =
        "1 caña de cerveza tipo lager (200 ml) ≈ 10 g HC (1 ración) — valor educativo estándar. El contenido varía según tipo (rubia, tostada, sin alcohol, artesana). Cuenta los HC de la bebida, no solo el alcohol.";
    }
    if (step.id === "l5-lesson-3-s2") {
      step.body =
        "1 copa de vino tinto seco (100 ml) ≈ 2–3 g HC (0,2–0,3 raciones) — valor educativo estándar. El vino dulce, generoso o el cava pueden aportar más. Verifica el tipo cuando puedas.";
    }
  }
}

const BEDCA_RECIPE_IDS = new Set([
  "es-gazpacho",
  "tortilla-patata",
  "paella",
  "es-fabada",
  "lentejas-estofadas",
  "es-pulpo-gallega",
]);

let next = foods.filter((f) => !REMOVE.has(f.id));

next = next.map((f) => {
  const patch = { ...f };

  if (f.id === "tortilla-patata") {
    patch.name = "Tortilla de patata";
    patch.portionText = "1 porción (~180 g)";
    patch.notes =
      "Única entrada de tortilla de patata. ~180 g ≈ 20 g HC (2,0 raciones). Una porción menor (~100–150 g) aporta menos según cantidad de patata. Estimación a partir de componentes habituales (patata + huevo); los platos varían según receta.";
    patch.dataSource = "bedca_standard_recipe";
  }

  if (f.id === "es-pulpo-gallega") {
    patch.name = "Pulpo a la gallega (con patata)";
    patch.notes =
      "Los ~10 g HC de la porción provienen casi solo de la patata; el pulpo aporta ~0 g HC. Estimación educativa de un plato estándar con patata.";
    patch.dataSource = "bedca_standard_recipe";
  }

  if (f.id === "es-pizza-es") {
    patch.name = "Pizza margarita";
    patch.notes =
      "Estimación educativa de 1 porción (~150 g). Varía según grosor de masa y pizzería.";
    patch.dataSource = "pedagogical_estimate";
  }

  if (f.id === "pizza-pepperoni") {
    patch.notes =
      "Estimación educativa de 1 porción (~125 g). Varía según grosor de masa y pizzería.";
  }

  if (f.id === "cerveza") {
    patch.name = "Cerveza lager (caña)";
    patch.notes =
      "Valor educativo estándar: caña ~200 ml ≈ 10 g HC. El contenido varía según tipo de cerveza (rubia, tostada, sin alcohol, artesana).";
    patch.dataSource = "bedca_aligned";
  }

  if (f.id === "vino-tinto") {
    patch.name = "Vino tinto seco";
    patch.notes =
      "Valor educativo estándar: copa ~100 ml ≈ 3 g HC. Vinos dulces, generosos o cava pueden aportar más.";
    patch.dataSource = "bedca_aligned";
  }

  if (BEDCA_RECIPE_IDS.has(f.id) && f.id !== "tortilla-patata" && f.id !== "es-pulpo-gallega") {
    patch.dataSource = "bedca_standard_recipe";
    if (!/varían según receta|variabilidad/i.test(patch.notes || "")) {
      patch.notes = [
        patch.notes,
        "Estimación de receta estándar a partir de componentes habituales; varía según elaboración.",
      ]
        .filter(Boolean)
        .join(" ");
    }
  }

  // Sharper provenance for basics already bedca_aligned — keep code, labels updated in domain
  return patch;
});

fs.writeFileSync(foodsPath, JSON.stringify(next, null, 2) + "\n");
fs.writeFileSync(lessonsPath, JSON.stringify(lessons, null, 2) + "\n");
fs.writeFileSync(exercisesPath, JSON.stringify(exercises, null, 2) + "\n");
console.log("foods", foods.length, "→", next.length);
