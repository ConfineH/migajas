import { getExerciseById } from "./exercises";
import type { EnrichedFoodItem, FoodItem } from "./foods";
import { enrichFoodItem } from "./foods";
import { formatRations } from "./rations";
import { getExamForLevel, getLessonsForLevel } from "./lessons";

export type FlashcardMode = "portion" | "carbs" | "rations";

export const FLASHCARD_MODES: FlashcardMode[] = ["portion", "carbs", "rations"];

export interface LevelFlashcard {
  foodId: string;
  mode: FlashcardMode;
}

export interface FlashcardFace {
  front: string;
  back: string;
  hint?: string;
}

export function uniqueFoodIds(ids: (string | undefined)[]): string[] {
  return [...new Set(ids.filter((id): id is string => Boolean(id)))];
}

export function collectLessonFoodIds(levelId: string): string[] {
  const lessons = getLessonsForLevel(levelId);
  const ids: string[] = [];
  for (const lesson of lessons) {
    for (const step of lesson.steps) {
      if (step.foodId) ids.push(step.foodId);
    }
  }
  return uniqueFoodIds(ids);
}

export function collectExamPoolFoodIds(levelId: string): string[] {
  const exam = getExamForLevel(levelId);
  if (!exam) return [];

  return uniqueFoodIds(
    exam.poolExerciseIds.map((exerciseId) => getExerciseById(exerciseId)?.foodId),
  );
}

/** Foods that must appear in fichas: lessons + exam pool. */
export function getEssentialFlashcardFoodIds(levelId: string): string[] {
  return uniqueFoodIds([
    ...collectLessonFoodIds(levelId),
    ...collectExamPoolFoodIds(levelId),
  ]);
}

export function buildLevelFlashcardDeck(levelId: string): LevelFlashcard[] {
  const foodIds = getEssentialFlashcardFoodIds(levelId);
  const cards: LevelFlashcard[] = [];

  for (const foodId of foodIds) {
    for (const mode of FLASHCARD_MODES) {
      cards.push({ foodId, mode });
    }
  }

  return cards;
}

export function getFlashcardFace(
  card: LevelFlashcard,
  food: FoodItem | EnrichedFoodItem,
  exchangeUnitG: number,
): FlashcardFace {
  const enriched = "rations" in food ? food : enrichFoodItem(food, exchangeUnitG);
  const rationsLabel = formatRations(enriched.rations).replace(".", ",");

  switch (card.mode) {
    case "portion":
      return {
        front: `¿Cuál es la porción estándar de ${food.name}?`,
        back: `${food.portionText} (${food.grams} g)`,
        hint: "Piensa en la medida habitual del catálogo",
      };
    case "carbs":
      return {
        front: `¿Cuántos gramos de HC aporta la porción estándar de ${food.name}?`,
        back: `${food.carbsG} g de HC`,
        hint: `${food.portionText} · ${food.grams} g`,
      };
    case "rations":
      return {
        front: `La porción estándar de ${food.name} aporta ${food.carbsG} g de HC. ¿Cuántas raciones son?`,
        back: `${rationsLabel} raciones`,
        hint: `Divide ${food.carbsG} entre ${exchangeUnitG}`,
      };
  }
}

export function getFlashcardsStepId(levelId: string): string {
  return `flashcards-${levelId}`;
}
