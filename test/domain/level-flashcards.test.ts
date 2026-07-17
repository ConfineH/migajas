import { describe, it, expect } from "vitest";
import {
  buildLevelFlashcardDeck,
  collectExamPoolFoodIds,
  collectLessonFoodIds,
  getEssentialFlashcardFoodIds,
  getFlashcardFace,
  FLASHCARD_MODES,
} from "@/lib/domain/level-flashcards";
import { getExamForLevel } from "@/lib/domain/lessons";
import { getExerciseById } from "@/lib/domain/exercises";
import { getFoodById } from "@/lib/data/foods";
import { enrichFoodItem } from "@/lib/domain/foods";

describe("level-flashcards", () => {
  it("collects food ids from nivel-2 lessons", () => {
    const ids = collectLessonFoodIds("nivel-2");
    expect(ids).toContain("arroz-cocido-150g");
    expect(ids).toContain("patata-cocida-150g");
  });

  it("deck has three modes per essential food", () => {
    const foodIds = getEssentialFlashcardFoodIds("nivel-2");
    const deck = buildLevelFlashcardDeck("nivel-2");
    expect(deck.length).toBe(foodIds.length * FLASHCARD_MODES.length);
  });

  it("covers every exam pool food", () => {
    const exam = getExamForLevel("nivel-2")!;
    const poolFoodIds = exam.poolExerciseIds
      .map((id) => getExerciseById(id)?.foodId)
      .filter((id): id is string => Boolean(id));
    const essential = getEssentialFlashcardFoodIds("nivel-2");

    for (const foodId of poolFoodIds) {
      expect(essential).toContain(foodId);
    }
  });

  it("builds portion, carbs, and rations faces", () => {
    const food = getFoodById("arroz-cocido");
    expect(food).toBeDefined();
    const enriched = enrichFoodItem(food!, 10);

    const portion = getFlashcardFace(
      { foodId: "arroz-cocido", mode: "portion" },
      enriched,
      10,
    );
    expect(portion.front).toContain("Arroz");
    expect(portion.back).toContain("1/3 taza");

    const carbs = getFlashcardFace(
      { foodId: "arroz-cocido", mode: "carbs" },
      enriched,
      10,
    );
    expect(carbs.back).toContain("15 g");

    const rations = getFlashcardFace(
      { foodId: "arroz-cocido", mode: "rations" },
      enriched,
      10,
    );
    expect(rations.back).toContain("1,5");
  });

  it("uses plain language for Dominican fichas", () => {
    const food = getFoodById("casabe");
    expect(food).toBeDefined();
    const enriched = enrichFoodItem(food!, 15, "do");

    const carbs = getFlashcardFace(
      { foodId: "casabe", mode: "carbs" },
      enriched,
      15,
      "do",
    );
    expect(carbs.front).toContain("carbohidratos");
    expect(carbs.front).not.toContain("HC");
    expect(carbs.back).toContain("carbohidratos");
  });

  it("exam pool food ids are a subset of essential set", () => {
    const fromExam = collectExamPoolFoodIds("nivel-3");
    const essential = getEssentialFlashcardFoodIds("nivel-3");
    for (const id of fromExam) {
      expect(essential).toContain(id);
    }
  });
});
