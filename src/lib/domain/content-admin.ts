import type { Difficulty, ItemType } from "@/lib/domain/foods";
import type { LessonStep } from "@/lib/domain/lessons";

const DIFFICULTIES: Difficulty[] = ["Baja", "Media", "Alta"];
const ITEM_TYPES: ItemType[] = ["base", "mixed", "modulator"];
const STEP_TYPES: LessonStep["type"][] = ["explanation", "example", "practice"];

export interface FoodUpdateInput {
  id: string;
  name: string;
  category: string;
  portionText: string;
  grams: number;
  carbsG: number;
  difficulty: Difficulty;
  itemType: ItemType;
  notes: string;
}

export interface LessonUpdateInput {
  id: string;
  title: string;
  summary: string;
}

export interface LessonStepsUpdateInput {
  id: string;
  steps: LessonStep[];
}

export interface ExamUpdateInput {
  levelId: string;
  title: string;
  description: string;
  exerciseIds: string[];
}

export function parseExerciseIds(raw: string): string[] {
  return raw
    .split(/[,\n]/)
    .map((id) => id.trim())
    .filter(Boolean);
}

export function validateFoodUpdate(input: FoodUpdateInput): string | null {
  if (!input.id.trim()) return "ID requerido";
  if (!input.name.trim()) return "Nombre requerido";
  if (!input.category.trim()) return "Categoría requerida";
  if (!input.portionText.trim()) return "Porción requerida";
  if (!Number.isFinite(input.grams) || input.grams <= 0) {
    return "Gramos inválidos";
  }
  if (!Number.isFinite(input.carbsG) || input.carbsG < 0) {
    return "Carbohidratos inválidos";
  }
  if (!DIFFICULTIES.includes(input.difficulty)) return "Dificultad inválida";
  if (!ITEM_TYPES.includes(input.itemType)) return "Tipo inválido";
  return null;
}

export function validateLessonUpdate(input: LessonUpdateInput): string | null {
  if (!input.id.trim()) return "ID requerido";
  if (!input.title.trim()) return "Título requerido";
  if (!input.summary.trim()) return "Resumen requerido";
  return null;
}

export function foodUpdateToRow(input: FoodUpdateInput) {
  return {
    id: input.id,
    name: input.name.trim(),
    category: input.category.trim(),
    portion_text: input.portionText.trim(),
    grams: input.grams,
    carbs_g: input.carbsG,
    difficulty: input.difficulty,
    item_type: input.itemType,
    notes: input.notes.trim(),
    updated_at: new Date().toISOString(),
  };
}

export function lessonUpdateToRow(input: LessonUpdateInput) {
  return {
    id: input.id,
    title: input.title.trim(),
    summary: input.summary.trim(),
    updated_at: new Date().toISOString(),
  };
}

export function validateLessonStepsUpdate(
  input: LessonStepsUpdateInput,
): string | null {
  if (!input.id.trim()) return "ID requerido";
  if (input.steps.length === 0) return "La lección debe tener al menos un paso";

  for (const step of input.steps) {
    if (!step.id.trim()) return "Hay un paso sin ID";
    if (!step.title.trim()) return "Hay un paso sin título";
    if (!step.body.trim()) return "Hay un paso sin contenido";
    if (!STEP_TYPES.includes(step.type)) return "Tipo de paso inválido";
  }

  return null;
}

export function lessonStepsUpdateToRow(input: LessonStepsUpdateInput) {
  return {
    id: input.id,
    steps: input.steps.map((step) => ({
      ...step,
      id: step.id.trim(),
      title: step.title.trim(),
      body: step.body.trim(),
    })),
    updated_at: new Date().toISOString(),
  };
}

export function validateExamUpdate(input: ExamUpdateInput): string | null {
  if (!input.levelId.trim()) return "Nivel requerido";
  if (!input.title.trim()) return "Título requerido";
  if (!input.description.trim()) return "Descripción requerida";
  if (input.exerciseIds.length === 0) return "Añade al menos un ejercicio";
  return null;
}

export function examUpdateToRow(input: ExamUpdateInput) {
  return {
    level_id: input.levelId,
    title: input.title.trim(),
    description: input.description.trim(),
    exercise_ids: input.exerciseIds,
    updated_at: new Date().toISOString(),
  };
}
