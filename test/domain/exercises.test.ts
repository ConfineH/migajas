import { describe, it, expect } from "vitest";
import {
  gradeAnswer,
  getExercisesForLevel,
  getExerciseTypesForLevel,
  type Exercise,
} from "@/lib/domain/exercises";

const sampleExercise: Exercise = {
  id: "ex-1",
  levelId: "nivel-1",
  type: "multiple_choice",
  prompt: "¿Cuántas raciones aporta 15 g de HC?",
  explanation: "15 g ÷ 10 = 1,5 raciones",
  difficulty: "Baja",
  correctAnswer: "1.5",
  options: [
    { id: "a", label: "1,0", value: "1.0", isCorrect: false },
    { id: "b", label: "1,5", value: "1.5", isCorrect: true },
    { id: "c", label: "2,0", value: "2.0", isCorrect: false },
  ],
};

describe("gradeAnswer", () => {
  it("returns true when answer matches correctAnswer", () => {
    expect(gradeAnswer(sampleExercise, "1.5")).toBe(true);
  });

  it("returns false when answer is wrong", () => {
    expect(gradeAnswer(sampleExercise, "2.0")).toBe(false);
  });
});

describe("getExercisesForLevel", () => {
  it("returns only exercises for nivel-1", () => {
    const exercises = getExercisesForLevel("nivel-1");
    expect(exercises.length).toBeGreaterThan(0);
    expect(exercises.every((e) => e.levelId === "nivel-1")).toBe(true);
  });

  it("returns empty array for unknown level", () => {
    expect(getExercisesForLevel("nivel-99")).toHaveLength(0);
  });
});

describe("getExerciseTypesForLevel", () => {
  it("level 1 has at least 3 exercise types", () => {
    const types = getExerciseTypesForLevel("nivel-1");
    expect(types.length).toBeGreaterThanOrEqual(3);
  });
});
