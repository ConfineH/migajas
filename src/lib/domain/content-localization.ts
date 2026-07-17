import type { Exercise, ExerciseOption } from "@/lib/domain/exercises";
import type { Level } from "@/lib/domain/exercises";
import type { FoodItem } from "@/lib/domain/foods";
import type { Lesson, LessonStep } from "@/lib/domain/lessons";
import { calculateRations, formatRations } from "@/lib/domain/rations";
import {
  applyPlainLanguageDo,
  formatCarbsDo,
} from "@/lib/domain/plain-language-do";
import {
  DEFAULT_REGION_ID,
  getRegionById,
  type RegionProfile,
} from "@/lib/domain/regions";

/** Canonical (Spain) food id → regional equivalent */
const FOOD_REGION_ALIASES: Record<string, Record<string, string>> = {
  "pan-blanco": { do: "casabe" },
  "pan-molde": { do: "casabe" },
  "arroz-cocido-150g": { do: "arroz-blanco-do" },
  "pasta-cocida-140g": { do: "arroz-blanco-do" },
  "patata-cocida-150g": { do: "yautia" },
  "boniato-asado-130g": { do: "batata-do" },
  "lentejas-cocidas-200g": { do: "habichuelas-rojas" },
  "es-zumo-naranja": { do: "chinola" },
  "es-gazpacho": { do: "do-mangú" },
  "es-fabada": { do: "la-bandera" },
  "bocadillo-jamon": { do: "pan-sobao" },
  "patatas-fritas-150g": { do: "tostones" },
  "patatas-fritas-100g": { do: "tostones" },
  "pizza-pepperoni": { do: "la-bandera" },
  "leche-semi-200ml": { do: "leche-do" },
  "tostadas-pan": { do: "casabe" },
  "es-sandwich-mixto": { do: "pan-sobao" },
  manzana: { do: "mango" },
  leche: { do: "leche-do" },
  platano: { do: "platano-maduro" },
  "yogur-natural": { do: "do-yogur-do" },
  "arroz-cocido": { do: "arroz-blanco-do" },
  "pasta-cocida": { do: "arroz-blanco-do" },
  "patata-cocida": { do: "yautia" },
  boniato: { do: "batata-do" },
  "lentejas-cocidas": { do: "habichuelas-rojas" },
  "garbanzos-cocidos": { do: "guandules" },
  "alubias-cocidas": { do: "habichuelas-rojas" },
  calabaza: { do: "batata-do" },
  zanahoria: { do: "guineo-verde" },
  "tortilla-patata": { do: "mangu" },
  bocadillo: { do: "pan-sobao" },
  paella: { do: "moro-habichuelas" },
  pizza: { do: "la-bandera" },
  pollo: { do: "pollo-do" },
  pescado: { do: "pollo-do" },
  carne: { do: "pollo-do" },
  huevo: { do: "pollo-do" },
  "lentejas-estofadas": { do: "la-bandera" },
  "pan-integral": { do: "pan-sobao" },
  naranja: { do: "chinola" },
  "couscous-cocido": { do: "arroz-blanco-do" },
  "patata-frita": { do: "tostones" },
  "barra-pequena": { do: "pan-sobao" },
  tomate: { do: "guineo-verde" },
  fresas: { do: "mango" },
  pera: { do: "mango" },
  "pasta-tomate": { do: "moro-habichuelas" },
  "leche-media": { do: "leche-do" },
};

const LESSON_TEXT_OVERRIDES: Record<
  string,
  Partial<Record<"title" | "summary" | "body", string>>
> = {
  "l1-lesson-3:do:title": { title: "Alimentos básicos del día a día" },
  "l1-lesson-3:do:summary": {
    summary:
      "Casabe, frutas como mango y plátano, y leche: lo primero que conviene aprender.",
  },
  "l1-3-s1:do:body": {
    body: "Antes de platos con varias cosas, aprende lo básico: casabe, frutas de aquí y leche. Son los que más repites en el día a día.",
  },
  "l2-lesson-1:do:title": { title: "Arroz, yuca y plátano" },
  "l2-lesson-1:do:summary": {
    summary: "Cuánto arroz y cuánta yuca o plátano sueles poner en el plato.",
  },
  "l2-1-s1:do:body": {
    body: "El arroz, la yuca y el plátano se miden en tazas cuando están cocidos. Una cantidad normal suele tener unos 15 gramos de carbohidratos.",
  },
  "l2-lesson-2:do:title": { title: "Yuca, batata y plátano" },
  "l2-lesson-2:do:summary": {
    summary: "Raíces que salen mucho en la comida dominicana.",
  },
  "l2-2-s1:do:body": {
    body: "La yuca, la batata y el plátano tienen carbohidratos. Media taza pesa más que los gramos de carbohidratos que aportan: cuenta los carbohidratos, no solo el peso.",
  },
  "l3-lesson-1:do:title": { title: "Habichuelas y guandules" },
  "l3-lesson-1:do:summary": {
    summary: "Cuánto aportan las habichuelas en el plato de cada día.",
  },
  "l3-1-s2:do:body": {
    body: "Media taza de habichuelas rojas (100 g) tiene 15 gramos de carbohidratos = 1 ración.",
  },
  "l3-lesson-2:do:summary": {
    summary: "Verduras que sí cuentan para las raciones.",
  },
  "l3-2-s1:do:body": {
    body: "El guineo verde, la batata o la auyama tienen más carbohidratos que el aguacate. Hay que saber cuáles sí suman.",
  },
  "l4-lesson-1:do:title": { title: "Cuando el plato trae varias cosas" },
  "l4-lesson-1:do:summary": {
    summary: "Mangú, arroz con habichuelas y otros platos del día a día.",
  },
  "l4-1-s1:do:body": {
    body: "Un plato con varias cosas mezcla carbohidratos, proteína y grasa. Los carbohidratos vienen del arroz, la yuca, el plátano o el pan.",
  },
  "l4-1-s2:do:body": {
    body: "El mangú lleva plátano (carbohidratos) y huevo (casi no suma). Una porción puede tener unos 30 gramos de carbohidratos = 2 raciones.",
  },
  "l4-lesson-2:do:title": { title: "Comidas dominicanas de cada día" },
  "l4-lesson-2:do:summary": {
    summary: "Mangú, arroz con habichuelas y la bandera.",
  },
  "l4-2-s1:do:body": {
    body: "El arroz con habichuelas, el mangú y la bandera son platos muy comunes. Cada uno tiene distinta cantidad de carbohidratos según lo que sirvas.",
  },
  "l4-2-practice:do:body": {
    body: "Reconoce platos dominicanos con varias cosas en el mismo plato.",
  },
  "l5-lesson-2:do:title": { title: "Pollo, carne y huevo no cuentan" },
  "l5-2-s1:do:body": {
    body: "El pollo, la carne, el pescado y el huevo casi no tienen carbohidratos. Acompañan el plato pero no suman raciones.",
  },
  "l5-2-s2:do:body": {
    body: "Arroz con 15 gramos de carbohidratos + pollo (0) = solo 1 ración. El pollo no suma.",
  },
  "l5-1-s1:do:body": {
    body: "En un desayuno o almuerzo real, suma los gramos de carbohidratos de cada alimento y divide entre 15 para las raciones totales.",
  },
  "l5-3-s1:do:body": {
    body: "Mango con leche, arroz con habichuelas o mangú son cosas que ves a menudo. Practica con lo que comes de verdad.",
  },
  "l5-3-practice:do:body": {
    body: "Resuelve un ejemplo con comida dominicana de verdad.",
  },
};

const LEVEL_DESCRIPTION_OVERRIDES: Record<string, string> = {
  "nivel-1:do":
    "Casabe, frutas como mango y plátano, y leche. Aprende cuánto comes de cada cosa.",
  "nivel-2:do":
    "Arroz con yuca, plátano y batata. Lo que más sale en el plato dominicano.",
  "nivel-3:do":
    "Habichuelas, guandules y verduras que sí cuentan para las raciones.",
  "nivel-4:do":
    "Mangú, arroz con habichuelas y la bandera. Platos con varias cosas juntas.",
};

const COMBO_STEP_FOODS: Record<string, { primary: string; secondary: string }> =
  {
    "l5-1-s2": { primary: "pan-blanco", secondary: "leche" },
    "l5-2-s2": { primary: "arroz-cocido", secondary: "pollo" },
  };

export function resolveRegionalFoodId(
  canonicalFoodId: string,
  regionId: string,
): string {
  if (regionId === DEFAULT_REGION_ID) return canonicalFoodId;
  return FOOD_REGION_ALIASES[canonicalFoodId]?.[regionId] ?? canonicalFoodId;
}

export function localizeLevel(level: Level, region: RegionProfile): Level {
  if (region.id === DEFAULT_REGION_ID) return level;

  const override = LEVEL_DESCRIPTION_OVERRIDES[`${level.id}:${region.id}`];
  return {
    ...level,
    description: finishRegionalText(
      override ?? localizeLessonText(level.description, region),
      region,
    ),
  };
}

export function localizeLesson(
  lesson: Lesson,
  region: RegionProfile,
  foods: FoodItem[],
): Lesson {
  if (region.id === DEFAULT_REGION_ID) return lesson;

  const foodById = new Map(foods.map((food) => [food.id, food]));

  return {
    ...lesson,
    title: finishRegionalText(
      overrideLessonField(lesson.id, region.id, "title", lesson.title),
      region,
    ),
    summary: finishRegionalText(
      overrideLessonField(
        lesson.id,
        region.id,
        "summary",
        localizeLessonText(lesson.summary, region),
      ),
      region,
    ),
    steps: lesson.steps.map((step) => localizeLessonStep(step, region, foodById)),
  };
}

export function localizeExercise(
  exercise: Exercise,
  region: RegionProfile,
  foods: FoodItem[],
): Exercise {
  if (region.id === DEFAULT_REGION_ID) return exercise;

  const foodById = new Map(foods.map((food) => [food.id, food]));
  const canonicalFoodId = exercise.foodId;
  if (!canonicalFoodId) {
    return {
      ...exercise,
      prompt: finishRegionalText(localizeLessonText(exercise.prompt, region), region),
      explanation: finishRegionalText(
        localizeLessonText(exercise.explanation, region),
        region,
      ),
    };
  }

  const regionalFoodId = resolveRegionalFoodId(canonicalFoodId, region.id);
  const food = foodById.get(regionalFoodId);
  if (!food) return exercise;

  const rations = calculateRations(food.carbsG, region.exchangeUnitG);
  const correctAnswer =
    exercise.type === "identify_portion"
      ? regionalFoodId
      : rations.toFixed(1);

  return {
    ...exercise,
    foodId: regionalFoodId,
    correctAnswer,
    prompt: finishRegionalText(buildExercisePrompt(exercise, food, region), region),
    explanation: finishRegionalText(
      buildExerciseExplanation(food, region),
      region,
    ),
    options: buildExerciseOptions(exercise, food, region, foodById, correctAnswer),
  };
}

function localizeLessonStep(
  step: LessonStep,
  region: RegionProfile,
  foodById: Map<string, FoodItem>,
): LessonStep {
  const title = overrideStepField(step.id, region.id, "title", step.title);
  const body = overrideStepField(
    step.id,
    region.id,
    "body",
    step.type === "example" && step.foodId
      ? buildExampleBody(step, region, foodById)
      : localizeLessonText(step.body, region),
  );

  const regionalFoodId = step.foodId
    ? resolveRegionalFoodId(step.foodId, region.id)
    : undefined;

  return {
    ...step,
    title: finishRegionalText(
      step.type === "example" && regionalFoodId
        ? `Ejemplo: ${foodById.get(regionalFoodId)?.name.toLowerCase() ?? title}`
        : title,
      region,
    ),
    body: finishRegionalText(body, region),
    foodId: regionalFoodId,
  };
}

function buildExampleBody(
  step: LessonStep,
  region: RegionProfile,
  foodById: Map<string, FoodItem>,
): string {
  const combo = COMBO_STEP_FOODS[step.id];
  if (combo) {
    const primary = foodById.get(
      resolveRegionalFoodId(combo.primary, region.id),
    );
    const secondary = foodById.get(
      resolveRegionalFoodId(combo.secondary, region.id),
    );
    if (!primary || !secondary) return localizeLessonText(step.body, region);

    const totalCarbs = primary.carbsG + secondary.carbsG;
    const totalRations = calculateRations(totalCarbs, region.exchangeUnitG);
    if (region.id === "do") {
      return applyPlainLanguageDo(
        `${primary.name} (${formatCarbsDo(primary.carbsG)}) + ${secondary.name.toLowerCase()} (${formatCarbsDo(secondary.carbsG)}) = ${formatCarbsDo(totalCarbs)} en total = ${formatRations(totalRations)} raciones.`,
      );
    }
    return `${primary.name} (${primary.carbsG} g HC) + ${secondary.name.toLowerCase()} (${secondary.carbsG} g HC) = ${totalCarbs} g HC total = ${formatRations(totalRations)} raciones.`;
  }

  if (!step.foodId) return localizeLessonText(step.body, region);

  const food = foodById.get(resolveRegionalFoodId(step.foodId, region.id));
  if (!food) return localizeLessonText(step.body, region);

  const rations = calculateRations(food.carbsG, region.exchangeUnitG);
  if (region.id === "do") {
    return applyPlainLanguageDo(
      `${food.portionText} de ${food.name.toLowerCase()} (${food.grams} g) tiene ${formatCarbsDo(food.carbsG)} = ${formatRations(rations)} raciones.`,
    );
  }
  return `${food.portionText} de ${food.name.toLowerCase()} (${food.grams} g) aporta ${food.carbsG} g de HC = ${formatRations(rations)} raciones.`;
}

function buildExercisePrompt(
  exercise: Exercise,
  food: FoodItem,
  region: RegionProfile,
): string {
  const rations = calculateRations(food.carbsG, region.exchangeUnitG);

  if (exercise.type === "identify_portion") {
    return `¿Qué alimento corresponde a «${food.portionText}» con ${food.carbsG} g de carbohidratos?`;
  }

  if (exercise.type === "count_rations") {
    if (region.id === "do") {
      return `${food.name}: tiene ${food.carbsG} gramos de carbohidratos. ¿Cuántas raciones son?`;
    }
    return `${food.name}: aporta ${food.carbsG} g de carbohidratos. ¿Cuántas raciones son?`;
  }

  if (region.id === "do") {
    return `¿Cuántas raciones de carbohidratos tiene ${food.portionText.toLowerCase()} de ${food.name.toLowerCase()}? (${food.carbsG} gramos de carbohidratos)`;
  }

  return `¿Cuántas raciones de carbohidratos aporta ${food.portionText.toLowerCase()} de ${food.name.toLowerCase()}? (${food.carbsG} g HC)`;
}

function buildExerciseExplanation(food: FoodItem, region: RegionProfile): string {
  const rations = calculateRations(food.carbsG, region.exchangeUnitG);
  if (region.id === "do") {
    return `${formatCarbsDo(food.carbsG)} ÷ ${region.exchangeUnitG} = ${formatRations(rations)} raciones. El ${food.name.toLowerCase()} es comida muy común aquí.`;
  }
  return `${food.carbsG} g de carbohidratos ÷ ${region.exchangeUnitG} = ${formatRations(rations)} raciones. ${food.name} es un alimento habitual en ${region.name}.`;
}

function buildExerciseOptions(
  exercise: Exercise,
  food: FoodItem,
  region: RegionProfile,
  foodById: Map<string, FoodItem>,
  correctAnswer: string,
): ExerciseOption[] {
  if (exercise.type === "identify_portion") {
    return exercise.options.map((option) => {
      const regionalId = resolveRegionalFoodId(option.value, region.id);
      const optionFood = foodById.get(regionalId);
      return {
        ...option,
        label: optionFood?.name ?? option.label,
        value: regionalId,
        isCorrect: regionalId === correctAnswer,
      };
    });
  }

  const correct = Number(correctAnswer);
  const candidates = [
    correct,
    correct - 0.5,
    correct + 0.5,
    correct + 1,
    correct - 1,
    1,
  ]
    .filter((value) => value > 0)
    .map((value) => Math.round(value * 10) / 10);

  const unique = [...new Set(candidates)]
    .sort((a, b) => a - b)
    .slice(0, 4);

  if (!unique.includes(correct)) unique.unshift(correct);

  return unique.map((value, index) => ({
    id: String.fromCharCode(97 + index),
    label: formatOptionLabel(value, exercise.type),
    value: value.toFixed(1),
    isCorrect: value === correct,
  }));
}

function formatOptionLabel(value: number, type: Exercise["type"]): string {
  const formatted = formatRations(value).replace(".", ",");
  if (type === "multiple_choice") {
    return `${formatted} ración${value === 1 ? "" : "es"}`;
  }
  return formatted;
}

function localizeLessonText(text: string, region: RegionProfile): string {
  let localized = text
    .replaceAll("España", region.name)
    .replaceAll("españoles", region.id === "do" ? "dominicanos" : "españoles")
    .replaceAll("española", region.id === "do" ? "dominicana" : "española")
    .replaceAll("español", region.id === "do" ? "dominicano" : "español")
    .replaceAll("divide entre 10", `divide entre ${region.exchangeUnitG}`)
    .replaceAll("Divide entre 10", `Divide entre ${region.exchangeUnitG}`)
    .replaceAll("÷ 10", `÷ ${region.exchangeUnitG}`)
    .replaceAll("entre 10 para", `entre ${region.exchangeUnitG} para`)
    .replaceAll("10 gramos de HC", `${region.exchangeUnitG} gramos de HC`)
    .replaceAll("10 g de HC", `${region.exchangeUnitG} g de HC`)
    .replaceAll("equivale a 10 gramos", `equivale a ${region.exchangeUnitG} gramos`);

  if (region.id === "do") {
    localized = localized
      .replaceAll("pan, frutas y lácteos", "casabe, frutas como mango y plátano, y leche")
      .replaceAll("Pan, fruta y lácteos", "Casabe, frutas como mango y plátano, y leche")
      .replaceAll("Arroz, pasta y patata", "Arroz, yuca, plátano y batata")
      .replaceAll("Lentejas, garbanzos", "Habichuelas y guandules")
      .replaceAll("Tortilla, paella, bocadillo", "Mangú, arroz con habichuelas y la bandera")
      .replaceAll("tortilla de patata", "mangú")
      .replaceAll("Tortilla de patata", "Mangú")
      .replaceAll("paella", "arroz con habichuelas")
      .replaceAll("Paella", "Arroz con habichuelas")
      .replaceAll("patata y boniato", "yuca, batata y plátano")
      .replaceAll("Patata y boniato", "Yuca, batata y plátano")
      .replaceAll("Arroz y pasta", "Arroz, yuca y plátano");
    localized = applyPlainLanguageDo(localized);
  }

  return localized;
}

function finishRegionalText(text: string, region: RegionProfile): string {
  if (region.id !== "do") return text;
  return applyPlainLanguageDo(text);
}

function overrideLessonField(
  lessonId: string,
  regionId: string,
  field: "title" | "summary",
  fallback: string,
): string {
  const key = `${lessonId}:${regionId}:${field}`;
  return LESSON_TEXT_OVERRIDES[key]?.[field] ?? fallback;
}

function overrideStepField(
  stepId: string,
  regionId: string,
  field: "title" | "body",
  fallback: string,
): string {
  const key = `${stepId}:${regionId}:${field}`;
  return LESSON_TEXT_OVERRIDES[key]?.[field] ?? fallback;
}
