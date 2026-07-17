import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const dataDir = join(root, "src/lib/data");

function lesson(id, levelId, orderIndex, title, summary, contentSteps, exerciseId, exampleFoodId) {
  const steps = contentSteps.map((s, i) => ({
    id: `${id}-s${i + 1}`,
    type: s.foodId ? "example" : "explanation",
    title: s.title,
    body: s.body,
    ...(s.foodId ? { foodId: s.foodId } : {}),
  }));
  steps.push({
    id: `${id}-practice`,
    type: "practice",
    title: "Practica ahora",
    body: "Comprueba lo aprendido con un ejercicio rápido.",
    exerciseId,
  });
  if (exampleFoodId && !steps.some((s) => s.foodId === exampleFoodId)) {
    const lastContent = steps[steps.length - 2];
    if (lastContent && !lastContent.foodId) lastContent.foodId = exampleFoodId;
  }
  return { id, levelId, orderIndex, title, summary, steps };
}

function opt(id, label, value, isCorrect) {
  return { id, label, value, isCorrect };
}

function rationOpts(values, correct) {
  const ids = ["a", "b", "c", "d"];
  return values.map((v, i) =>
    opt(ids[i], `${String(v).replace(".", ",")} raciones`, String(v), v === correct),
  );
}

function numOpts(values, correct) {
  const ids = ["a", "b", "c", "d"];
  return values.map((v, i) =>
    opt(ids[i], String(v).replace(".", ","), String(v), v === correct),
  );
}

const NEW_FOODS = [
  { id: "pan-molde", country: "España", category: "Pan", name: "Pan de molde", portionText: "1 rebanada", grams: 30, carbsG: 12, difficulty: "Baja", itemType: "base", notes: "Base" },
  { id: "aceite-oliva", country: "España", category: "Grasa", name: "Aceite de oliva", portionText: "1 cucharada", grams: 10, carbsG: 0, difficulty: "Baja", itemType: "modulator", notes: "Modulador" },
  { id: "pan-integral-100g", country: "España", category: "Pan", name: "Pan integral", portionText: "100 g", grams: 100, carbsG: 45, difficulty: "Media", itemType: "base", notes: "8 g fibra/100 g (BEDCA)" },
  { id: "arroz-cocido-150g", country: "España", category: "Cereales", name: "Arroz blanco cocido", portionText: "1 taza (150 g)", grams: 150, carbsG: 40, difficulty: "Baja", itemType: "base", notes: "BEDCA" },
  { id: "pasta-cocida-140g", country: "España", category: "Cereales", name: "Pasta cocida", portionText: "1 taza (140 g)", grams: 140, carbsG: 35, difficulty: "Baja", itemType: "base", notes: "BEDCA" },
  { id: "arroz-integral-cocido-150g", country: "España", category: "Cereales", name: "Arroz integral cocido", portionText: "1 taza (150 g)", grams: 150, carbsG: 38, difficulty: "Baja", itemType: "base", notes: "BEDCA" },
  { id: "patata-cocida-150g", country: "España", category: "Tubérculos", name: "Patata cocida", portionText: "1 patata mediana (150 g)", grams: 150, carbsG: 25, difficulty: "Baja", itemType: "base", notes: "BEDCA" },
  { id: "boniato-asado-130g", country: "España", category: "Tubérculos", name: "Boniato asado", portionText: "1 boniato pequeño (130 g)", grams: 130, carbsG: 26, difficulty: "Media", itemType: "base", notes: "BEDCA" },
  { id: "lentejas-cocidas-200g", country: "España", category: "Legumbres", name: "Lentejas cocidas", portionText: "1 plato (200 g)", grams: 200, carbsG: 24, difficulty: "Media", itemType: "base", notes: "12 g HC/100 g, 5 g fibra/100 g" },
  { id: "maiz-grano", country: "España", category: "Verdura", name: "Maíz en grano", portionText: "100 g", grams: 100, carbsG: 19, difficulty: "Media", itemType: "base", notes: "BEDCA" },
  { id: "guisantes-cocidos", country: "España", category: "Verdura", name: "Guisantes cocidos", portionText: "100 g", grams: 100, carbsG: 14, difficulty: "Baja", itemType: "base", notes: "BEDCA" },
  { id: "pina-almibar", country: "España", category: "Fruta", name: "Piña en almíbar", portionText: "100 g", grams: 100, carbsG: 20, difficulty: "Media", itemType: "base", notes: "BEDCA" },
  { id: "ensalada-mixta", country: "España", category: "Verdura", name: "Ensalada mixta", portionText: "100 g", grams: 100, carbsG: 5, difficulty: "Baja", itemType: "base", notes: "Verdura libre" },
  { id: "ketchup", country: "España", category: "Salsa", name: "Kétchup", portionText: "1 cucharada", grams: 15, carbsG: 4, difficulty: "Baja", itemType: "base", notes: "BEDCA" },
  { id: "calamares-romana", country: "España", category: "Plato mixto", name: "Calamares a la romana", portionText: "100 g", grams: 100, carbsG: 15, difficulty: "Alta", itemType: "mixed", notes: "Rebozado" },
  { id: "pasta-carbonara", country: "España", category: "Plato mixto", name: "Pasta carbonara", portionText: "1 plato", grams: 250, carbsG: 45, difficulty: "Alta", itemType: "mixed", notes: "BEDCA" },
  { id: "pizza-pepperoni", country: "España", category: "Plato mixto", name: "Pizza pepperoni", portionText: "1 porción", grams: 125, carbsG: 30, difficulty: "Alta", itemType: "mixed", notes: "BEDCA" },
  { id: "tostadas-pan", country: "España", category: "Pan", name: "Tostadas de pan", portionText: "2 unidades", grams: 50, carbsG: 20, difficulty: "Baja", itemType: "base", notes: "BEDCA" },
  { id: "nueces", country: "España", category: "Grasa", name: "Nueces", portionText: "30 g", grams: 30, carbsG: 3, difficulty: "Baja", itemType: "modulator", notes: "Modulador" },
  { id: "cerveza", country: "España", category: "Bebida", name: "Cerveza", portionText: "1 caña (200 ml)", grams: 200, carbsG: 10, difficulty: "Media", itemType: "base", notes: "BEDCA" },
  { id: "vino-tinto", country: "España", category: "Bebida", name: "Vino tinto", portionText: "1 copa (100 ml)", grams: 100, carbsG: 3, difficulty: "Baja", itemType: "base", notes: "BEDCA" },
  { id: "tarta-cumpleanos", country: "España", category: "Dulce", name: "Tarta de cumpleaños", portionText: "100 g", grams: 100, carbsG: 45, difficulty: "Alta", itemType: "base", notes: "BEDCA" },
  { id: "chocolate-leche", country: "España", category: "Dulce", name: "Chocolate con leche", portionText: "100 g", grams: 100, carbsG: 50, difficulty: "Media", itemType: "base", notes: "BEDCA" },
  { id: "bocadillo-jamon", country: "España", category: "Plato mixto", name: "Bocadillo de jamón", portionText: "1 unidad", grams: 150, carbsG: 50, difficulty: "Alta", itemType: "mixed", notes: "100 g pan de barra" },
  { id: "patatas-fritas-150g", country: "España", category: "Tubérculos", name: "Patatas fritas", portionText: "ración mediana (150 g)", grams: 150, carbsG: 38, difficulty: "Media", itemType: "base", notes: "BEDCA" },
  { id: "patatas-fritas-100g", country: "España", category: "Tubérculos", name: "Patatas fritas", portionText: "ración pequeña (100 g)", grams: 100, carbsG: 25, difficulty: "Media", itemType: "base", notes: "BEDCA" },
  { id: "leche-semi-200ml", country: "España", category: "Lácteos", name: "Leche semidesnatada", portionText: "1 vaso (200 ml)", grams: 200, carbsG: 10, difficulty: "Baja", itemType: "base", notes: "BEDCA" },
  { id: "tomate-frito", country: "España", category: "Salsa", name: "Tomate frito", portionText: "2 cucharadas (50 g)", grams: 50, carbsG: 6, difficulty: "Media", itemType: "base", notes: "BEDCA" },
  { id: "embutido-almidon", country: "España", category: "Embutido", name: "Embutido con almidón", portionText: "2 lonchas (50 g)", grams: 50, carbsG: 8, difficulty: "Media", itemType: "base", notes: "BEDCA — relleno con fécula" },
  { id: "salsa-barbacoa", country: "España", category: "Salsa", name: "Salsa barbacoa", portionText: "1 cucharada (15 g)", grams: 15, carbsG: 6, difficulty: "Media", itemType: "base", notes: "BEDCA" },
];

const LESSONS = [
  lesson("l1-lesson-1", "nivel-1", 1, "Qué es una ración (10 g HC = 1 ración)", "Aprende el concepto básico de ración de carbohidratos y por qué 10 g es el estándar en España.", [
    { title: "¿Qué es una ración?", body: "Una ración de carbohidratos son 10 gramos de HC. Es la medida que usan los médicos en España para contar lo que comes." },
    { title: "¿Por qué 10 gramos?", body: "Porque 10 g de HC elevan la glucemia de forma parecida en la mayoría de personas. Así puedes comparar manzanas con pan o arroz." },
    { title: "Ejemplo rápido", body: "1 rebanada pequeña de pan = ~10 g HC = 1 ración. 1 manzana mediana = ~15 g HC = 1,5 raciones.", foodId: "pan-molde" },
    { title: "Tu objetivo", body: "Al final de esta lección sabrás identificar cuántas raciones tiene un alimento simple." },
  ], "ex-l1-1-basic-ration"),
  lesson("l1-lesson-2", "nivel-1", 2, "Gramos del alimento vs gramos de carbohidratos", "No todo el peso del alimento es carbohidrato. Aprende a leer etiquetas y tablas nutricionales.", [
    { title: "La confusión más común", body: "100 g de pan NO son 100 g de carbohidratos. El pan tiene agua, proteína, grasa y HC. Solo contamos los HC." },
    { title: "Cómo leer la etiqueta", body: 'Busca "Hidratos de carbono" en la tabla nutricional. Ese número (por 100 g) es lo que te importa. Ignora el peso total del alimento.' },
    { title: "Fórmula mágica", body: "(Gramos de alimento × HC por 100 g) ÷ 100 = Gramos de HC. Luego divide por 10 para obtener raciones." },
    { title: "Ejemplo con yogur", body: "125 g de yogur natural × 5 g HC/100 g = 6,25 g HC ≈ 0,6 raciones. ¡No son 12,5 raciones!", foodId: "yogur-natural" },
  ], "ex-l1-2-label-reading"),
  lesson("l1-lesson-3", "nivel-1", 3, 'Proteínas y grasas: los "moduladores" (0 raciones)', "Carne, pollo, huevo, pescado y aceites no cuentan como carbohidratos. Pero afectan cómo absorbes los HC.", [
    { title: "¿Qué son los moduladores?", body: "Son alimentos con 0 o casi 0 carbohidratos: pollo, carne, huevo, pescado, aceite, mantequilla. No suman raciones." },
    { title: "¿Por qué importan?", body: "Las proteínas y grasas retrasan la absorción de los carbohidratos. Una pizza con mucho queso sube la glucosa más tarde que un pan solo." },
    { title: "Ejemplo: tortilla española", body: "1 huevo = 0 g HC. 100 g de patata = ~17 g HC (1,7 raciones). La tortilla tiene HC por la patata, no por el huevo.", foodId: "huevo" },
    { title: "Regla de oro", body: "Si el alimento es solo proteína o grasa (pollo a la plancha, aceite de oliva), cuenta 0 raciones. Si tiene mezcla (empanado, salsa), lee la etiqueta.", foodId: "pollo" },
  ], "ex-l1-3-zero-carb-identify"),
  lesson("l1-lesson-4", "nivel-1", 4, "Fibra y carbohidratos netos: qué cuenta realmente", "La fibra no cuenta como ración. Aprende a restarla si la etiqueta la muestra por separado (según FEN y ADA).", [
    { title: "¿Qué es la fibra?", body: "Es un tipo de carbohidrato que tu cuerpo no digiere. No sube la glucosa. La FEN recomienda 25-30 g de fibra al día." },
    { title: "HC totales vs HC netos", body: "HC netos = HC totales − Fibra. Si la etiqueta separa la fibra, puedes restarla. Si no, usa los HC totales (más seguro)." },
    { title: "Ejemplo: pan integral", body: "100 g de pan integral = 45 g HC totales, 8 g fibra. HC netos = 37 g ≈ 3,7 raciones. Sin restar fibra = 4,5 raciones.", foodId: "pan-integral-100g" },
    { title: "Recomendación para Migajas", body: "Enseñamos HC totales (sin restar fibra) para simplificar, salvo que el usuario tenga instrucciones de su médico para restar fibra (común en diabetes tipo 1 con insulina)." },
  ], "ex-l1-4-fiber-net-carbs"),
  lesson("l1-lesson-5", "nivel-1", 5, "Pan, fruta y lácteos: los básicos de cada día", "Estos tres grupos son la base de los carbohidratos diarios. Aprende porciones típicas y raciones equivalentes.", [
    { title: "Pan y cereales", body: "1 rebanada de pan de molde = ~10 g HC (1 ración). 1 rebanada de pan de barra = ~15 g HC (1,5 raciones). El integral tiene más fibra.", foodId: "pan-molde" },
    { title: "Fruta", body: "1 manzana mediana = ~15 g HC (1,5 raciones). 1 plátano pequeño = ~20 g HC (2 raciones). El zumo cuenta igual que la fruta entera.", foodId: "manzana" },
    { title: "Lácteos", body: "1 vaso de leche (200 ml) = ~10 g HC (1 ración). 1 yogur natural = ~5-6 g HC (0,5-0,6 raciones). Los lácteos azucarados tienen más.", foodId: "leche-semi-200ml" },
    { title: "Truco visual", body: "1 ración de fruta = 1 pieza del tamaño de tu puño. 1 ración de pan = 1 rebanada fina. 1 ración de leche = 1 vaso pequeño." },
  ], "ex-l1-5-fruit-bread-dairy"),
  lesson("l2-lesson-1", "nivel-2", 1, "Arroz y pasta: porciones en tazas y gramos", "Arroz y pasta son carbohidratos concentrados. Aprende a medir porciones cocidas y crudas con equivalencias prácticas.", [
    { title: "Arroz cocido", body: "1 taza de arroz cocido (150 g) = ~40 g HC (4 raciones). ½ taza = 2 raciones. Mide con una taza de cocina estándar.", foodId: "arroz-cocido-150g" },
    { title: "Pasta cocida", body: "1 taza de pasta cocida (140 g) = ~35 g HC (3,5 raciones). La pasta integral tiene más fibra pero similar HC total.", foodId: "pasta-cocida-140g" },
    { title: "Crudo vs cocido", body: "100 g de arroz crudo = 77 g HC (7,7 raciones). Al cocerse, absorbe agua y pesa más, pero los HC no cambian." },
    { title: "Consejo ADA", body: "Elige pasta y arroz integral cuando puedas. La fibra extra ayuda a que la glucosa suba más despacio.", foodId: "arroz-integral-cocido-150g" },
  ], "ex-l2-1-rice-pasta-portions"),
  lesson("l2-lesson-2", "nivel-2", 2, "Patata y boniato: no son verduras, son carbohidratos", "Patata, boniato y batata cuentan como raciones, no como verduras libres. Aprende porciones y formas de cocción.", [
    { title: "Patata cocida", body: "1 patata mediana cocida (150 g) = ~25 g HC (2,5 raciones). Las patatas fritas tienen más grasa pero similar HC.", foodId: "patata-cocida-150g" },
    { title: "Boniato/batata", body: "1 boniato pequeño (130 g) = ~26 g HC (2,6 raciones). Es más dulce que la patata pero cuenta similar.", foodId: "boniato-asado-130g" },
    { title: "Puré instantáneo", body: "Cuidado: el puré de sobre puede tener leche en polvo y almidones. 100 g de puré preparado = ~12 g HC (1,2 raciones).", foodId: "es-pure-patata" },
    { title: "Consejo de cocción", body: "Cocer o asar es mejor que freír. La grasa de la fritura no cuenta como HC, pero afecta la absorción (glucemia tardía)." },
  ], "ex-l2-2-potato-sweet-potato"),
  lesson("l2-lesson-3", "nivel-2", 3, "Legumbres: lentejas, garbanzos y alubias (con fibra y proteína)", "Las legumbres son carbohidratos complejos con mucha fibra y proteína. Cuentan como raciones, pero de absorción más lenta.", [
    { title: "Lentejas cocidas", body: "1 plato de lentejas cocidas (200 g) = ~24 g HC (2,4 raciones). Tienen 5 g de fibra, que ayuda a frenar la subida de glucosa.", foodId: "lentejas-cocidas-200g" },
    { title: "Garbanzos y alubias", body: "100 g de garbanzos cocidos = ~16 g HC (1,6 raciones). 100 g de alubias rojas = ~14 g HC (1,4 raciones).", foodId: "garbanzos-cocidos" },
    { title: "¿Por qué son especiales?", body: "Tienen proteína vegetal y mucha fibra. Por eso, aunque tienen HC, suben la glucosa más despacio que el pan o el arroz." },
    { title: "Consejos FEN y ADA", body: "La FEN y ADA recomiendan legumbres 2-3 veces por semana. Son parte de la dieta mediterránea y ayudan a controlar la glucemia.", foodId: "alubias-cocidas" },
  ], "ex-l2-3-legumes-counting"),
  lesson("l3-lesson-1", "nivel-3", 1, 'Verduras: cuáles son "libres" y cuáles cuentan', "La mayoría de verduras son muy bajas en carbohidratos, pero algunas (calabaza, zanahoria, maíz) sí cuentan como raciones.", [
    { title: 'Verduras "libres" (0 raciones)', body: "Lechuga, espinacas, pepino, tomate, brócoli, coliflor, judías verdes. Tienen menos de 5 g de HC por ración. Come libremente.", foodId: "es-lechuga" },
    { title: "Verduras que SÍ cuentan", body: "Calabaza cocida (100 g = ~6 g HC), zanahoria cocida (100 g = ~8 g HC), maíz (100 g = ~19 g HC). Estas sí suman raciones.", foodId: "calabaza" },
    { title: "Truco de cocción", body: "Las verduras cocidas concentran más los HC que las crudas. 100 g de zanahoria cruda = 5 g HC, cocida = 8 g HC.", foodId: "zanahoria" },
    { title: "Recomendación diaria", body: 'La FEN recomienda 2-3 raciones de verdura al día. Prioriza las "libres" para llenar el plato sin sumar carbohidratos.', foodId: "maiz-grano" },
  ], "ex-l3-1-vegetable-carb-identify"),
  lesson("l3-lesson-2", "nivel-3", 2, "Frutas avanzadas: zumo vs pieza, densidad y variedades españolas", "No todas las frutas son iguales. El zumo cuenta igual que la fruta, pero algunas frutas son mucho más densas en carbohidratos.", [
    { title: "Zumo vs fruta entera", body: "1 vaso de zumo de naranja (200 ml) = ~20 g HC (2 raciones), igual que 1 naranja grande. Pero el zumo no tiene fibra, así que sube más rápido la glucosa.", foodId: "es-zumo-naranja" },
    { title: "Frutas muy densas", body: "Uvas (100 g = ~18 g HC), higos, chirimoya, mango. Son saludables, pero 1 puñado puede ser 2-3 raciones. Mide con cuidado.", foodId: "uvas" },
    { title: "Frutas menos densas", body: "Fresas (100 g = ~6 g HC), melón, sandía. Puedes comer más cantidad con menos raciones. Ideales para saciar sin exceso de HC.", foodId: "fresas" },
    { title: "Fruta en almíbar", body: "Cuidado: la fruta en almíbar tiene azúcar añadido. 100 g de piña en almíbar = ~20 g HC, vs 10 g de piña natural.", foodId: "pina-almibar" },
  ], "ex-l3-2-fruit-density-juice"),
  lesson("l4-lesson-1", "nivel-4", 1, "Concepto de plato compuesto: cómo sumar raciones de varios alimentos", "La mayoría de comidas combinan varios alimentos. Aprende a sumar las raciones de cada ingrediente para obtener el total.", [
    { title: "Descomponer el plato", body: "Separa mentalmente cada ingrediente: pan + carne + patata + ensalada. Suma solo los que tienen carbohidratos." },
    { title: "Ejemplo: filete con patatas", body: "Filete de ternera = 0 raciones (solo proteína). 150 g de patata cocida = 2,5 raciones. Ensalada = 0 raciones. Total = 2,5 raciones.", foodId: "patata-cocida-150g" },
    { title: "Salsas y rebozados", body: "El rebozado (harina, pan rallado) suma carbohidratos. Las salsas con azúcar (kétchup, salsa barbacoa) también. Lee la etiqueta.", foodId: "ketchup" },
    { title: "Plato del servidor", body: "Divide tu plato en 3: ½ verduras, ¼ proteína (pollo, pescado), ¼ carbohidratos (arroz, patata, pasta). Es la recomendación de la ADA y FEN.", foodId: "ensalada-mixta" },
  ], "ex-l4-1-mixed-plate-sum"),
  lesson("l4-lesson-2", "nivel-4", 2, "Cocina de casa: guisos, paella, tortilla y platos españoles típicos", "Aprende a calcular raciones en platos típicos españoles: paella, tortilla, cocido, gazpacho, fabada.", [
    { title: "Paella", body: "1 plato de paella (300 g) = ~45 g HC (4,5 raciones) por el arroz. El pollo, marisco y verduras no suman HC, solo el arroz.", foodId: "paella" },
    { title: "Tortilla de patata", body: "1 ración de tortilla (100 g) = ~10 g HC (1 ración) por la patata. El huevo y aceite no cuentan. Varía según la cantidad de patata.", foodId: "tortilla-patata" },
    { title: "Gazpacho", body: "1 vaso de gazpacho (250 ml) = ~10 g HC (1 ración) por el tomate, pimiento y pan que lleva. Sin pan añadido, menos HC.", foodId: "es-gazpacho" },
    { title: "Fabada o cocido", body: "1 plato de fabada (300 g) = ~30 g HC (3 raciones) por las alubias y chorizo (el chorizo tiene almidón). El compango no cuenta.", foodId: "es-fabada" },
  ], "ex-l4-2-spanish-home-dishes"),
  lesson("l4-lesson-3", "nivel-4", 3, "Fuera de casa: tapas, bocadillos, pizzas y restaurantes", "Comer fuera es un reto. Aprende a estimar raciones en situaciones sociales: tapeo, bocadillos, comida rápida.", [
    { title: "Bocadillos", body: "1 bocadillo de pan de barra (100 g de pan) = ~50 g HC (5 raciones). El relleno (jamón, tortilla) no cuenta, solo el pan.", foodId: "bocadillo-jamon" },
    { title: "Tapas típicas", body: "Patatas fritas (ración mediana 150 g) = ~38 g HC (3,8 raciones). Calamares a la romana (rebozados) = ~15 g HC por el rebozado.", foodId: "patatas-fritas-150g" },
    { title: "Pizza", body: "1 porción de pizza (125 g) = ~30 g HC (3 raciones) por la masa. Cuanto más fina la masa, menos HC. El queso y ingredientes no suman.", foodId: "pizza" },
    { title: "Truco de restaurante", body: "Pide la salsa aparte, elige opciones a la plancha, y comparte las patatas fritas o el pan. Así controlas mejor las raciones.", foodId: "calamares-romana" },
  ], "ex-l4-3-tapas-bocadillo-pizza"),
  lesson("l5-lesson-1", "nivel-5", 1, "Grasas y proteínas: impacto en la glucemia tardía (concepto avanzado)", "Las comidas muy grasas o proteicas pueden retrasar el pico de glucosa 3-5 horas. Aprende a identificar estas situaciones.", [
    { title: "El efecto de la grasa", body: "Una pizza o una comida con mucha grasa (frituras, quesos) puede hacer que la glucosa suba más tarde (3-5 horas después)." },
    { title: "Proteínas en exceso", body: "Comer mucha proteína (filete grande, pollo entero) también puede retrasar la absorción de carbohidratos y afectar la glucemia tardía." },
    { title: "¿Qué hacer?", body: "Si comes muy grasas, vigila la glucosa varias horas después, no solo a las 2 horas. Habla con tu médico si usas insulina." },
    { title: "Ejemplo: pizza vs pasta", body: "La pasta (poca grasa) sube la glucosa a las 2 horas. La pizza (mucha grasa) puede subirla a las 4-5 horas. Ambas tienen HC similares.", foodId: "pizza-pepperoni" },
  ], "ex-l5-1-fat-protein-delayed-glucose"),
  lesson("l5-lesson-2", "nivel-5", 2, "Menús completos: desayunos, comidas, meriendas y cenas", "Integra todo lo aprendido calculando raciones en menús completos de un día. Practica con casos reales.", [
    { title: "Desayuno típico", body: "1 vaso de leche (1 ración) + 2 tostadas de pan (2 raciones) + 1 pieza de fruta (1,5 raciones) = 4,5 raciones totales.", foodId: "tostadas-pan" },
    { title: "Comida completa", body: "Ensalada (0) + filete con patatas (2,5 raciones) + 1 yogur (0,5 raciones) + 1 fruta (1 ración) = 4 raciones totales.", foodId: "patata-cocida-150g" },
    { title: "Merienda", body: "1 sándwich pequeño (2 raciones) o 1 fruta + 3-4 nueces (0 raciones, solo grasa). Las nueces no suman HC.", foodId: "es-sandwich-mixto" },
    { title: "Cena ligera", body: "Gazpacho (1 ración) + tortilla francesa (0 raciones) + 1 rebanada de pan (1 ración) = 2 raciones totales. Ideal para la noche.", foodId: "es-gazpacho" },
  ], "ex-l5-2-full-day-menu"),
  lesson("l5-lesson-3", "nivel-5", 3, "Alcohol, celebraciones y situaciones especiales", "El alcohol afecta la glucemia y cuenta como carbohidratos. Aprende a manejar cervezas, vino y dulces de celebración.", [
    { title: "Cerveza", body: "1 caña de cerveza (200 ml) = ~10 g HC (1 ración). La cerveza sin alcohol tiene menos HC (~5 g/200 ml). No cuentes solo el alcohol, cuenta los HC.", foodId: "cerveza" },
    { title: "Vino", body: "1 copa de vino (100 ml) = ~2-3 g HC (0,2-0,3 raciones). El vino dulce o cava tiene más (hasta 8 g/100 ml).", foodId: "vino-tinto" },
    { title: "Dulces de celebración", body: "1 trozo de tarta de cumpleaños (100 g) = ~35-50 g HC (3,5-5 raciones). El chocolate (100 g) = ~50 g HC (5 raciones).", foodId: "tarta-cumpleanos" },
    { title: "Consejo de seguridad", body: "El alcohol puede causar hipoglucemias tardías (6-12 horas después). Si bebes, hazlo con comida y vigila tu glucosa.", foodId: "chocolate-leche" },
  ], "ex-l5-3-alcohol-celebrations"),
];

const LESSON_EXERCISES = [
  { id: "ex-l1-1-basic-ration", levelId: "nivel-1", type: "multiple_choice", prompt: "1 rebanada de pan de molde tiene 12 g de hidratos de carbono. ¿Cuántas raciones de carbohidratos es?", explanation: "12 g HC ÷ 10 g por ración = 1,2 raciones. Recuerda: divide siempre los gramos de HC por 10.", difficulty: "Baja", foodId: "pan-molde", correctAnswer: "1.2", options: rationOpts(["0.5", "1.0", "1.2", "2.0"], "1.2") },
  { id: "ex-l1-2-label-reading", levelId: "nivel-1", type: "count_rations", prompt: "Un yogur natural de 125 g tiene 5 g de hidratos de carbono por cada 100 g. ¿Cuántas raciones tiene este yogur?", explanation: "125 g × 5 g HC/100 g = 6,25 g HC. 6,25 ÷ 10 = 0,625 raciones ≈ 0,6 raciones. No uses el peso total del yogur, solo los HC.", difficulty: "Baja", foodId: "yogur-natural", correctAnswer: "0.6", options: rationOpts(["0.5", "0.6", "1.0", "1.2"], "0.6") },
  { id: "ex-l1-3-zero-carb-identify", levelId: "nivel-1", type: "identify_portion", prompt: "¿Cuál de estos alimentos tiene 0 raciones de carbohidratos?", explanation: "El huevo es proteína pura, 0 g HC. El pan, la manzana y la leche tienen carbohidratos y cuentan como raciones.", difficulty: "Baja", foodId: "huevo", correctAnswer: "huevo", options: [opt("a", "1 huevo duro", "huevo", true), opt("b", "1 rebanada de pan", "pan-molde", false), opt("c", "1 manzana", "manzana", false), opt("d", "1 vaso de leche", "leche-semi-200ml", false)] },
  { id: "ex-l1-4-fiber-net-carbs", levelId: "nivel-1", type: "multiple_choice", prompt: "100 g de pan integral tienen 45 g de HC totales y 8 g de fibra. Si restas la fibra (HC netos), ¿cuántas raciones serían?", explanation: "45 g HC totales − 8 g fibra = 37 g HC netos. 37 ÷ 10 = 3,7 raciones. En Migajas enseñamos a usar HC totales por seguridad, pero así se calculan los netos.", difficulty: "Baja", foodId: "pan-integral-100g", correctAnswer: "3.7", options: rationOpts(["3.7", "4.5", "5.3", "8.0"], "3.7") },
  { id: "ex-l1-5-fruit-bread-dairy", levelId: "nivel-1", type: "count_rations", prompt: "Has comido 1 manzana mediana (15 g HC) y 2 rebanadas de pan de molde (12 g HC cada una). ¿Cuántas raciones totales?", explanation: "1 manzana = 1,5 raciones. 2 rebanadas de pan = 12 g × 2 = 24 g HC = 2,4 raciones. Total = 1,5 + 2,4 = 3,9 raciones.", difficulty: "Baja", foodId: "manzana", correctAnswer: "3.9", options: rationOpts(["2.5", "3.9", "4.5", "5.0"], "3.9") },
  { id: "ex-l2-1-rice-pasta-portions", levelId: "nivel-2", type: "count_rations", prompt: "1 taza de arroz cocido (150 g) tiene 40 g de HC. ¿Cuántas raciones es?", explanation: "40 g HC ÷ 10 = 4 raciones. Una taza de arroz cocido es una porción grande, tenlo en cuenta al servirte.", difficulty: "Baja", foodId: "arroz-cocido-150g", correctAnswer: "4.0", options: rationOpts(["2.0", "3.0", "4.0", "5.0"], "4.0") },
  { id: "ex-l2-2-potato-sweet-potato", levelId: "nivel-2", type: "multiple_choice", prompt: "¿Cuál de estos alimentos cuenta como carbohidratos (no como verdura libre)?", explanation: "La patata es un tubérculo, tiene ~17 g HC/100 g (1,7 raciones). La lechuga, pepino y espinacas son verduras libres (<5 g HC/100 g).", difficulty: "Baja", foodId: "patata-cocida-150g", correctAnswer: "patata-cocida-150g", options: [opt("a", "100 g de lechuga", "es-lechuga", false), opt("b", "100 g de patata cocida", "patata-cocida-150g", true), opt("c", "100 g de pepino", "es-pepino", false), opt("d", "100 g de espinacas", "es-espinacas", false)] },
  { id: "ex-l2-3-legumes-counting", levelId: "nivel-2", type: "count_rations", prompt: "1 plato de lentejas cocidas (200 g) tiene 12 g de HC por cada 100 g. ¿Cuántas raciones tiene el plato?", explanation: "200 g × 12 g HC/100 g = 24 g HC. 24 ÷ 10 = 2,4 raciones. Las lentejas tienen mucha fibra, pero contamos HC totales.", difficulty: "Media", foodId: "lentejas-cocidas-200g", correctAnswer: "2.4", options: rationOpts(["1.2", "2.0", "2.4", "3.0"], "2.4") },
  { id: "ex-l3-1-vegetable-carb-identify", levelId: "nivel-3", type: "identify_portion", prompt: "¿Cuál de estas verduras SÍ cuenta como carbohidratos?", explanation: "La calabaza cocida tiene ~6 g HC/100 g (0,6 raciones). El brócoli, tomate y judías verdes tienen menos de 5 g HC y se consideran libres.", difficulty: "Media", foodId: "calabaza", correctAnswer: "calabaza", options: [opt("a", "100 g de brócoli", "es-brocoli", false), opt("b", "100 g de calabaza cocida", "calabaza", true), opt("c", "100 g de tomate", "tomate", false), opt("d", "100 g de judías verdes", "es-judias-verdes", false)] },
  { id: "ex-l3-2-fruit-density-juice", levelId: "nivel-3", type: "multiple_choice", prompt: "¿Qué tiene más carbohidratos: 200 ml de zumo de naranja o 100 g de fresas?", explanation: "200 ml de zumo = ~20 g HC (2 raciones). 100 g de fresas = ~6 g HC (0,6 raciones). El zumo es mucho más concentrado en carbohidratos.", difficulty: "Media", foodId: "es-zumo-naranja", correctAnswer: "es-zumo-naranja", options: [opt("a", "200 ml de zumo de naranja", "es-zumo-naranja", true), opt("b", "100 g de fresas", "fresas", false), opt("c", "Tienen lo mismo", "same", false), opt("d", "Depende de la naranja", "depends", false)] },
  { id: "ex-l4-1-mixed-plate-sum", levelId: "nivel-4", type: "count_rations", prompt: "Tu plato tiene: 150 g de patata cocida (17 g HC/100 g), 100 g de filete de ternera (0 g HC) y ensalada (5 g HC/100 g). ¿Cuántas raciones totales?", explanation: "Patata: 150 g × 17 g HC/100 g = 25,5 g HC (2,5 raciones). Filete = 0. La ensalada se considera libre en Migajas. Total = 2,5 raciones.", difficulty: "Alta", foodId: "patata-cocida-150g", correctAnswer: "2.5", options: rationOpts(["2.0", "2.5", "3.0", "3.5"], "2.5") },
  { id: "ex-l4-2-spanish-home-dishes", levelId: "nivel-4", type: "multiple_choice", prompt: "1 ración de tortilla de patata (100 g) tiene aproximadamente:", explanation: "La tortilla de patata tiene ~10 g HC/100 g por la patata. El huevo y el aceite no cuentan. Varía según la cantidad de patata que lleve.", difficulty: "Alta", foodId: "tortilla-patata", correctAnswer: "1.0", options: rationOpts(["0", "1.0", "2.0", "3.0"], "1.0") },
  { id: "ex-l4-3-tapas-bocadillo-pizza", levelId: "nivel-4", type: "count_rations", prompt: "Has comido 1 bocadillo de jamón (100 g de pan de barra, 50 g HC/100 g) y 1 ración pequeña de patatas fritas (100 g, 25 g HC/100 g). ¿Cuántas raciones totales?", explanation: "Bocadillo: 100 g × 50 g HC/100 g = 50 g HC (5 raciones). Patatas: 100 g × 25 g HC/100 g = 25 g HC (2,5 raciones). Total = 5 + 2,5 = 7,5 raciones.", difficulty: "Alta", foodId: "bocadillo-jamon", correctAnswer: "7.5", options: rationOpts(["5.0", "6.5", "7.5", "8.0"], "7.5") },
  { id: "ex-l5-1-fat-protein-delayed-glucose", levelId: "nivel-5", type: "multiple_choice", prompt: "¿Por qué una pizza puede elevar la glucosa más tarde que un plato de pasta?", explanation: "La grasa de la pizza retrasa el vaciado gástrico, haciendo que los carbohidratos se absorban más lentamente (pico a las 3-5 horas en lugar de 2 horas).", difficulty: "Alta", foodId: "pizza-pepperoni", correctAnswer: "fat-delay", options: [opt("a", "Porque la pizza tiene más carbohidratos", "more-carbs", false), opt("b", "Porque la pizza tiene más grasa, que retrasa la absorción", "fat-delay", true), opt("c", "Porque la pasta tiene menos proteínas", "less-protein", false), opt("d", "No hay diferencia, ambas suben igual", "no-diff", false)] },
  { id: "ex-l5-2-full-day-menu", levelId: "nivel-5", type: "count_rations", prompt: "Desayuno: 1 vaso de leche (10 g HC), 2 tostadas (20 g HC), 1 manzana (15 g HC). ¿Cuántas raciones totales?", explanation: "Leche = 1 ración (10 g HC). 2 tostadas = 2 raciones (20 g HC). Manzana = 1,5 raciones (15 g HC). Total = 1 + 2 + 1,5 = 4,5 raciones.", difficulty: "Alta", foodId: "tostadas-pan", correctAnswer: "4.5", options: rationOpts(["3.0", "4.0", "4.5", "5.0"], "4.5") },
  { id: "ex-l5-3-alcohol-celebrations", levelId: "nivel-5", type: "multiple_choice", prompt: "1 caña de cerveza (200 ml) tiene aproximadamente:", explanation: "1 caña de cerveza (200 ml) = ~10 g HC (1 ración). La cerveza tiene carbohidratos del grano, no solo alcohol. La cerveza sin alcohol tiene menos (~0,5 raciones).", difficulty: "Alta", foodId: "cerveza", correctAnswer: "1.0", options: rationOpts(["0", "0.5", "1.0", "2.0"], "1.0") },
];

// Bank exercises for expanded exam pools (keep useful legacy + new)
const BANK_EXERCISES = [
  { id: "n1-ex6", levelId: "nivel-1", type: "identify_portion", prompt: "¿Qué fruta aporta 15 g de HC en «1 unidad» de unos 120 g?", explanation: "La manzana pequeña es un ejemplo clásico: 120 g de alimento, 15 g de carbohidratos.", difficulty: "Baja", foodId: "manzana", correctAnswer: "manzana", options: [opt("a", "Manzana pequeña", "manzana", true), opt("b", "Fresas (1 taza)", "fresas", false), opt("c", "Naranja pequeña", "naranja", false)] },
  { id: "n1-ex7", levelId: "nivel-1", type: "count_rations", prompt: "Un plátano pequeño (90 g) aporta 15 g de HC. ¿Cuántas raciones?", explanation: "15 g de carbohidratos = 1,5 raciones.", difficulty: "Baja", foodId: "platano", correctAnswer: "1.5", options: numOpts(["0.5", "1.0", "1.5"], "1.5") },
  { id: "n1-ex8", levelId: "nivel-1", type: "multiple_choice", prompt: "¿Cuántas raciones aporta 1 vaso de leche semidesnatada (200 ml, 10 g HC)?", explanation: "10 g ÷ 10 = 1,0 ración.", difficulty: "Baja", foodId: "leche-semi-200ml", correctAnswer: "1.0", options: rationOpts(["0.5", "1.0", "1.5", "2.0"], "1.0") },
  { id: "n1-ex9", levelId: "nivel-1", type: "identify_portion", prompt: "¿Qué alimento es un modulador (0 raciones)?", explanation: "El pollo no aporta carbohidratos.", difficulty: "Baja", foodId: "pollo", correctAnswer: "pollo", options: [opt("a", "Pollo a la plancha", "pollo", true), opt("b", "Pan de molde", "pan-molde", false), opt("c", "Yogur natural", "yogur-natural", false)] },
  { id: "n1-ex10", levelId: "nivel-1", type: "count_rations", prompt: "100 g de pan integral sin restar fibra (45 g HC). ¿Raciones?", explanation: "En Migajas usamos HC totales: 45 ÷ 10 = 4,5 raciones.", difficulty: "Baja", foodId: "pan-integral-100g", correctAnswer: "4.5", options: rationOpts(["3.7", "4.0", "4.5", "5.0"], "4.5") },
  { id: "n1-ex11", levelId: "nivel-1", type: "multiple_choice", prompt: "1 rebanada de pan blanco (10 g HC). ¿Raciones?", explanation: "10 g ÷ 10 = 1,0 ración.", difficulty: "Baja", foodId: "pan-blanco", correctAnswer: "1.0", options: rationOpts(["0.5", "1.0", "1.5", "2.0"], "1.0") },
  { id: "n1-ex12", levelId: "nivel-1", type: "count_rations", prompt: "1 yogur natural (5 g HC). ¿Raciones?", explanation: "5 g ÷ 10 = 0,5 raciones.", difficulty: "Baja", foodId: "yogur-natural", correctAnswer: "0.5", options: rationOpts(["0.5", "1.0", "1.5", "2.0"], "0.5") },
  { id: "n2-ex4", levelId: "nivel-2", type: "count_rations", prompt: "1 taza de pasta cocida (140 g, 35 g HC). ¿Raciones?", explanation: "35 g ÷ 10 = 3,5 raciones.", difficulty: "Baja", foodId: "pasta-cocida-140g", correctAnswer: "3.5", options: rationOpts(["2.0", "3.0", "3.5", "4.0"], "3.5") },
  { id: "n2-ex5", levelId: "nivel-2", type: "multiple_choice", prompt: "1 boniato pequeño (130 g, 26 g HC). ¿Raciones?", explanation: "26 g ÷ 10 = 2,6 raciones.", difficulty: "Media", foodId: "boniato-asado-130g", correctAnswer: "2.6", options: rationOpts(["1.5", "2.0", "2.6", "3.0"], "2.6") },
  { id: "n2-ex6", levelId: "nivel-2", type: "identify_portion", prompt: "¿Qué legumbre aporta ~16 g HC en 100 g cocidos?", explanation: "Los garbanzos cocidos aportan unos 16 g de HC por 100 g.", difficulty: "Media", foodId: "garbanzos-cocidos", correctAnswer: "garbanzos-cocidos", options: [opt("a", "Garbanzos cocidos", "garbanzos-cocidos", true), opt("b", "Pollo", "pollo", false), opt("c", "Lechuga", "es-lechuga", false)] },
  { id: "n2-ex7", levelId: "nivel-2", type: "count_rations", prompt: "100 g de alubias rojas cocidas (14 g HC). ¿Raciones?", explanation: "14 g ÷ 10 = 1,4 raciones.", difficulty: "Media", foodId: "alubias-cocidas", correctAnswer: "1.4", options: rationOpts(["1.0", "1.4", "1.6", "2.0"], "1.4") },
  { id: "n2-ex8", levelId: "nivel-2", type: "multiple_choice", prompt: "¿La patata cuenta como verdura libre?", explanation: "No. La patata es un tubérculo con HC significativos.", difficulty: "Baja", foodId: "patata-cocida-150g", correctAnswer: "no", options: [opt("a", "Sí, siempre", "yes", false), opt("b", "No, cuenta como carbohidrato", "no", true), opt("c", "Solo si está frita", "fried", false)] },
  { id: "n2-ex9", levelId: "nivel-2", type: "count_rations", prompt: "100 g de puré de patata instantáneo (12 g HC). ¿Raciones?", explanation: "12 g ÷ 10 = 1,2 raciones.", difficulty: "Media", foodId: "es-pure-patata", correctAnswer: "1.2", options: rationOpts(["0.5", "1.0", "1.2", "2.0"], "1.2") },
  { id: "n2-ex10", levelId: "nivel-2", type: "count_rations", prompt: "1 taza de arroz integral cocido (150 g, 38 g HC). ¿Raciones?", explanation: "38 g ÷ 10 = 3,8 raciones.", difficulty: "Media", foodId: "arroz-integral-cocido-150g", correctAnswer: "3.8", options: rationOpts(["2.0", "3.0", "3.8", "4.0"], "3.8") },
  { id: "n3-ex3", levelId: "nivel-3", type: "count_rations", prompt: "100 g de maíz en grano (19 g HC). ¿Raciones?", explanation: "19 g ÷ 10 = 1,9 raciones.", difficulty: "Media", foodId: "maiz-grano", correctAnswer: "1.9", options: rationOpts(["0.5", "1.0", "1.9", "2.5"], "1.9") },
  { id: "n3-ex4", levelId: "nivel-3", type: "count_rations", prompt: "100 g de zanahoria cocida (8 g HC). ¿Raciones?", explanation: "8 g ÷ 10 = 0,8 raciones.", difficulty: "Media", foodId: "zanahoria", correctAnswer: "0.8", options: rationOpts(["0.5", "0.8", "1.0", "1.5"], "0.8") },
  { id: "n3-ex5", levelId: "nivel-3", type: "identify_portion", prompt: "¿Qué verdura es «libre» (<5 g HC/100 g)?", explanation: "La lechuga tiene muy pocos carbohidratos.", difficulty: "Baja", foodId: "es-lechuga", correctAnswer: "es-lechuga", options: [opt("a", "Lechuga", "es-lechuga", true), opt("b", "Calabaza cocida", "calabaza", false), opt("c", "Maíz", "maiz-grano", false)] },
  { id: "n3-ex6", levelId: "nivel-3", type: "multiple_choice", prompt: "100 g de uvas (18 g HC). ¿Raciones?", explanation: "18 g ÷ 10 = 1,8 raciones.", difficulty: "Media", foodId: "uvas", correctAnswer: "1.8", options: rationOpts(["0.5", "1.0", "1.8", "2.5"], "1.8") },
  { id: "n3-ex7", levelId: "nivel-3", type: "count_rations", prompt: "100 g de fresas (6 g HC). ¿Raciones?", explanation: "6 g ÷ 10 = 0,6 raciones.", difficulty: "Baja", foodId: "fresas", correctAnswer: "0.6", options: rationOpts(["0.5", "0.6", "1.0", "1.5"], "0.6") },
  { id: "n3-ex8", levelId: "nivel-3", type: "multiple_choice", prompt: "100 g de piña en almíbar (20 g HC). ¿Raciones?", explanation: "20 g ÷ 10 = 2,0 raciones.", difficulty: "Media", foodId: "pina-almibar", correctAnswer: "2.0", options: rationOpts(["1.0", "1.5", "2.0", "2.5"], "2.0") },
  { id: "n3-ex9", levelId: "nivel-3", type: "count_rations", prompt: "1 vaso de zumo de naranja (200 ml, 22 g HC). ¿Raciones?", explanation: "22 g ÷ 10 = 2,2 raciones.", difficulty: "Baja", foodId: "es-zumo-naranja", correctAnswer: "2.2", options: rationOpts(["1.0", "1.5", "2.2", "3.0"], "2.2") },
  { id: "n3-ex10", levelId: "nivel-3", type: "identify_portion", prompt: "¿Qué fruta es menos densa en HC?", explanation: "El melón aporta menos HC por 100 g que las uvas.", difficulty: "Baja", foodId: "melon", correctAnswer: "melon", options: [opt("a", "Melón", "melon", true), opt("b", "Uvas", "uvas", false), opt("c", "Piña en almíbar", "pina-almibar", false)] },
  { id: "n4-ex4", levelId: "nivel-4", type: "count_rations", prompt: "1 plato de paella (300 g, 45 g HC). ¿Raciones?", explanation: "45 g ÷ 10 = 4,5 raciones.", difficulty: "Alta", foodId: "paella", correctAnswer: "4.5", options: rationOpts(["2.0", "3.0", "4.5", "5.0"], "4.5") },
  { id: "n4-ex5", levelId: "nivel-4", type: "multiple_choice", prompt: "1 vaso de gazpacho (250 ml, ~10 g HC). ¿Raciones?", explanation: "10 g ÷ 10 = 1,0 ración.", difficulty: "Alta", foodId: "es-gazpacho", correctAnswer: "1.0", options: rationOpts(["0.5", "1.0", "1.5", "2.0"], "1.0") },
  { id: "n4-ex6", levelId: "nivel-4", type: "count_rations", prompt: "1 plato de fabada (300 g, 30 g HC). ¿Raciones?", explanation: "30 g ÷ 10 = 3,0 raciones.", difficulty: "Alta", foodId: "es-fabada", correctAnswer: "3.0", options: rationOpts(["1.5", "2.0", "3.0", "4.0"], "3.0") },
  { id: "n4-ex7", levelId: "nivel-4", type: "identify_portion", prompt: "¿Qué ingrediente del bocadillo aporta las raciones de HC?", explanation: "El pan del bocadillo concentra los carbohidratos.", difficulty: "Alta", foodId: "bocadillo-jamon", correctAnswer: "bocadillo-jamon", options: [opt("a", "El pan del bocadillo", "bocadillo-jamon", true), opt("b", "El jamón", "es-jamon", false), opt("c", "La mantequilla", "aceite-oliva", false)] },
  { id: "n4-ex8", levelId: "nivel-4", type: "count_rations", prompt: "1 porción de pizza (125 g, 30 g HC). ¿Raciones?", explanation: "30 g ÷ 10 = 3,0 raciones.", difficulty: "Alta", foodId: "pizza", correctAnswer: "3.0", options: rationOpts(["1.5", "2.0", "3.0", "4.0"], "3.0") },
  { id: "n4-ex9", levelId: "nivel-4", type: "count_rations", prompt: "Patatas fritas ración mediana (150 g, 38 g HC). ¿Raciones?", explanation: "38 g ÷ 10 = 3,8 raciones.", difficulty: "Alta", foodId: "patatas-fritas-150g", correctAnswer: "3.8", options: rationOpts(["2.0", "3.0", "3.8", "4.5"], "3.8") },
  { id: "n4-ex10", levelId: "nivel-4", type: "multiple_choice", prompt: "Calamares a la romana (100 g, 15 g HC del rebozado). ¿Raciones?", explanation: "15 g ÷ 10 = 1,5 raciones por el rebozado.", difficulty: "Alta", foodId: "calamares-romana", correctAnswer: "1.5", options: rationOpts(["0.5", "1.0", "1.5", "2.0"], "1.5") },
  { id: "n4-ex11", levelId: "nivel-4", type: "count_rations", prompt: "Filete con 150 g patata (25 g HC) + ensalada libre. ¿Raciones totales?", explanation: "Solo cuenta la patata: 25 g HC = 2,5 raciones.", difficulty: "Alta", foodId: "patata-cocida-150g", correctAnswer: "2.5", options: rationOpts(["1.5", "2.0", "2.5", "3.0"], "2.5") },
  { id: "n4-ex12", levelId: "nivel-4", type: "identify_portion", prompt: "¿Qué plato español tiene ~45 g HC en 1 plato?", explanation: "La paella concentra HC principalmente en el arroz.", difficulty: "Alta", foodId: "paella", correctAnswer: "paella", options: [opt("a", "Paella", "paella", true), opt("b", "Tortilla de patata", "tortilla-patata", false), opt("c", "Gazpacho", "es-gazpacho", false)] },
  { id: "n5-ex4", levelId: "nivel-5", type: "count_rations", prompt: "Merienda: 1 plátano (15 g HC) + 1 yogur natural (5 g HC). ¿Raciones totales?", explanation: "15 + 5 = 20 g HC → 2,0 raciones.", difficulty: "Alta", correctAnswer: "2.0", options: rationOpts(["1.0", "1.5", "2.0", "2.5"], "2.0") },
  { id: "n5-ex5", levelId: "nivel-5", type: "count_rations", prompt: "1 plato de lentejas estofadas (30 g HC). ¿Raciones?", explanation: "30 g ÷ 10 = 3,0 raciones.", difficulty: "Alta", foodId: "lentejas-estofadas", correctAnswer: "3.0", options: rationOpts(["1.5", "2.0", "3.0", "4.0"], "3.0") },
  { id: "n5-ex6", levelId: "nivel-5", type: "multiple_choice", prompt: "Cena: arroz (15 g HC) + ensalada libre. ¿Raciones totales?", explanation: "Solo el arroz cuenta: 1,5 raciones.", difficulty: "Alta", correctAnswer: "1.5", options: rationOpts(["0.5", "1.0", "1.5", "2.0"], "1.5") },
  { id: "n5-ex7", levelId: "nivel-5", type: "count_rations", prompt: "1 paella (45 g HC). ¿Raciones?", explanation: "45 g ÷ 10 = 4,5 raciones.", difficulty: "Alta", foodId: "paella", correctAnswer: "4.5", options: rationOpts(["2.0", "3.0", "4.5", "5.0"], "4.5") },
  { id: "n5-ex8", levelId: "nivel-5", type: "identify_portion", prompt: "¿Cuál aporta 0 raciones de carbohidratos?", explanation: "La carne es modulador: 0 g de HC.", difficulty: "Alta", foodId: "carne", correctAnswer: "carne", options: [opt("a", "Carne", "carne", true), opt("b", "Patata cocida", "patata-cocida-150g", false), opt("c", "Yogur azucarado", "yogur-azucarado", false)] },
  { id: "n5-ex9", levelId: "nivel-5", type: "multiple_choice", prompt: "1 copa de vino tinto (100 ml, 3 g HC). ¿Raciones?", explanation: "3 g ÷ 10 = 0,3 raciones.", difficulty: "Alta", foodId: "vino-tinto", correctAnswer: "0.3", options: rationOpts(["0", "0.3", "1.0", "2.0"], "0.3") },
  { id: "n5-ex10", levelId: "nivel-5", type: "count_rations", prompt: "1 trozo de tarta de cumpleaños (100 g, 45 g HC). ¿Raciones?", explanation: "45 g ÷ 10 = 4,5 raciones.", difficulty: "Alta", foodId: "tarta-cumpleanos", correctAnswer: "4.5", options: rationOpts(["2.0", "3.0", "4.5", "5.0"], "4.5") },
  { id: "n5-ex11", levelId: "nivel-5", type: "multiple_choice", prompt: "¿Por qué vigilar la glucosa horas después de beber alcohol?", explanation: "El alcohol puede causar hipoglucemias tardías (6-12 h después).", difficulty: "Alta", correctAnswer: "hypo-late", options: [opt("a", "Por hipoglucemia tardía", "hypo-late", true), opt("b", "Porque no tiene HC", "no-carbs", false), opt("c", "Porque sube al instante", "instant", false)] },
  { id: "n5-ex12", levelId: "nivel-5", type: "count_rations", prompt: "Desayuno: leche (10 g) + 2 tostadas (20 g) + manzana (15 g). ¿Raciones?", explanation: "Total 45 g HC = 4,5 raciones.", difficulty: "Alta", foodId: "tostadas-pan", correctAnswer: "4.5", options: rationOpts(["3.0", "4.0", "4.5", "5.0"], "4.5") },
  { id: "n5-ex13", levelId: "nivel-5", type: "multiple_choice", prompt: "Pizza pepperoni vs pasta carbonara: ¿cuál retrasa más la glucemia?", explanation: "La pizza con más grasa puede retrasar el pico de glucosa.", difficulty: "Alta", foodId: "pizza-pepperoni", correctAnswer: "pizza-pepperoni", options: [opt("a", "Pizza pepperoni", "pizza-pepperoni", true), opt("b", "Pasta carbonara", "pasta-carbonara", false), opt("c", "Igual", "same", false)] },
  { id: "n5-ex14", levelId: "nivel-5", type: "count_rations", prompt: "100 g de chocolate con leche (50 g HC). ¿Raciones?", explanation: "50 g ÷ 10 = 5,0 raciones.", difficulty: "Alta", foodId: "chocolate-leche", correctAnswer: "5.0", options: rationOpts(["2.0", "3.0", "5.0", "6.0"], "5.0") },
  { id: "n5-ex15", levelId: "nivel-5", type: "identify_portion", prompt: "¿Qué merienda tiene 0 raciones de HC?", explanation: "Las nueces son grasa/proteína, no aportan HC significativos.", difficulty: "Alta", foodId: "nueces", correctAnswer: "nueces", options: [opt("a", "Nueces (30 g)", "nueces", true), opt("b", "Sándwich pequeño", "es-sandwich-mixto", false), opt("c", "Plátano", "platano", false)] },
  { id: "n1-ex13", levelId: "nivel-1", type: "count_rations", prompt: "Estimas 2 rebanadas de pan de molde (24 g HC en total). ¿Cuántas raciones?", explanation: "24 g ÷ 10 = 2,4 raciones.", difficulty: "Media", foodId: "pan-molde", correctAnswer: "2.4", options: rationOpts(["1.2", "2.0", "2.4", "3.0"], "2.4") },
  { id: "n1-ex14", levelId: "nivel-1", type: "identify_portion", prompt: "Sin mirar la etiqueta: ¿qué opción ronda ~1,5 raciones?", explanation: "1 manzana mediana ≈ 15 g HC = 1,5 raciones.", difficulty: "Media", foodId: "manzana", correctAnswer: "manzana", options: [opt("a", "1 manzana mediana", "manzana", true), opt("b", "Pollo a la plancha", "pollo", false), opt("c", "Aceite de oliva", "aceite-oliva", false)] },
  { id: "n1-ex15", levelId: "nivel-1", type: "count_rations", prompt: "2 cucharadas de kétchup (8 g HC). ¿Raciones?", explanation: "8 g ÷ 10 = 0,8 raciones.", difficulty: "Media", foodId: "ketchup", correctAnswer: "0.8", options: rationOpts(["0.5", "0.8", "1.0", "1.5"], "0.8") },
  { id: "n2-ex11", levelId: "nivel-2", type: "count_rations", prompt: "½ taza de arroz cocido (75 g, 20 g HC). ¿Raciones?", explanation: "20 g ÷ 10 = 2,0 raciones.", difficulty: "Media", foodId: "arroz-cocido-150g", correctAnswer: "2.0", options: rationOpts(["1.0", "1.5", "2.0", "2.5"], "2.0") },
  { id: "n2-ex12", levelId: "nivel-2", type: "identify_portion", prompt: "¿Qué porción tiene ~2,5 raciones sin etiqueta?", explanation: "1 patata mediana cocida ≈ 25 g HC.", difficulty: "Media", foodId: "patata-cocida-150g", correctAnswer: "patata-cocida-150g", options: [opt("a", "1 patata mediana cocida", "patata-cocida-150g", true), opt("b", "100 g de lechuga", "es-lechuga", false), opt("c", "1 huevo", "huevo", false)] },
  { id: "n3-ex11", levelId: "nivel-3", type: "count_rations", prompt: "100 g de guisantes cocidos (14 g HC). ¿Raciones?", explanation: "14 g ÷ 10 = 1,4 raciones.", difficulty: "Media", foodId: "guisantes-cocidos", correctAnswer: "1.4", options: rationOpts(["0.5", "1.0", "1.4", "2.0"], "1.4") },
  { id: "n4-ex13", levelId: "nivel-4", type: "count_rations", prompt: "2 cucharadas de tomate frito (6 g HC). ¿Raciones?", explanation: "6 g ÷ 10 = 0,6 raciones.", difficulty: "Alta", foodId: "tomate-frito", correctAnswer: "0.6", options: rationOpts(["0.3", "0.6", "1.0", "1.5"], "0.6") },
  { id: "n4-ex14", levelId: "nivel-4", type: "count_rations", prompt: "2 lonchas de embutido con almidón (8 g HC). ¿Raciones?", explanation: "8 g ÷ 10 = 0,8 raciones.", difficulty: "Alta", foodId: "embutido-almidon", correctAnswer: "0.8", options: rationOpts(["0.5", "0.8", "1.0", "1.5"], "0.8") },
  { id: "n5-ex16", levelId: "nivel-5", type: "count_rations", prompt: "2 cañas de cerveza (20 g HC). ¿Raciones?", explanation: "20 g ÷ 10 = 2,0 raciones.", difficulty: "Alta", foodId: "cerveza", correctAnswer: "2.0", options: rationOpts(["1.0", "1.5", "2.0", "2.5"], "2.0") },
  { id: "n5-ex17", levelId: "nivel-5", type: "identify_portion", prompt: "En una cena con alcohol: ¿qué bebida aporta más HC por ración típica?", explanation: "1 caña de cerveza (~10 g HC) supera a 1 copa de vino (~3 g HC).", difficulty: "Alta", foodId: "cerveza", correctAnswer: "cerveza", options: [opt("a", "1 caña de cerveza", "cerveza", true), opt("b", "1 copa de vino tinto", "vino-tinto", false), opt("c", "Agua", "es-agua", false)] },
];

const EXAMS = [
  { levelId: "nivel-1", title: "Examen — Nivel 1", description: "Fundamentos: raciones, etiquetas, moduladores, fibra y alimentos básicos. 5 preguntas sorteadas de un banco de 15.", poolExerciseIds: ["ex-l1-1-basic-ration", "ex-l1-2-label-reading", "ex-l1-3-zero-carb-identify", "ex-l1-4-fiber-net-carbs", "ex-l1-5-fruit-bread-dairy", "n1-ex6", "n1-ex7", "n1-ex8", "n1-ex9", "n1-ex10", "n1-ex11", "n1-ex12", "n1-ex13", "n1-ex14", "n1-ex15"], questionsPerExam: 5 },
  { levelId: "nivel-2", title: "Examen — Nivel 2", description: "Cereales, tubérculos y legumbres. 4 preguntas sorteadas de un banco de 12.", poolExerciseIds: ["ex-l2-1-rice-pasta-portions", "ex-l2-2-potato-sweet-potato", "ex-l2-3-legumes-counting", "n2-ex4", "n2-ex5", "n2-ex6", "n2-ex7", "n2-ex8", "n2-ex9", "n2-ex10", "n2-ex11", "n2-ex12"], questionsPerExam: 4 },
  { levelId: "nivel-3", title: "Examen — Nivel 3", description: "Verduras y frutas avanzadas. 4 preguntas sorteadas de un banco de 11.", poolExerciseIds: ["ex-l3-1-vegetable-carb-identify", "ex-l3-2-fruit-density-juice", "n3-ex3", "n3-ex4", "n3-ex5", "n3-ex6", "n3-ex7", "n3-ex8", "n3-ex9", "n3-ex10", "n3-ex11"], questionsPerExam: 4 },
  { levelId: "nivel-4", title: "Examen — Nivel 4", description: "Platos mixtos, cocina española y comer fuera. 4 preguntas sorteadas de un banco de 14.", poolExerciseIds: ["ex-l4-1-mixed-plate-sum", "ex-l4-2-spanish-home-dishes", "ex-l4-3-tapas-bocadillo-pizza", "n4-ex4", "n4-ex5", "n4-ex6", "n4-ex7", "n4-ex8", "n4-ex9", "n4-ex10", "n4-ex11", "n4-ex12", "n4-ex13", "n4-ex14"], questionsPerExam: 4 },
  { levelId: "nivel-5", title: "Examen — Nivel 5", description: "Integración, menús completos, alcohol y situaciones reales. 6 preguntas sorteadas de un banco de 17.", poolExerciseIds: ["ex-l5-1-fat-protein-delayed-glucose", "ex-l5-2-full-day-menu", "ex-l5-3-alcohol-celebrations", "n5-ex4", "n5-ex5", "n5-ex6", "n5-ex7", "n5-ex8", "n5-ex9", "n5-ex10", "n5-ex11", "n5-ex12", "n5-ex13", "n5-ex14", "n5-ex15", "n5-ex16", "n5-ex17"], questionsPerExam: 6 },
];

// Merge foods
const foods = JSON.parse(readFileSync(join(dataDir, "foods.json"), "utf8"));
const existingIds = new Set(foods.map((f) => f.id));
for (const food of NEW_FOODS) {
  if (!existingIds.has(food.id)) {
    foods.push(food);
    existingIds.add(food.id);
  }
}

const exercises = [...LESSON_EXERCISES, ...BANK_EXERCISES];

writeFileSync(join(dataDir, "lessons.json"), JSON.stringify(LESSONS, null, 2) + "\n");
writeFileSync(join(dataDir, "exercises.json"), JSON.stringify(exercises, null, 2) + "\n");
writeFileSync(join(dataDir, "exams.json"), JSON.stringify(EXAMS, null, 2) + "\n");
writeFileSync(join(dataDir, "foods.json"), JSON.stringify(foods, null, 2) + "\n");

console.log(`Wrote ${LESSONS.length} lessons, ${exercises.length} exercises, ${EXAMS.length} exams, ${foods.length} foods`);
