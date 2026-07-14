import type { Exercise, ExerciseOption } from "@/lib/domain/exercises";
import type { Level } from "@/lib/domain/exercises";
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
    summary: "Casabe, fruta tropical y lácteos: los primeros alimentos que debes reconocer.",
  },
  "l1-3-s1:do:body": {
    body: "Antes de platos combinados, domina alimentos base: casabe, frutas tropicales y lácteos. Son los que más repetirás.",
  },
  "l2-lesson-1:do:title": { title: "Arroz y viandas" },
  "l2-lesson-1:do:summary": {
    summary: "Arroz blanco y viandas: porciones habituales y raciones.",
  },
  "l2-1-s1:do:body": {
    body: "El arroz y las viandas (yautía, batata, plátano) se miden en tazas cuando están cocidos. Una porción típica suele aportar unos 15 g de HC.",
  },
  "l2-lesson-2:do:title": { title: "Yautía y batata" },
  "l2-lesson-2:do:summary": {
    summary: "Viandas en el plato diario dominicano.",
  },
  "l2-2-s1:do:body": {
    body: "Yautía, batata y plátano aportan HC en porciones de media taza. El peso de la vianda no coincide con los gramos de carbohidratos.",
  },
  "l3-lesson-1:do:title": { title: "Habichuelas y guandules" },
  "l3-lesson-1:do:summary": {
    summary: "Legumbres cocidas en porción habitual.",
  },
  "l3-1-s2:do:body": {
    body: "1/2 taza de habichuelas rojas (100 g) = 15 g HC = 1,0 ración con la regla dominicana.",
  },
  "l3-lesson-2:do:summary": {
    summary: "Viandas y vegetales que sí aportan HC.",
  },
  "l3-2-s1:do:body": {
    body: "Guineo verde, batata o auyama aportan más HC que aguacate o berro. Hay que conocer las que sí suman raciones.",
  },
  "l4-lesson-1:do:title": { title: "¿Qué es un plato mixto?" },
  "l4-1-s2:do:body": {
    body: "El mangú combina vianda (HC) y acompañamiento. Una porción puede aportar unos 30 g de HC = 2,0 raciones.",
  },
  "l4-lesson-2:do:title": { title: "Platos dominicanos habituales" },
  "l4-lesson-2:do:summary": {
    summary: "Moro, mangú y la bandera en la vida real.",
  },
  "l4-2-s1:do:body": {
    body: "Moro, mangú y la bandera son platos frecuentes. Cada uno concentra HC de forma distinta según la porción.",
  },
  "l4-2-practice:do:body": {
    body: "Identifica platos mixtos dominicanos.",
  },
  "l5-1-s1:do:body": {
    body: "En un desayuno o comida real, suma los gramos de HC de cada alimento y divide entre 15 para obtener las raciones totales.",
  },
  "l5-3-s1:do:body": {
    body: "Mango con leche, moro de habichuelas o mangú son situaciones que encontrarás a menudo. Practica con porciones reales.",
  },
  "l5-3-practice:do:body": {
    body: "Resuelve un caso real de comida dominicana.",
  },
};

const LEVEL_DESCRIPTION_OVERRIDES: Record<string, string> = {
  "nivel-1:do":
    "Casabe, fruta tropical y lácteos. Aprende a reconocer porciones y raciones en alimentos sencillos.",
  "nivel-2:do":
    "Arroz, viandas y plátano. Alimentos base de la cocina dominicana.",
  "nivel-3:do":
    "Habichuelas, guandules y viandas con más contenido de HC.",
  "nivel-4:do":
    "Mangú, moro de habichuelas y la bandera: platos compuestos habituales.",
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
    description: override ?? localizeLessonText(level.description, region),
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
      .replaceAll("pan, frutas y lácteos", "casabe, frutas tropicales y lácteos")
      .replaceAll("Pan, fruta y lácteos", "Casabe, fruta tropical y lácteos")
      .replaceAll("Arroz, pasta y patata", "Arroz, viandas y plátano")
      .replaceAll("Lentejas, garbanzos", "Habichuelas y guandules")
      .replaceAll("Tortilla, paella, bocadillo", "Mangú, moro y la bandera")
      .replaceAll("tortilla de patata", "mangú")
      .replaceAll("Tortilla de patata", "Mangú")
      .replaceAll("paella", "moro de habichuelas")
      .replaceAll("Paella", "Moro de habichuelas")
      .replaceAll("patata y boniato", "yautía y batata")
      .replaceAll("Patata y boniato", "Yautía y batata")
      .replaceAll("Arroz y pasta", "Arroz y viandas");
  }

  return localized;
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
