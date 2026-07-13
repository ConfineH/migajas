import { describe, it, expect } from "vitest";
import {
  mapFoodRow,
  mapLessonRow,
  mapLevelExamRow,
} from "@/lib/domain/content-mappers";
import { buildLearningEventRecord } from "@/lib/domain/analytics-persist";
import { buildLessonCompletedEvent } from "@/lib/domain/analytics";

describe("mapFoodRow", () => {
  it("maps snake_case DB row to FoodItem", () => {
    const food = mapFoodRow({
      id: "pan-blanco",
      country: "España",
      category: "Pan",
      name: "Pan blanco",
      portion_text: "1 rebanada",
      grams: 25,
      carbs_g: 10,
      difficulty: "Baja",
      item_type: "base",
      notes: "Base",
    });
    expect(food.portionText).toBe("1 rebanada");
    expect(food.carbsG).toBe(10);
    expect(food.itemType).toBe("base");
  });
});

describe("mapLessonRow", () => {
  it("maps lesson row with jsonb steps", () => {
    const lesson = mapLessonRow({
      id: "l1-lesson-1",
      level_id: "nivel-1",
      order_index: 1,
      title: "Test",
      summary: "Summary",
      steps: [
        {
          id: "s1",
          type: "explanation",
          title: "T",
          body: "B",
        },
      ],
    });
    expect(lesson.levelId).toBe("nivel-1");
    expect(lesson.steps).toHaveLength(1);
  });
});

describe("mapLevelExamRow", () => {
  it("maps exam exercise ids", () => {
    const exam = mapLevelExamRow({
      level_id: "nivel-1",
      title: "Examen",
      description: "Desc",
      exercise_ids: ["n1-ex1"],
    });
    expect(exam.exerciseIds).toEqual(["n1-ex1"]);
  });
});

describe("buildLearningEventRecord", () => {
  it("builds insert row for authenticated user", () => {
    const event = buildLessonCompletedEvent("l1-lesson-1", "nivel-1");
    const row = buildLearningEventRecord(event, "user-123");
    expect(row.user_id).toBe("user-123");
    expect(row.event_type).toBe("lesson_completed");
    expect(row.payload.lessonId).toBe("l1-lesson-1");
  });
});
