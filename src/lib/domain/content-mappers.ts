import type { Difficulty, FoodItem, ItemType } from "@/lib/domain/foods";
import type { Lesson, LessonStep, LevelExam } from "@/lib/domain/lessons";

export interface FoodRow {
  id: string;
  country: string;
  category: string;
  name: string;
  portion_text: string;
  grams: number;
  carbs_g: number;
  difficulty: Difficulty;
  item_type: ItemType;
  notes: string;
}

export interface LessonRow {
  id: string;
  level_id: string;
  order_index: number;
  title: string;
  summary: string;
  steps: LessonStep[];
}

export interface LevelExamRow {
  level_id: string;
  title: string;
  description: string;
  exercise_ids: string[];
}

export function mapFoodRow(row: FoodRow): FoodItem {
  return {
    id: row.id,
    country: row.country,
    category: row.category,
    name: row.name,
    portionText: row.portion_text,
    grams: Number(row.grams),
    carbsG: Number(row.carbs_g),
    difficulty: row.difficulty,
    itemType: row.item_type,
    notes: row.notes,
  };
}

export function mapLessonRow(row: LessonRow): Lesson {
  return {
    id: row.id,
    levelId: row.level_id,
    orderIndex: row.order_index,
    title: row.title,
    summary: row.summary,
    steps: row.steps,
  };
}

export function mapLevelExamRow(row: LevelExamRow): LevelExam {
  return {
    levelId: row.level_id,
    title: row.title,
    description: row.description,
    exerciseIds: row.exercise_ids,
  };
}
