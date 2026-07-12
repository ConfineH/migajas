import { describe, it, expect } from "vitest";
import {
  PASS_THRESHOLD,
  calculateMasteryScore,
  hasPassed,
  isLevelUnlocked,
  completeLevel,
  getLevelCompletion,
  getFailedExerciseIds,
  type UserProgress,
} from "@/lib/domain/progress";
import type { Attempt } from "@/lib/domain/attempts";

const levels = [
  { id: "nivel-1", orderIndex: 1 },
  { id: "nivel-2", orderIndex: 2 },
  { id: "nivel-3", orderIndex: 3 },
];

describe("calculateMasteryScore", () => {
  it("returns 100 for perfect score", () => {
    expect(calculateMasteryScore(6, 6)).toBe(100);
  });

  it("returns 50 for half correct", () => {
    expect(calculateMasteryScore(3, 6)).toBe(50);
  });
});

describe("hasPassed", () => {
  it(`passes at ${PASS_THRESHOLD}% or above`, () => {
    expect(hasPassed(60)).toBe(true);
    expect(hasPassed(59)).toBe(false);
  });
});

describe("isLevelUnlocked", () => {
  it("always unlocks level 1", () => {
    expect(isLevelUnlocked(1, [], levels)).toBe(true);
  });

  it("locks level 2 until level 1 is passed", () => {
    expect(isLevelUnlocked(2, [], levels)).toBe(false);
    const progress: UserProgress = {
      completions: [
        {
          levelId: "nivel-1",
          masteryScore: 80,
          correctCount: 5,
          totalCount: 6,
          completedAt: "2026-01-01",
          passed: true,
        },
      ],
      completedLessons: [],
      completedPracticeSteps: [],
      freeModeUnlocked: false,
    };
    expect(isLevelUnlocked(2, progress.completions, levels)).toBe(true);
  });

  it("does not unlock level 2 if level 1 failed", () => {
    const progress: UserProgress = {
      completions: [
        {
          levelId: "nivel-1",
          masteryScore: 40,
          correctCount: 2,
          totalCount: 5,
          completedAt: "2026-01-01",
          passed: false,
        },
      ],
      completedLessons: [],
      completedPracticeSteps: [],
      freeModeUnlocked: false,
    };
    expect(isLevelUnlocked(2, progress.completions, levels)).toBe(false);
  });
});

describe("completeLevel", () => {
  const empty: UserProgress = {
    completions: [],
    completedLessons: [],
    completedPracticeSteps: [],
    freeModeUnlocked: false,
  };

  it("records completion with mastery score", () => {
    const result = completeLevel(empty, "nivel-1", 5, 6);
    const completion = getLevelCompletion(result, "nivel-1");
    expect(completion?.masteryScore).toBe(83);
    expect(completion?.passed).toBe(true);
  });

  it("unlocks free mode when nivel-1 exam is passed", () => {
    const result = completeLevel(empty, "nivel-1", 4, 4);
    expect(result.freeModeUnlocked).toBe(true);
  });
});

describe("getFailedExerciseIds", () => {
  it("returns exercises where latest attempt was wrong", () => {
    const attempts: Attempt[] = [
      {
        exerciseId: "ex-1",
        selectedAnswer: "a",
        isCorrect: false,
        timeSpentMs: 1000,
        createdAt: "2026-01-01T10:00:00Z",
      },
      {
        exerciseId: "ex-1",
        selectedAnswer: "b",
        isCorrect: true,
        timeSpentMs: 1000,
        createdAt: "2026-01-01T11:00:00Z",
      },
      {
        exerciseId: "ex-2",
        selectedAnswer: "a",
        isCorrect: false,
        timeSpentMs: 1000,
        createdAt: "2026-01-01T10:00:00Z",
      },
    ];
    const failed = getFailedExerciseIds(attempts, ["ex-1", "ex-2"]);
    expect(failed).toEqual(["ex-2"]);
  });
});
