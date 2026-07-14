import type { Exercise, ExerciseOption } from "@/lib/domain/exercises";
import type { FoodItem } from "@/lib/domain/foods";
import type { Lesson, LessonStep } from "@/lib/domain/lessons";
import { calculateRations, formatRations } from "@/lib/domain/rations";
import {
  DEFAULT_REGION_ID,
  getRegionById,
  type RegionProfile,
} from "@/lib/domain/regions";

/** Canonical (Spain) food id → regional equivalent */
const FOOD_REGION_ALIASES: Record<string, Record<string, string>> = {
  "pan-blanco": { do: "casabe" },
  manzana: { do: "mango" },
  leche: { do: "leche-do" },
  platano: { do: "platano-maduro" },
  "yogur-natural": { do: "leche-do" },
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
};

const LESSON_TEXT_OVERRIDES: Record<
  string,
  Partial<Record<"title" | "summary" | "body", string>>
> = {
  "l4-lesson-2:do:title": { title: "Platos dominicanos habituales" },
  "l4-lesson-2:do:summary": {
    summary: "Moro, mangú y la bandera en la vida real.",
  },
  "l4-2-s1:do:body": {
    body: "Moro, mangú y la bandera son platos frecuentes. Cada uno concentra HC de forma distinta según la porción.",
  },
  "l5-3-s1:do:body": {
    body: "Mango con leche, moro de habichuelas o mangú son situaciones que encontrarás a menudo. Practica con porciones reales.",
  },
  "l5-3-practice:do:body": {
    body: "Resuelve un caso real de comida dominicana.",
  },
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

export function localizeLesson(
  lesson: Lesson,
  region: RegionProfile,
  foods: FoodItem[],
): Lesson {
  if (region.id === DEFAULT_REGION_ID) return lesson;

  const foodById = new Map(foods.map((food) => [food.id, food]));

  return {
    ...lesson,
    title: overrideLessonField(lesson.id, region.id, "title", lesson.title),
    summary: overrideLessonField(
      lesson.id,
      region.id,
      "summary",
      localizeLessonText(lesson.summary, region),
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
      prompt: localizeLessonText(exercise.prompt, region),
      explanation: localizeLessonText(exercise.explanation, region),
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
    prompt: buildExercisePrompt(exercise, food, region),
    explanation: buildExerciseExplanation(food, region),
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
    title:
      step.type === "example" && regionalFoodId
        ? `Ejemplo: ${foodById.get(regionalFoodId)?.name.toLowerCase() ?? title}`
        : title,
    body,
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
    return `${primary.name} (${primary.carbsG} g HC) + ${secondary.name.toLowerCase()} (${secondary.carbsG} g HC) = ${totalCarbs} g HC total = ${formatRations(totalRations)} raciones.`;
  }

  if (!step.foodId) return localizeLessonText(step.body, region);

  const food = foodById.get(resolveRegionalFoodId(step.foodId, region.id));
  if (!food) return localizeLessonText(step.body, region);

  const rations = calculateRations(food.carbsG, region.exchangeUnitG);
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
    return `${food.name}: aporta ${food.carbsG} g de carbohidratos. ¿Cuántas raciones son?`;
  }

  return `¿Cuántas raciones de carbohidratos aporta ${food.portionText.toLowerCase()} de ${food.name.toLowerCase()}? (${food.carbsG} g HC)`;
}

function buildExerciseExplanation(food: FoodItem, region: RegionProfile): string {
  const rations = calculateRations(food.carbsG, region.exchangeUnitG);
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
  return text
    .replaceAll("España", region.name)
    .replaceAll("españoles", region.id === "do" ? "dominicanos" : "españoles")
    .replaceAll("española", region.id === "do" ? "dominicana" : "española")
    .replaceAll("divide entre 10", `divide entre ${region.exchangeUnitG}`)
    .replaceAll("Divide entre 10", `Divide entre ${region.exchangeUnitG}`)
    .replaceAll("÷ 10", `÷ ${region.exchangeUnitG}`)
    .replaceAll("entre 10 para", `entre ${region.exchangeUnitG} para`)
    .replaceAll("10 gramos de HC", `${region.exchangeUnitG} gramos de HC`)
    .replaceAll("10 g de HC", `${region.exchangeUnitG} g de HC`)
    .replaceAll("equivale a 10 gramos", `equivale a ${region.exchangeUnitG} gramos`);
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
