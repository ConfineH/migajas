import { describe, it, expect } from "vitest";
import { getFoods } from "@/lib/data/foods";
import { getAllExercises, getExerciseById } from "@/lib/domain/exercises";
import {
  getAllLessons,
  getExamForLevel,
  getLessonsForLevel,
} from "@/lib/domain/lessons";

const foodIds = new Set(getFoods().map((f) => f.id));

const LESSON_COUNTS: Record<string, number> = {
  "nivel-1": 5,
  "nivel-2": 3,
  "nivel-3": 2,
  "nivel-4": 3,
  "nivel-5": 3,
};

const EXAM_SPECS: Record<
  string,
  { poolSize: number; questionsPerExam: number }
> = {
  "nivel-1": { poolSize: 12, questionsPerExam: 5 },
  "nivel-2": { poolSize: 10, questionsPerExam: 4 },
  "nivel-3": { poolSize: 10, questionsPerExam: 4 },
  "nivel-4": { poolSize: 12, questionsPerExam: 4 },
  "nivel-5": { poolSize: 15, questionsPerExam: 6 },
};

const LESSON_EXERCISE_IDS = [
  "ex-l1-1-basic-ration",
  "ex-l1-2-label-reading",
  "ex-l1-3-zero-carb-identify",
  "ex-l1-4-fiber-net-carbs",
  "ex-l1-5-fruit-bread-dairy",
  "ex-l2-1-rice-pasta-portions",
  "ex-l2-2-potato-sweet-potato",
  "ex-l2-3-legumes-counting",
  "ex-l3-1-vegetable-carb-identify",
  "ex-l3-2-fruit-density-juice",
  "ex-l4-1-mixed-plate-sum",
  "ex-l4-2-spanish-home-dishes",
  "ex-l4-3-tapas-bocadillo-pizza",
  "ex-l5-1-fat-protein-delayed-glucose",
  "ex-l5-2-full-day-menu",
  "ex-l5-3-alcohol-celebrations",
];

function assertFoodExists(id: string) {
  expect(foodIds.has(id), `missing food: ${id}`).toBe(true);
}

describe("pedagogical content v2", () => {
  it("has 16 lessons across 5 levels", () => {
    expect(getAllLessons()).toHaveLength(16);
  });

  for (const [levelId, count] of Object.entries(LESSON_COUNTS)) {
    it(`${levelId} has ${count} lessons`, () => {
      expect(getLessonsForLevel(levelId)).toHaveLength(count);
    });
  }

  it("includes new nivel-1 lessons on modulators and fiber", () => {
    const ids = getLessonsForLevel("nivel-1").map((l) => l.id);
    expect(ids).toContain("l1-lesson-3");
    expect(ids).toContain("l1-lesson-4");
    expect(ids).toContain("l1-lesson-5");
  });

  it("moves legumes to nivel-2", () => {
    const nivel2Titles = getLessonsForLevel("nivel-2").map((l) => l.title);
    expect(nivel2Titles.some((t) => t.toLowerCase().includes("legumbre"))).toBe(
      true,
    );
    const nivel3Titles = getLessonsForLevel("nivel-3").map((l) => l.title);
    expect(nivel3Titles.some((t) => t.toLowerCase().includes("legumbre"))).toBe(
      false,
    );
  });

  for (const exerciseId of LESSON_EXERCISE_IDS) {
    it(`lesson exercise ${exerciseId} exists`, () => {
      expect(getExerciseById(exerciseId)).toBeDefined();
    });
  }

  it("each lesson ends with a linked practice exercise", () => {
    for (const lesson of getAllLessons()) {
      const practice = lesson.steps.filter((s) => s.type === "practice");
      expect(practice).toHaveLength(1);
      expect(practice[0].exerciseId).toBeDefined();
      expect(getExerciseById(practice[0].exerciseId!)).toBeDefined();
    }
  });

  for (const [levelId, spec] of Object.entries(EXAM_SPECS)) {
    it(`${levelId} exam pool has ${spec.poolSize} questions and draws ${spec.questionsPerExam}`, () => {
      const exam = getExamForLevel(levelId);
      expect(exam).toBeDefined();
      expect(exam!.poolExerciseIds).toHaveLength(spec.poolSize);
      expect(exam!.questionsPerExam).toBe(spec.questionsPerExam);
      for (const id of exam!.poolExerciseIds) {
        expect(getExerciseById(id), `missing pool exercise ${id}`).toBeDefined();
      }
    });
  }

  it("all lesson food references exist in catalog", () => {
    for (const lesson of getAllLessons()) {
      for (const step of lesson.steps) {
        if (step.foodId) assertFoodExists(step.foodId);
      }
    }
  });

  it("all exercise food references exist in catalog", () => {
    for (const exercise of getAllExercises()) {
      if (exercise.foodId) assertFoodExists(exercise.foodId);
    }
  });
});
