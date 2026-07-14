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
  completeFlashcards,
  isFreeModeUnlocked,
  canStartExam,
  hasCompletedFlashcards,
  hasPassedNivel3,
  canUseClinicalMode,
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
  it("alternates lessons, practice, fichas, and ends with exam", () => {
    const seq = buildGuidedSequence("nivel-1");
    expect(seq[0].type).toBe("lesson");
    expect(seq.some((i) => i.type === "practice")).toBe(true);
    expect(seq[seq.length - 2].type).toBe("flashcards");
    expect(seq[seq.length - 1].type).toBe("exam");
  });
});

describe("getNextGuidedItem", () => {
  const empty: GuidedProgress = {
    completedLessons: [],
    completedPracticeSteps: [],
    completedFlashcardLevels: [],
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
      completedFlashcardLevels: [],
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
    expect(getNextGuidedItem(progress, "nivel-1")?.type).toBe("flashcards");
  });

  it("blocks exam when lessons are incomplete", () => {
    expect(canStartExam({
      completedLessons: [],
      completedPracticeSteps: [],
      completedFlashcardLevels: [],
      levelCompletions: [],
      freeModeUnlocked: false,
    }, "nivel-1")).toBe(false);
  });
});

describe("hasCompletedFlashcards", () => {
  it("tracks flashcard completion per level", () => {
    const base: GuidedProgress = {
      completedLessons: [],
      completedPracticeSteps: [],
      completedFlashcardLevels: [],
      levelCompletions: [],
      freeModeUnlocked: false,
    };
    expect(hasCompletedFlashcards(base, "nivel-2")).toBe(false);
    const done = completeFlashcards(base, "nivel-2");
    expect(hasCompletedFlashcards(done, "nivel-2")).toBe(true);
  });
});

describe("isFreeModeUnlocked", () => {
  it("unlocks after nivel-1 exam passed", () => {
    const progress: GuidedProgress = {
      completedLessons: [],
      completedPracticeSteps: [],
      completedFlashcardLevels: [],
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
    expect(exam!.poolExerciseIds.length).toBeGreaterThanOrEqual(3);
    expect(exam!.questionsPerExam).toBe(4);
  });
});

describe("hasPassedNivel3", () => {
  it("is true when nivel-3 exam passed", () => {
    const progress: GuidedProgress = {
      completedLessons: [],
      completedPracticeSteps: [],
      completedFlashcardLevels: [],
      levelCompletions: [
        {
          levelId: "nivel-3",
          masteryScore: 80,
          correctCount: 4,
          totalCount: 5,
          completedAt: "2026-01-01",
          passed: true,
        },
      ],
      freeModeUnlocked: true,
    };
    expect(hasPassedNivel3(progress)).toBe(true);
  });

  it("is false when only nivel-2 passed", () => {
    const progress: GuidedProgress = {
      completedLessons: [],
      completedPracticeSteps: [],
      completedFlashcardLevels: [],
      levelCompletions: [
        {
          levelId: "nivel-2",
          masteryScore: 80,
          correctCount: 4,
          totalCount: 5,
          completedAt: "2026-01-01",
          passed: true,
        },
      ],
      freeModeUnlocked: true,
    };
    expect(hasPassedNivel3(progress)).toBe(false);
  });
});

describe("canUseClinicalMode", () => {
  const nivel3Passed: GuidedProgress = {
    completedLessons: [],
    completedPracticeSteps: [],
    completedFlashcardLevels: [],
    levelCompletions: [
      {
        levelId: "nivel-3",
        masteryScore: 80,
        correctCount: 4,
        totalCount: 5,
        completedAt: "2026-01-01",
        passed: true,
      },
    ],
    freeModeUnlocked: true,
  };

  it("requires nivel 3, opt-in, and feature flag", () => {
    expect(
      canUseClinicalMode(nivel3Passed, { clinical_mode_enabled: true }),
    ).toBe(true);
    expect(
      canUseClinicalMode(nivel3Passed, { clinical_mode_enabled: false }),
    ).toBe(false);
    expect(
      canUseClinicalMode(
        {
          ...nivel3Passed,
          levelCompletions: [],
        },
        { clinical_mode_enabled: true },
      ),
    ).toBe(false);
    expect(
      canUseClinicalMode(nivel3Passed, { clinical_mode_enabled: true }, {
        featureEnabled: false,
      }),
    ).toBe(false);
  });
});
