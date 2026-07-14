import { describe, it, expect } from "vitest";
import {
  parseExerciseIds,
  validateExamUpdate,
  validateLessonStepsUpdate,
  validateFoodUpdate,
  validateLessonUpdate,
} from "@/lib/domain/content-admin";
import type { LessonStep } from "@/lib/domain/lessons";

describe("content-admin validation", () => {
  it("rejects invalid food grams", () => {
    expect(
      validateFoodUpdate({
        id: "f1",
        name: "Pan",
        category: "Pan",
        portionText: "1 rebanada",
        grams: 0,
        carbsG: 10,
        difficulty: "Baja",
        itemType: "base",
        notes: "",
      }),
    ).toBe("Gramos inválidos");
  });

  it("accepts valid lesson update", () => {
    expect(
      validateLessonUpdate({
        id: "l1",
        title: "Título",
        summary: "Resumen",
      }),
    ).toBeNull();
  });

  it("parses exercise ids from commas and newlines", () => {
    expect(parseExerciseIds("a, b\nc")).toEqual(["a", "b", "c"]);
  });

  it("rejects exam without exercises", () => {
    expect(
      validateExamUpdate({
        levelId: "nivel-1",
        title: "Examen",
        description: "Desc",
        poolExerciseIds: [],
        questionsPerExam: 4,
      }),
    ).toBe("Añade al menos un ejercicio al banco");
  });

  it("rejects pool smaller than questions per exam", () => {
    expect(
      validateExamUpdate({
        levelId: "nivel-1",
        title: "Examen",
        description: "Desc",
        poolExerciseIds: ["a", "b"],
        questionsPerExam: 4,
      }),
    ).toBe(
      "El banco debe tener al menos tantos ejercicios como preguntas por examen",
    );
  });

  it("rejects lesson steps with empty body", () => {
    const steps: LessonStep[] = [
      {
        id: "s1",
        type: "explanation",
        title: "T",
        body: "",
      },
    ];
    expect(validateLessonStepsUpdate({ id: "l1", steps })).toBe(
      "Hay un paso sin contenido",
    );
  });
});
