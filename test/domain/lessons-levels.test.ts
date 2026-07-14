import { describe, it, expect } from "vitest";
import {
  getLessonsForLevel,
  getExamForLevel,
  getAllLessons,
} from "@/lib/domain/lessons";
import {
  isGuidedLevelUnlocked,
  buildGuidedSequence,
  type GuidedProgress,
} from "@/lib/domain/guided-flow";
import { getLevels } from "@/lib/domain/exercises";

const levels = getLevels();

describe("lessons levels 2-5", () => {
  for (const levelId of ["nivel-2", "nivel-3", "nivel-4", "nivel-5"]) {
    it(`${levelId} has at least 2 lessons`, () => {
      expect(getLessonsForLevel(levelId).length).toBeGreaterThanOrEqual(2);
    });

    it(`${levelId} has an exam`, () => {
      const exam = getExamForLevel(levelId);
      expect(exam).toBeDefined();
      expect(exam!.poolExerciseIds.length).toBeGreaterThanOrEqual(3);
    });

    it(`${levelId} guided sequence ends with exam`, () => {
      const seq = buildGuidedSequence(levelId);
      expect(seq[seq.length - 1].type).toBe("exam");
    });
  }
});

describe("isGuidedLevelUnlocked", () => {
  const empty: GuidedProgress = {
    completedLessons: [],
    completedPracticeSteps: [],
    levelCompletions: [],
    freeModeUnlocked: false,
  };

  it("always unlocks nivel-1", () => {
    expect(isGuidedLevelUnlocked("nivel-1", empty, levels)).toBe(true);
  });

  it("locks nivel-2 until nivel-1 exam passed", () => {
    expect(isGuidedLevelUnlocked("nivel-2", empty, levels)).toBe(false);
    const progress: GuidedProgress = {
      ...empty,
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
    };
    expect(isGuidedLevelUnlocked("nivel-2", progress, levels)).toBe(true);
  });
});

describe("total lesson coverage", () => {
  it("has lessons for all 5 levels", () => {
    const byLevel = new Set(getAllLessons().map((l) => l.levelId));
    expect(byLevel.size).toBe(5);
  });
});
