import { describe, expect, it } from "vitest";
import {
  getExerciseById,
  getExercisesForLevel,
} from "@/lib/domain/exercises";
import { getAllLessons, getExamForLevel } from "@/lib/domain/lessons";

const RETIRED_IDS = [
  "ex-l2-3-legumes-counting",
  "n2-ex6",
  "n2-ex7",
  "n2-ex9",
] as const;

const REPLACEMENTS = [
  "ex-l2-3-label-rations",
  "n2-ex6-legume-identify",
  "n2-ex7-label-rations",
  "n2-ex9-label-rations",
] as const;

describe("unreviewed nutrition examples", () => {
  it("keeps the label calculation as a hypothetical label", () => {
    const exercise = getExerciseById("ex-l1-2-label-reading");
    expect(exercise?.prompt).toContain("etiqueta hipotética");
    expect(exercise?.prompt.toLowerCase()).not.toContain("yogur");
    expect(exercise?.foodId).toBeUndefined();
    expect(exercise?.correctAnswer).toBe("0.6");
    expect(exercise?.retired).not.toBe(true);
  });

  it("keeps the old quantitative prompts for stored attempts", () => {
    expect(getExerciseById("n2-ex6")?.prompt).toContain("16 g");
    expect(getExerciseById("n2-ex7")?.correctAnswer).toBe("1.4");
    expect(getExerciseById("ex-l2-3-legumes-counting")?.correctAnswer).toBe(
      "2.4",
    );
    expect(getExerciseById("n2-ex9")?.correctAnswer).toBe("1.2");
    for (const id of RETIRED_IDS) {
      expect(getExerciseById(id)?.retired, id).toBe(true);
    }
  });

  it("does not offer the retired questions in practice or exams", () => {
    const visible = new Set(
      getExercisesForLevel("nivel-2").map((exercise) => exercise.id),
    );
    const pooled = new Set(getExamForLevel("nivel-2")!.poolExerciseIds);
    for (const id of RETIRED_IDS) {
      expect(visible.has(id), id).toBe(false);
      expect(pooled.has(id), id).toBe(false);
    }
    for (const id of REPLACEMENTS) {
      const exercise = getExerciseById(id);
      expect(exercise?.retired, id).not.toBe(true);
      expect(visible.has(id), id).toBe(true);
      expect(pooled.has(id), id).toBe(true);
      if (id === "n2-ex6-legume-identify") {
        expect(`${exercise?.prompt} ${exercise?.explanation}`, id).not.toMatch(
          /\d+ g/,
        );
      } else {
        expect(exercise?.prompt, id).toContain("etiqueta hipotética");
        expect(exercise?.prompt.toLowerCase(), id).not.toMatch(
          /lenteja|alubia|puré/,
        );
        expect(exercise?.type, id).toBe("count_rations");
      }
    }
  });

  it("removes disputed gram claims from the lesson path", () => {
    const steps = getAllLessons().flatMap((lesson) => lesson.steps);
    const practice = steps.find((step) => step.id === "l2-lesson-3-practice");
    expect(practice?.exerciseId).toBe("ex-l2-3-label-rations");
    for (const id of [
      "l1-lesson-2-s4",
      "l2-lesson-2-s1a",
      "l2-lesson-2-s3",
      "l2-lesson-3-s1",
      "l2-lesson-3-s2",
    ]) {
      const step = steps.find((item) => item.id === id);
      expect(step?.foodId, id).toBeUndefined();
      expect(step?.body, id).not.toMatch(/69 g|24 g|16 g|14 g|12 g|5-6 g/);
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
        const exercise = getExerciseById(id);
        expect(exercise, id).toBeDefined();
        expect(exercise?.retired, id).not.toBe(true);
      }
    }
  });
});
