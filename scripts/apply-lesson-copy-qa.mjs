/**
 * Apply pedagogical copy fixes to lessons + exercises + levels.
 * Run: node scripts/apply-lesson-copy-qa.mjs
 */
import fs from "node:fs";

const lessonsPath = "src/lib/data/lessons.json";
const exercisesPath = "src/lib/data/exercises.json";
const levelsPath = "src/lib/data/levels.json";

const lessons = JSON.parse(fs.readFileSync(lessonsPath, "utf8"));
const exercises = JSON.parse(fs.readFileSync(exercisesPath, "utf8"));
const levels = JSON.parse(fs.readFileSync(levelsPath, "utf8"));

function patchLesson(id, patch) {
  const lesson = lessons.find((l) => l.id === id);
  if (!lesson) throw new Error(`missing lesson ${id}`);
  Object.assign(lesson, patch);
}

function patchStep(lessonId, stepId, patch) {
  const lesson = lessons.find((l) => l.id === lessonId);
  const step = lesson.steps.find((s) => s.id === stepId);
  if (!step) throw new Error(`missing step ${lessonId}/${stepId}`);
  Object.assign(step, patch);
}

// --- Level 1 modulators ---
patchLesson("l1-lesson-3", {
  title: "Proteínas y grasas: no aportan raciones de HC",
  summary:
    "Carne, pollo, huevo, pescado y aceites no aportan raciones de hidratos, aunque pueden modificar la respuesta glucémica de una comida mixta.",
});
patchStep("l1-lesson-3", "l1-lesson-3-s1", {
  title: "¿Qué son los moduladores?",
  body: "Son alimentos con 0 o casi 0 carbohidratos: pollo, carne, huevo, pescado, aceite, mantequilla. No aportan raciones de HC. Sí pueden modificar la respuesta glucémica cuando van con carbohidratos (comida mixta).",
});

// --- Fiber ---
patchLesson("l1-lesson-4", {
  title: "Fibra y carbohidratos: qué usa Migajas",
  summary:
    "Migajas cuenta HC totales por defecto. Los HC netos (restar fibra) solo si tu equipo de salud te lo indica; el criterio varía según país, etiquetado y protocolo educativo.",
});
patchStep("l1-lesson-4", "l1-lesson-4-s2", {
  body: "HC netos = HC totales − Fibra. Algunos equipos educativos los usan cuando la etiqueta separa la fibra. Si no hay criterio claro, los HC totales son la opción más segura y la que usa Migajas por defecto.",
});
patchStep("l1-lesson-4", "l1-lesson-4-s4", {
  title: "Recomendación para Migajas",
  body: "Contamos HC totales (sin restar fibra) para simplificar y alinear con muchos programas en España. Si tu equipo de salud te indica restar fibra (a veces en diabetes tipo 1 con insulina), sigue su protocolo: no hay una regla universal.",
});

// --- Vegetables policy ---
patchLesson("l3-lesson-1", {
  title: "Verduras: bajo contenido en HC vs las que sí se contabilizan",
  summary:
    "Algunas verduras, en cantidades habituales de guarnición, suelen no contabilizarse. Otras (calabaza, zanahoria, maíz, brócoli en ración generosa, judías verdes) sí aportan HC relevantes. Migajas muestra el dato del catálogo para no mezclar «libre» con 0 infinito.",
});
patchStep("l3-lesson-1", "l3-lesson-1-s1", {
  title: "Verduras de bajo HC (habitualmente no contabilizadas)",
  body: "Lechuga, espinacas, pepino, tomate, coliflor, apio, calabacín, champiñones y pimiento, en porciones habituales de ensalada o guarnición, suelen no contabilizarse en muchos protocolos. No significa cantidad infinita: el catálogo muestra HC si la porción es grande.",
});
patchStep("l3-lesson-1", "l3-lesson-1-s2", {
  title: "Verduras que SÍ se contabilizan en la porción del catálogo",
  body: "Calabaza, zanahoria, maíz, brócoli (1 taza ≈ 10 g HC) y judías verdes (1 taza ≈ 10 g HC) sí suman raciones en Migajas. Una guarnición muy pequeña puede tratarse distinto según el protocolo de tu equipo; aquí usamos el dato de la ficha.",
});
patchStep("l3-lesson-1", "l3-lesson-1-s4", {
  title: "Recomendación diaria",
  body: "La FEN recomienda 2-3 raciones de verdura al día. Prioriza las de bajo HC para llenar el plato; consulta con tu equipo si tu protocolo no contabiliza ciertas verduras en cantidades habituales.",
});

// --- Juice align with catalog ---
patchStep("l3-lesson-2", "l3-lesson-2-s1", {
  body: "1 vaso de zumo de naranja (200 ml) en el catálogo = 22 g HC (2,2 raciones). La pieza entera aporta fibra; el zumo sube la glucosa más rápido. Los valores redondeados «~20 g» en ejemplos antiguos equivalen a la misma idea educativa.",
});

// --- Tortilla / gazpacho align ---
patchStep("l4-lesson-2", "l4-lesson-2-s2", {
  body: "En el catálogo, 1 porción de tortilla (~180 g) = ~20 g HC (2,0 raciones) por la patata. Una porción más pequeña (~100 g) puede acercarse a ~10 g HC (1 ración). El huevo y el aceite no aportan raciones de HC. Los platos tradicionales varían según receta.",
});
patchStep("l4-lesson-2", "l4-lesson-2-s3", {
  body: "En el catálogo, 1 bol de gazpacho (~300 g) = ~15 g HC (1,5 raciones). Un vaso de ~250 ml de otra receta puede acercarse a ~10 g HC. Los platos tradicionales presentan variabilidad según receta; usamos una preparación estándar educativa.",
});

// Add mixed-dish policy note on first home-cooking step
patchStep("l4-lesson-2", "l4-lesson-2-s1", {
  body: "1 plato de paella (300 g) = ~45 g HC (4,5 raciones) por el arroz. El pollo, marisco y verduras no suman HC, solo el arroz. Nota: las preparaciones tradicionales varían según receta; los valores del catálogo son una porción estándar con fines educativos.",
});

// --- Alcohol ---
patchLesson("l5-lesson-3", {
  title: "Alcohol (riesgo de hipoglucemia tardía), celebraciones y situaciones especiales",
  summary:
    "El alcohol aporta HC y puede causar hipoglucemia tardía (6–12 h después). Aprende a manejar cervezas, vino y dulces de celebración con comida y vigilancia de glucosa.",
});
patchStep("l5-lesson-3", "l5-lesson-3-s4", {
  title: "Riesgo de hipoglucemia tardía",
  body: "El mensaje educativo más importante: el alcohol puede causar hipoglucemias tardías (6–12 horas después). Si bebes, hazlo con comida, cuenta los HC de la bebida y vigila tu glucosa según las pautas de tu equipo de salud.",
});

// --- Cena gazpacho note ---
patchStep("l5-lesson-2", "l5-lesson-2-s4", {
  body: "Gazpacho (~1–1,5 raciones según porción del catálogo) + tortilla francesa (0 raciones de HC) + 1 rebanada de pan (1 ración) ≈ 2–2,5 raciones. Ideal para la noche.",
});

// Levels: objectives + descriptions
const levelMeta = {
  "nivel-1": {
    description:
      "Conceptos básicos: ración (10 g HC), etiquetas, moduladores, fibra y alimentos cotidianos.",
    learningObjectives: [
      "Definir una ración de HC según la regla española (10 g = 1 ración)",
      "Distinguir gramos de alimento de gramos de carbohidratos",
      "Identificar alimentos que no aportan raciones de HC (moduladores) y su efecto en comidas mixtas",
      "Explicar por qué Migajas usa HC totales por defecto",
      "Estimar raciones de pan, fruta y lácteos habituales",
    ],
  },
  "nivel-2": {
    description:
      "Alimentos individuales densos en HC: cereales, tubérculos y legumbres.",
    learningObjectives: [
      "Identificar los principales cereales, tubérculos y legumbres",
      "Estimar raciones de HC de una porción habitual (taza / plato)",
      "Diferenciar alimentos con y sin aporte relevante de HC en este grupo",
      "Usar medidas caseras (taza, plato) de forma coherente con el catálogo",
    ],
  },
  "nivel-3": {
    description:
      "Verduras de bajo HC vs las que se contabilizan; frutas densas y zumo vs pieza.",
    learningObjectives: [
      "Clasificar verduras de bajo HC (habitualmente no contabilizadas) frente a las que sí cuentan en la ficha",
      "Estimar el impacto del zumo frente a la pieza de fruta",
      "Reconocer frutas densas vs menos densas en HC",
      "Aplicar el criterio del catálogo sin asumir «cantidad libre infinita»",
    ],
  },
  "nivel-4": {
    description:
      "Platos compuestos y cocina real: casa, tapas y restaurante (estimaciones educativas).",
    learningObjectives: [
      "Sumar raciones en un plato compuesto",
      "Estimar HC en platos típicos españoles (paella, tortilla, gazpacho)",
      "Identificar el componente que aporta HC al comer fuera",
      "Entender que las preparaciones tradicionales varían según receta",
    ],
  },
  "nivel-5": {
    description:
      "Integración: menús del día, comidas mixtas, alcohol e hipoglucemia tardía.",
    learningObjectives: [
      "Planificar un menú completo estimando raciones totales",
      "Reconocer el efecto de grasas/proteínas en la respuesta glucémica de comidas mixtas",
      "Contar HC en bebidas alcohólicas y dulces de celebración",
      "Describir el riesgo de hipoglucemia tardía asociada al alcohol",
    ],
  },
};

for (const level of levels) {
  const meta = levelMeta[level.id];
  if (meta) Object.assign(level, meta);
}

// Exercises: vegetable wording
for (const ex of exercises) {
  if (ex.id === "ex-l3-1-vegetable-carb-identify") {
    ex.explanation =
      "La calabaza cocida tiene un aporte relevante de HC. El tomate en porción habitual suele no contabilizarse; el brócoli y las judías verdes en porción de 1 taza (~10 g HC) sí se contabilizan en Migajas (no son «libres» infinitas).";
  }
  if (typeof ex.explanation === "string" && /verduras libres/i.test(ex.explanation)) {
    ex.explanation = ex.explanation.replace(
      /verduras libres/gi,
      "verduras de bajo contenido en HC (habitualmente no contabilizadas)",
    );
  }
  if (typeof ex.explanation === "string" && /se consideran libres/i.test(ex.explanation)) {
    ex.explanation = ex.explanation.replace(
      /se consideran libres/gi,
      "en porciones muy pequeñas algunos protocolos no las contabilizan; en la ficha de Migajas el brócoli y las judías verdes en 1 taza sí cuentan",
    );
  }
}

fs.writeFileSync(lessonsPath, JSON.stringify(lessons, null, 2) + "\n");
fs.writeFileSync(exercisesPath, JSON.stringify(exercises, null, 2) + "\n");
fs.writeFileSync(levelsPath, JSON.stringify(levels, null, 2) + "\n");
console.log("lessons/exercises/levels copy updated");
