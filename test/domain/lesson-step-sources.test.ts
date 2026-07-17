import { describe, it, expect } from "vitest";
import { getLessonById } from "@/lib/domain/lessons";

const LESSON_STEP_SOURCES: Array<{
  stepId: string;
  sourceIds: string[];
}> = [
  { stepId: "l1-lesson-4-s1", sourceIds: ["fen"] },
  { stepId: "l1-lesson-4-s4", sourceIds: ["migajas-fiber-policy"] },
  { stepId: "l2-lesson-1-s4", sourceIds: ["ada"] },
  { stepId: "l2-lesson-3-s4", sourceIds: ["fen", "ada"] },
  { stepId: "l3-lesson-1-s4", sourceIds: ["fen"] },
  { stepId: "l4-lesson-1-s4", sourceIds: ["ada", "fen"] },
  { stepId: "l5-lesson-3-s4", sourceIds: ["ada"] },
];

describe("lesson step sources", () => {
  for (const { stepId, sourceIds } of LESSON_STEP_SOURCES) {
    it(`${stepId} links to clinical or methodology sources`, () => {
      const lessonId = stepId.replace(/-s\d+$/, "");
      const lesson = getLessonById(lessonId);
      expect(lesson).toBeDefined();
      const step = lesson!.steps.find((item) => item.id === stepId);
      expect(step).toBeDefined();
      expect(step!.sourceIds).toEqual(sourceIds);
    });
  }
});
