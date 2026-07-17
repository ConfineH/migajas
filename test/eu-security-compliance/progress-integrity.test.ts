import { describe, it, expect } from "vitest";
import type { Attempt } from "@/lib/domain/attempts";
import type { ExamSession } from "@/lib/domain/exam-session";
import type { UserProgress } from "@/lib/domain/progress";
import {
  computeExamScoreFromAttempts,
  validateGuidedAction,
  validateLevelCompletion,
} from "@/lib/domain/progress-integrity";
import { toGuidedProgress } from "@/lib/domain/guided-flow";
import { getLessonsForLevel } from "@/lib/domain/lessons";
import { getExercisesForLevel } from "@/lib/domain/exercises";

const examSession: ExamSession = {
  levelId: "nivel-3",
  exerciseIds: ["ex-a", "ex-b", "ex-c", "ex-d"],
  startedAt: "2026-07-17T10:00:00.000Z",
  inProgress: true,
};

function attempt(
  exerciseId: string,
  isCorrect: boolean,
  createdAt: string,
): Attempt {
  return {
    exerciseId,
    selectedAnswer: "x",
    isCorrect,
    timeSpentMs: 1000,
    createdAt,
  };
}

describe("computeExamScoreFromAttempts", () => {
  it("returns incomplete when not all exam exercises were attempted", () => {
    const attempts = [
      attempt("ex-a", true, "2026-07-17T10:01:00.000Z"),
      attempt("ex-b", false, "2026-07-17T10:02:00.000Z"),
    ];

    const score = computeExamScoreFromAttempts(examSession, attempts);

    expect(score.complete).toBe(false);
    expect(score.correct).toBe(1);
    expect(score.total).toBe(4);
  });

  it("uses the latest attempt per exercise after session start", () => {
    const attempts = [
      attempt("ex-a", false, "2026-07-17T09:59:00.000Z"),
      attempt("ex-a", true, "2026-07-17T10:01:00.000Z"),
      attempt("ex-b", true, "2026-07-17T10:02:00.000Z"),
      attempt("ex-c", false, "2026-07-17T10:03:00.000Z"),
      attempt("ex-d", true, "2026-07-17T10:04:00.000Z"),
    ];

    const score = computeExamScoreFromAttempts(examSession, attempts);

    expect(score).toEqual({ correct: 3, total: 4, complete: true });
  });
});

describe("validateLevelCompletion", () => {
  it("rejects exam completion without an active session", () => {
    const progress: UserProgress = {
      completions: [],
      completedLessons: [],
      completedPracticeSteps: [],
      freeModeUnlocked: false,
    };

    const result = validateLevelCompletion(
      progress,
      [],
      "nivel-3",
      getExercisesForLevel("nivel-3").map((e) => e.id),
    );

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.status).toBe(403);
    }
  });

  it("rejects exam completion when attempts are incomplete", () => {
    const progress: UserProgress = {
      completions: [],
      completedLessons: [],
      completedPracticeSteps: [],
      freeModeUnlocked: false,
      activeExamSessions: [examSession],
    };

    const result = validateLevelCompletion(
      progress,
      [attempt("ex-a", true, "2026-07-17T10:01:00.000Z")],
      "nivel-3",
      [],
    );

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.status).toBe(403);
    }
  });

  it("accepts exam completion when all session exercises were answered", () => {
    const progress: UserProgress = {
      completions: [],
      completedLessons: [],
      completedPracticeSteps: [],
      freeModeUnlocked: false,
      activeExamSessions: [examSession],
    };
    const attempts = examSession.exerciseIds.map((id, index) =>
      attempt(id, index < 3, `2026-07-17T10:0${index + 1}:00.000Z`),
    );

    const result = validateLevelCompletion(progress, attempts, "nivel-3", []);

    expect(result).toEqual({ ok: true, correct: 3, total: 4 });
  });
});

describe("validateGuidedAction", () => {
  it("rejects skipping ahead to a later lesson", () => {
    const lessons = getLessonsForLevel("nivel-1");
    const secondLesson = lessons[1];
    expect(secondLesson).toBeDefined();

    const progress = toGuidedProgress({
      completions: [],
      completedLessons: [],
      completedPracticeSteps: [],
    });

    const result = validateGuidedAction(progress, "complete-lesson", secondLesson!.id);

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.status).toBe(403);
    }
  });

  it("allows completing the next lesson in sequence", () => {
    const lessons = getLessonsForLevel("nivel-1");
    const firstLesson = lessons[0];
    expect(firstLesson).toBeDefined();

    const progress = toGuidedProgress({
      completions: [],
      completedLessons: [],
      completedPracticeSteps: [],
    });

    const result = validateGuidedAction(progress, "complete-lesson", firstLesson!.id);

    expect(result.ok).toBe(true);
  });
});
