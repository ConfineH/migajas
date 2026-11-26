import { describe, expect, it } from "vitest";
import { getExerciseById } from "@/lib/domain/exercises";
import { getAllLessons, getExamForLevel } from "@/lib/domain/lessons";

const HELD_EXERCISE_IDS = [
  "ex-l1-2-label-reading",
  "ex-l2-3-legumes-counting",
  "n2-ex6",
  "n2-ex7",
  "n2-ex9",
] as const;

const HELD_STEP_IDS = [
  "l1-lesson-2-s4",
  "l2-lesson-2-s3",
  "l2-lesson-3-s1",
  "l2-lesson-3-s2",
] as const;

describe("unreviewed nutrition examples", () => {
  it("keeps the label calculation as a hypothetical label", () => {
    const exercise = getExerciseById("ex-l1-2-label-reading");
    expect(exercise?.prompt).toContain("etiqueta hipotética");
    expect(exercise?.prompt.toLowerCase()).not.toContain("yogur");
    expect(exercise?.foodId).toBeUndefined();
    expect(exercise?.correctAnswer).toBe("0.6");
  });

  it("does not score the disputed gram claims", () => {
    for (const id of HELD_EXERCISE_IDS) {
      const exercise = getExerciseById(id);
      expect(exercise, id).toBeDefined();
      expect(exercise?.foodId, id).toBeUndefined();
      const text = `${exercise?.prompt} ${exercise?.explanation}`;
      expect(text, id).not.toMatch(/24 g|16 g|14 g|12 g/);
    }
  });

  it("removes those claims from the lesson path", () => {
    const steps = getAllLessons().flatMap((lesson) => lesson.steps);
    for (const id of HELD_STEP_IDS) {
      const step = steps.find((item) => item.id === id);
      expect(step, id).toBeDefined();
      expect(step?.foodId, id).toBeUndefined();
      expect(step?.body, id).not.toMatch(/24 g|16 g|14 g|12 g|5-6 g/);
    }
  });

  it("keeps every exam pool at least as large as the exam", () => {
    for (const levelId of ["nivel-1", "nivel-2", "nivel-3", "nivel-4", "nivel-5"]) {
      const exam = getExamForLevel(levelId);
      expect(exam).toBeDefined();
      expect(exam!.poolExerciseIds.length).toBeGreaterThanOrEqual(
        exam!.questionsPerExam,
      );
      for (const id of exam!.poolExerciseIds) {
        expect(getExerciseById(id), id).toBeDefined();
      }
    }
    expect(getExamForLevel("nivel-1")!.poolExerciseIds).toContain(
      "ex-l1-2-label-reading",
    );
    expect(getExamForLevel("nivel-2")!.poolExerciseIds).toEqual(
      expect.arrayContaining([
        "ex-l2-3-legumes-counting",
        "n2-ex6",
        "n2-ex7",
        "n2-ex9",
      ]),
    );
  });
});
