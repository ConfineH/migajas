import { describe, it, expect } from "vitest";
import {
  mergeUserProgress,
  mergeAttempts,
  pickBestCompletion,
} from "@/lib/domain/progress-sync";
import type { UserProgress } from "@/lib/domain/progress";
import type { Attempt } from "@/lib/domain/attempts";

const emptyProgress: UserProgress = {
  completions: [],
  completedLessons: [],
  completedPracticeSteps: [],
  freeModeUnlocked: false,
  completedFlashcardLevels: [],
};

describe("pickBestCompletion", () => {
  it("prefers higher mastery score", () => {
    const a = {
      levelId: "nivel-1",
      masteryScore: 80,
      correctCount: 4,
      totalCount: 5,
      completedAt: "2026-01-01",
      passed: true,
    };
    const b = { ...a, masteryScore: 50, passed: false };
    expect(pickBestCompletion(a, b)).toEqual(a);
  });

  it("prefers passed when scores tie", () => {
    const passed = {
      levelId: "nivel-1",
      masteryScore: 60,
      correctCount: 3,
      totalCount: 5,
      completedAt: "2026-01-02",
      passed: true,
    };
    const failed = { ...passed, passed: false, completedAt: "2026-01-03" };
    expect(pickBestCompletion(passed, failed)).toEqual(passed);
  });
});

describe("mergeUserProgress", () => {
  it("returns local when remote is empty", () => {
    const local: UserProgress = {
      ...emptyProgress,
      completedLessons: ["l1"],
    };
    expect(mergeUserProgress(local, emptyProgress)).toEqual(local);
  });

  it("returns remote when local is empty", () => {
    const remote: UserProgress = {
      ...emptyProgress,
      completedLessons: ["l2"],
    };
    expect(mergeUserProgress(emptyProgress, remote)).toEqual(remote);
  });

  it("unions lessons and practice steps", () => {
    const local: UserProgress = {
      ...emptyProgress,
      completedLessons: ["l1"],
      completedPracticeSteps: ["p1"],
    };
    const remote: UserProgress = {
      ...emptyProgress,
      completedLessons: ["l2"],
      completedPracticeSteps: ["p2"],
    };
    const merged = mergeUserProgress(local, remote);
    expect(merged.completedLessons.sort()).toEqual(["l1", "l2"]);
    expect(merged.completedPracticeSteps.sort()).toEqual(["p1", "p2"]);
  });

  it("keeps best completion per level", () => {
    const local: UserProgress = {
      ...emptyProgress,
      completions: [
        {
          levelId: "nivel-1",
          masteryScore: 50,
          correctCount: 2,
          totalCount: 4,
          completedAt: "2026-01-01",
          passed: false,
        },
      ],
    };
    const remote: UserProgress = {
      ...emptyProgress,
      completions: [
        {
          levelId: "nivel-1",
          masteryScore: 80,
          correctCount: 4,
          totalCount: 5,
          completedAt: "2026-01-02",
          passed: true,
        },
      ],
    };
    const merged = mergeUserProgress(local, remote);
    expect(merged.completions).toHaveLength(1);
    expect(merged.completions[0].masteryScore).toBe(80);
  });

  it("ORs freeModeUnlocked", () => {
    const local = { ...emptyProgress, freeModeUnlocked: false };
    const remote = { ...emptyProgress, freeModeUnlocked: true };
    expect(mergeUserProgress(local, remote).freeModeUnlocked).toBe(true);
  });
});

describe("mergeAttempts", () => {
  it("combines and sorts by date descending", () => {
    const local: Attempt[] = [
      {
        exerciseId: "e1",
        selectedAnswer: "a",
        isCorrect: true,
        timeSpentMs: 100,
        createdAt: "2026-01-01T10:00:00Z",
      },
    ];
    const remote: Attempt[] = [
      {
        exerciseId: "e2",
        selectedAnswer: "b",
        isCorrect: false,
        timeSpentMs: 200,
        createdAt: "2026-01-02T10:00:00Z",
      },
    ];
    const merged = mergeAttempts(local, remote);
    expect(merged).toHaveLength(2);
    expect(merged[0].exerciseId).toBe("e2");
  });

  it("caps at 200 attempts", () => {
    const make = (i: number): Attempt => ({
      exerciseId: `e${i}`,
      selectedAnswer: "a",
      isCorrect: true,
      timeSpentMs: 1,
      createdAt: new Date(2026, 0, 1, 0, 0, i).toISOString(),
    });
    const local = Array.from({ length: 150 }, (_, i) => make(i));
    const remote = Array.from({ length: 100 }, (_, i) => make(i + 150));
    expect(mergeAttempts(local, remote)).toHaveLength(200);
  });
});
