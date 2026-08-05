/**
 * Regenerates docs/commercial/CURRICULUM-INVENTORY.md from live data.
 * Run: node scripts/generate-curriculum-inventory.mjs
 * Keep PASS in sync with src/lib/domain/progress.ts PASS_THRESHOLD.
 */
import fs from "node:fs";

const PASS = 70;

const foods = JSON.parse(fs.readFileSync("src/lib/data/foods.json", "utf8"));
const levels = JSON.parse(fs.readFileSync("src/lib/data/levels.json", "utf8"));
const lessons = JSON.parse(fs.readFileSync("src/lib/data/lessons.json", "utf8"));
const exams = JSON.parse(fs.readFileSync("src/lib/data/exams.json", "utf8"));
const exercises = JSON.parse(
  fs.readFileSync("src/lib/data/exercises.json", "utf8"),
);

const es = foods.filter((f) => f.country === "España");
const rd = foods.filter((f) => f.country === "República Dominicana");
const order = [
  "Pan",
  "Cereales",
  "Tubérculos",
  "Legumbres",
  "Fruta",
  "Verdura",
  "Lácteos",
  "Proteína",
  "Grasa",
  "Plato mixto",
  "Bebida",
  "Dulce",
  "Salsa",
  "Embutido",
];
const byCat = {};
for (const f of es) (byCat[f.category] ??= []).push(f);
const rations = (g) => (g / 10).toFixed(1).replace(".", ",");
const sourceLabel = {
  B: "B · BEDCA",
  F: "F · FEN",
  E: "E · Etiquetado",
  R: "R · Receta estándar",
  P: "P · Estimación pedagógica",
};
const basisLabel = {
  edible: "Comestible",
  as_purchased: "Tal cual compra",
  cooked: "Cocido",
  dry: "Seco/crudo",
  beverage: "Bebida",
  prepared_dish: "Plato",
  commercial_unit: "Unidad comercial",
};
function provenanceOf(f) {
  if (f.provenanceCode) return f.provenanceCode;
  const map = {
    bedca_aligned: "B",
    bedca_standard_recipe: "R",
    label_or_typical: "E",
    multi_source: "P",
    pedagogical_estimate: "P",
  };
  return map[f.dataSource] || "P";
}
const countingLabel = {
  always_count: "Se contabiliza",
  habitually_uncounted: "Habitualmente no contabilizada",
};

const lines = [];
const push = (s = "") => lines.push(s);

push("# Inventario del material educativo — Migajas");
push("");
push(
  "**Documento interno / comercial / revisión pedagógica** · Generado desde `src/lib/data/` · Ago 2026 (v4 gobernanza)",
);
push(
  "**Uso:** auditoría por educadores, anexos a piloto, onboarding del buyer.",
);
push("");
push(
  "**Paquete auditor:** [AUDIT-BRIEF.md](./AUDIT-BRIEF.md) · [CATALOG-METHODOLOGY.md](./CATALOG-METHODOLOGY.md)",
);
push("");
push(
  "**Fuente de verdad:** JSON en el repo. Regenerar: `npm run docs:curriculum`.",
);
push("");
push("| Artefacto | Ruta |");
push("|-----------|------|");
push("| Niveles + objetivos | `src/lib/data/levels.json` |");
push("| Lecciones | `src/lib/data/lessons.json` |");
push("| Ejercicios | `src/lib/data/exercises.json` |");
push("| Exámenes | `src/lib/data/exams.json` |");
push("| Alimentos y preparaciones | `src/lib/data/foods.json` |");
push("| Umbral de aprobado | `src/lib/domain/progress.ts` (`PASS_THRESHOLD`) |");
push("| Auditoría catálogo | `src/lib/domain/food-catalog-audit.ts` · `npm run audit:foods` |");
push("| Fuentes | `src/lib/domain/content-sources.ts` |");
push("");
push("---");
push("");
push("## Resumen ejecutivo");
push("");
push("| Bloque | Cantidad |");
push("|--------|----------|");
push(`| Niveles | **${levels.length}** |`);
push(`| Lecciones | **${lessons.length}** |`);
push(`| Ejercicios (banco) | **${exercises.length}** |`);
push(`| Exámenes | **${exams.length}** |`);
push(
  `| Alimentos y preparaciones | **${foods.length}** (${es.length} España · ${rd.length} RD) |`,
);
push("| Regla ES | **10 g HC = 1 ración** |");
push("| Regla RD | **15 g HC = 1 ración** (catálogo; curso guiado ES-first) |");
push(
  `| Aprobado de nivel | **≥ ${PASS} %** de aciertos en el examen (reintentos permitidos) |`,
);
push("");
push(
  "**Arco:** entender → practicar → fichas (repaso) → evaluar → confiar.",
);
push(
  "**Disclaimer:** herramienta educativa; no sustituye consejo sanitario; no calcula insulina.",
);
push("");
push("---");
push("");
push("## Metodología de construcción del catálogo");
push("");
push(
  "Resumen. Detalle completo: [CATALOG-METHODOLOGY.md](./CATALOG-METHODOLOGY.md).",
);
push("");
push(
  "1. Alimento simple → prioritariamente **BEDCA** (código **B**).",
);
push(
  "2. Sin equivalente BEDCA → tablas ES, **etiquetado** (**E**) o estimación documentada (**P**).",
);
push(
  "3. Plato compuesto → **receta estándar Migajas** (**R**), solo fin educativo.",
);
push("4. Raciones ES: **10 g HC = 1 ración**.");
push("5. HC **totales** por defecto (sin restar fibra automáticamente).");
push(
  "6. Revisión periódica; estado actual: **pendiente de firma externa** (`pending_external`).",
);
push("");
push("| Código | Fuente |");
push("|--------|--------|");
push("| **B** | BEDCA |");
push("| **F** | FEN |");
push("| **E** | Etiquetado fabricante |");
push("| **R** | Receta estándar Migajas |");
push("| **P** | Estimación pedagógica validada |");
push("");
push("### Criterios de porción (consistencia ES)");
push("");
push("| Grupo | Criterio |");
push("|-------|----------|");
push("| Arroz / pasta | Siempre **cocidos** |");
push("| Legumbres | Siempre **cocidas** (o hummus como preparación) |");
push("| Frutas | **Parte comestible** habitual |");
push("| Pan | Rebanada / trozo / unidad tipificada |");
push(
  "| Bebidas | Tipos diferenciados (agua, café, té, zumo, cerveza lager, cerveza sin alcohol, vino tinto seco) |",
);
push("");
push("---");
push("");
push("## Mapa del currículo");
push("");
push("```");
push("Nivel 1 — Fundamentos");
push("   ↓");
push("Nivel 2 — Cereales, tubérculos, legumbres");
push("   ↓");
push("Nivel 3 — Verduras y frutas");
push("   ↓");
push("   ├─→ Modo clínico opcional (diario + export; sin dosis ni terapia)");
push("   ↓");
push("Nivel 4 — Platos mixtos y cocina real");
push("   ↓");
push("Nivel 5 — Menús, alcohol (hipoglucemia tardía), celebraciones");
push("```");
push("");
push(
  "El currículo sigue un **modelo de complejidad creciente**: conceptos → alimentos individuales → situaciones reales con varias variables. Tras aprobar el nivel 3 puede activarse el modo clínico; **no** realiza recomendaciones terapéuticas ni cálculos de dosis de insulina — solo registro y exportación opcionales.",
);
push("");
push("---");
push("");
push("## Objetivos de aprendizaje por nivel");
push("");
for (const level of [...levels].sort((a, b) => a.orderIndex - b.orderIndex)) {
  const exam = exams.find((e) => e.levelId === level.id);
  push(`### ${level.name}`);
  push("");
  push(level.description);
  push("");
  push(
    `**Examen:** ${exam?.questionsPerExam ?? "?"} preguntas de un pool de ${exam?.poolExerciseIds?.length ?? "?"}. Aprobado ≥ ${PASS} %.`,
  );
  push("");
  push("Al finalizar este nivel el alumno será capaz de:");
  push("");
  for (const obj of level.learningObjectives ?? []) {
    push(`- ${obj}`);
  }
  push("");
  const levelLessons = lessons
    .filter((l) => l.levelId === level.id)
    .sort((a, b) => a.orderIndex - b.orderIndex);
  push("| # | Lección |");
  push("|---|---------|");
  for (const l of levelLessons) {
    push(`| ${l.orderIndex} | ${l.title} |`);
  }
  push("");
}

push("---");
push("");
push("## Reglas y mediciones canónicas");
push("");
push("### Unidad de intercambio");
push("");
push("| Región | Regla |");
push("|--------|-------|");
push("| España | 10 g HC = 1 ración |");
push("| República Dominicana | 15 g HC = 1 ración |");
push("");
push("`raciones = carbsG / exchangeUnitG` (UI a 1 decimal).");
push("");
push("### HC y fibra");
push("");
push(
  "Migajas cuenta **HC totales** por defecto. HC netos solo si el equipo de salud lo indica; el criterio varía según país, etiquetado y protocolo educativo.",
);
push("");
push("### Moduladores");
push("");
push(
  "Proteínas y grasas **no aportan raciones de HC**, aunque **pueden modificar la respuesta glucémica** de una comida mixta.",
);
push("");
push("### Verduras (política unificada)");
push("");
push(
  "No usamos «verduras libres» como cantidad infinita. Distinguimos:",
);
push("");
push(
  "- **Habitualmente no contabilizadas** — bajo HC en guarnición/ensalada habitual (lechuga, espinacas, pepino, tomate en taza, etc.).",
);
push(
  "- **Se contabilizan** — aporte relevante en la porción del catálogo (calabaza, zanahoria, maíz, brócoli 1 taza, judías verdes 1 taza, etc.).",
);
push("");
push("### Preparaciones tradicionales");
push("");
push(
  "Los platos típicos (paella, tortilla, gazpacho, fabada…) **varían según receta**. El catálogo usa una porción estándar **con fines educativos**. Los ejemplos de lección pueden ilustrar otra porción; cuando difieren, el texto lo indica.",
);
push("");
push("### Fichas");
push("");
push(
  "Las fichas favorecen el recuerdo mediante **repetición** y **recuperación activa** (porción / HC / raciones) sobre los alimentos del nivel.",
);
push("");
push("---");
push("");
push("## Errores frecuentes (educación)");
push("");
push("| Error | Corrección Migajas |");
push("|-------|-------------------|");
push(
  "| Confundir gramos de alimento con gramos de HC | El curso dedica una lección entera a esta distinción |",
);
push(
  "| Contar toda la ensalada como 0 o como mucho | Depende de la verdura y la porción; mira la ficha |",
);
push(
  "| Olvidar bebidas (zumo, leche, cerveza) | Bebidas con HC cuentan; el alcohol además implica hipoglucemia tardía |",
);
push(
  "| Usar otra marca / etiqueta distinta | Prioriza la etiqueta del producto concreto |",
);
push(
  "| Pesar cocinado cuando la ficha es otra forma | Usa la porción descrita en la ficha (taza cocida, etc.) |",
);
push(
  "| «Integral = menos HC» | Integral ≠ menos carbohidratos; cambia el tipo de harina |",
);
push(
  "| «La fruta no cuenta porque es natural» | La fruta aporta HC; la porción importa |",
);
push("");
push(
  "Serie editorial relacionada: `docs/content-library/common-mistakes.md`.",
);
push("");
push("---");
push("");
push("## Tipos de ejercicio");
push("");
const byType = {};
for (const e of exercises) byType[e.type] = (byType[e.type] || 0) + 1;
push("| Tipo | Qué mide | Nº |");
push("|------|----------|----|");
push(`| \`count_rations\` | Calcular raciones | ${byType.count_rations || 0} |`);
push(`| \`multiple_choice\` | Concepto | ${byType.multiple_choice || 0} |`);
push(
  `| \`identify_portion\` | Reconocer porción | ${byType.identify_portion || 0} |`,
);
push("");
push("---");
push("");
push(
  `## Porciones y mediciones (catálogo España — ${es.length} ítems)`,
);
push("");
push(
  "Raciones = HC ÷ 10. Columnas **Origen** y **Conteo** documentan precisión y política pedagógica.",
);
push("");
push("| Columna | Significado |");
push("|---------|-------------|");
push("| Porción / g / HC | Valores de ficha |");
push("| Raciones | HC ÷ 10 |");
push("| Fibra | Si existe |");
push("| Tipo | base / modulator / mixed |");
push("| Origen | Código B/F/E/R/P |");
push("| Base | Criterio de porción (comestible / cocido / bebida…) |");
push(
  "| Conteo | Se contabiliza vs habitualmente no contabilizada (verduras) |",
);
push("");

for (const cat of order) {
  const arr = byCat[cat];
  if (!arr) continue;
  arr.sort((a, b) => a.name.localeCompare(b.name, "es"));
  push(`### ${cat} (${arr.length})`);
  push("");
  push(
    "| Alimento | Porción | g | HC (g) | Raciones | Fibra | Tipo | Origen | Base | Conteo |",
  );
  push(
    "|----------|---------|---|--------|----------|-------|------|--------|------|--------|",
  );
  for (const f of arr) {
    const fib =
      f.fiberG != null ? String(f.fiberG).replace(".", ",") : "—";
    const prov = provenanceOf(f);
    push(
      `| ${f.name} | ${f.portionText} | ${f.grams} | ${f.carbsG} | ${rations(f.carbsG)} | ${fib} | ${f.itemType || "—"} | ${sourceLabel[prov] || prov} | ${basisLabel[f.portionBasis] || f.portionBasis || "—"} | ${countingLabel[f.countingPolicy] || "—"} |`,
    );
  }
  push("");
}

push("---");
push("");
push("## Notas de revisión (transparencia)");
push("");
push(
  "El sistema se autoaudita (`npm run audit:foods`). Hallazgos ya abordados en v3:",
);
push("");
push("| Tema | Estado |");
push("|------|--------|");
push(
  "| Verduras «libres» | Unificado: bajo HC / habitualmente no contabilizadas vs ficha |",
);
push("| Judías verdes / brócoli | Contabilizan en porción de catálogo (~10 g HC) |");
push(
  "| Gazpacho / tortilla | Lecciones alineadas con catálogo + nota de variabilidad de receta |",
);
push("| Duplicados exactos ES/RD | Eliminados |");
push("| Agua / café / té | Categoría Bebida |");
push("| Bocadillo genérico | Ajustado a ~50 g HC (pan ~100 g) |");
push("| Chocolate negro | Especificado % cacao típico |");
push(`| Umbral aprobado | Documentado y fijado en ${PASS} % |`);
push("| Origen del dato | Campo `dataSource` en catálogo |");
push("");
push("Checklist revisor:");
push("");
push("- [ ] ¿10 g = 1 ración es el protocolo del servicio destino?");
push("- [ ] ¿HC totales por defecto es aceptable?");
push("- [ ] ¿La política de verduras encaja con el protocolo local?");
push("- [ ] ¿Las estimaciones de platos mixtos se aceptan como educativas?");
push(
  "- [ ] Auditoría BEDCA puntual de alimentos básicos antes de piloto formal",
);
push("");
push("---");
push("");
push("## Alineación científica (referencias)");
push("");
push("Currículo alineado con:");
push("");
push(
  "- Sociedad Española de Diabetes (SED) — educación terapéutica estructurada",
);
push("- Sociedad Española de Endocrinología y Nutrición (SEEN)");
push("- European Association for the Study of Diabetes (EASD)");
push("- Sistema español de intercambio de raciones (10 g HC = 1 ración)");
push("- BEDCA (AESAN) como referencia de composición para alimentos básicos ES");
push("- FEN — fibra y verdura");
push("");
push(
  "Detalle de fuentes en producto: `src/lib/domain/content-sources.ts`.",
);
push("");
push("---");
push("");
push("## Claims permitidos / prohibidos");
push("");
push("| Decir | No decir |");
push("|-------|----------|");
push("| Aprender a contar carbohidratos | «Controla tu diabetes» |");
push("| Alimentos y preparaciones habituales | Calcula insulina |");
push("| Autoevaluación (≥ " + PASS + " %) | Sustituye al equipo de salud |");
push("| Complemento entre talleres | Dispositivo médico |");
push("");
push("---");
push("");
push("## Next step");
push("");
push(
  "Outreach: [OUTREACH-90D-ACTION-PLAN.md](./OUTREACH-90D-ACTION-PLAN.md). QA catálogo: `npm run audit:foods`.",
);
push("");

fs.writeFileSync(
  "docs/commercial/CURRICULUM-INVENTORY.md",
  lines.join("\n"),
  "utf8",
);
console.log("wrote", lines.length, "lines; PASS_THRESHOLD documented as", PASS);
