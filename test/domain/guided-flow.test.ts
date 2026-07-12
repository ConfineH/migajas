import { describe, it, expect } from "vitest";
import {
  getLessonsForLevel,
  getPracticeStepIds,
  getExamForLevel,
} from "@/lib/domain/lessons";
import {
  buildGuidedSequence,
  getNextGuidedItem,
  completeLesson,
  completePracticeStep,
  isFreeModeUnlocked,
  canStartExam,
  type GuidedProgress,
} from "@/lib/domain/guided-flow";

describe("getLessonsForLevel", () => {
  it("returns ordered lessons for nivel-1", () => {
    const lessons = getLessonsForLevel("nivel-1");
    expect(lessons.length).toBeGreaterThanOrEqual(3);
    expect(lessons[0].orderIndex).toBeLessThan(lessons[1].orderIndex);
  });
});

describe("buildGuidedSequence", () => {
  it("alternates lessons, practice, and ends with exam", () => {
    const seq = buildGuidedSequence("nivel-1");
    expect(seq[0].type).toBe("lesson");
    expect(seq.some((i) => i.type === "practice")).toBe(true);
    expect(seq[seq.length - 1].type).toBe("exam");
  });
});

describe("getNextGuidedItem", () => {
  const empty: GuidedProgress = {
    completedLessons: [],
    completedPracticeSteps: [],
    levelCompletions: [],
    freeModeUnlocked: false,
  };

  it("returns first lesson when nothing completed", () => {
    const next = getNextGuidedItem(empty, "nivel-1");
    expect(next?.type).toBe("lesson");
  });

  it("returns practice after lesson is completed", () => {
    const lessons = getLessonsForLevel("nivel-1");
    const progress = completeLesson(empty, lessons[0].id);
    const next = getNextGuidedItem(progress, "nivel-1");
    expect(next?.type).toBe("practice");
  });
});

describe("canStartExam", () => {
  it("allows exam when all lessons and practices are done", () => {
    const lessons = getLessonsForLevel("nivel-1");
    let progress: GuidedProgress = {
      completedLessons: [],
      completedPracticeSteps: [],
      levelCompletions: [],
      freeModeUnlocked: false,
    };
    for (const lesson of lessons) {
      progress = completeLesson(progress, lesson.id);
      const practiceIds = getPracticeStepIds(lesson);
      for (const stepId of practiceIds) {
        progress = completePracticeStep(progress, stepId);
      }
    }
    expect(canStartExam(progress, "nivel-1")).toBe(true);
  });

  it("blocks exam when lessons are incomplete", () => {
    expect(canStartExam({
      completedLessons: [],
      completedPracticeSteps: [],
      levelCompletions: [],
      freeModeUnlocked: false,
    }, "nivel-1")).toBe(false);
  });
});

describe("isFreeModeUnlocked", () => {
  it("unlocks after nivel-1 exam passed", () => {
    const progress: GuidedProgress = {
      completedLessons: [],
      completedPracticeSteps: [],
      levelCompletions: [
        {
          levelId: "nivel-1",
          masteryScore: 75,
          correctCount: 3,
          totalCount: 4,
          completedAt: "2026-01-01",
          passed: true,
        },
      ],
      freeModeUnlocked: true,
    };
    expect(isFreeModeUnlocked(progress)).toBe(true);
  });

  it("stays locked without exam pass", () => {
    expect(isFreeModeUnlocked({
      completedLessons: ["l1-lesson-1"],
      completedPracticeSteps: [],
      levelCompletions: [],
      freeModeUnlocked: false,
    })).toBe(false);
  });
});

describe("getExamForLevel", () => {
  it("returns exam with exercises for nivel-1", () => {
    const exam = getExamForLevel("nivel-1");
    expect(exam).toBeDefined();
    expect(exam!.exerciseIds.length).toBeGreaterThanOrEqual(3);
  });
});
