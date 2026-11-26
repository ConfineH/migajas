import type { Attempt } from "@/lib/domain/attempts";
import {
  getResumableExamSession,
  type ExamSession,
} from "@/lib/domain/exam-session";
import {
  canAccessFlashcards,
  getLessonById,
  getLessonForPracticeStep,
  getNextGuidedItem,
  type GuidedProgress,
} from "@/lib/domain/guided-flow";
import type { UserProgress } from "@/lib/domain/progress";

export interface ExamScoreResult {
  correct: number;
  total: number;
  complete: boolean;
}

export function getAttemptsAfterSessionStart(
  attempts: Attempt[],
  session: ExamSession,
): Attempt[] {
  const startedAt = new Date(session.startedAt).getTime();
  return attempts.filter(
    (attempt) =>
      session.exerciseIds.includes(attempt.exerciseId) &&
      new Date(attempt.createdAt).getTime() >= startedAt,
  );
}

export function computeLatestAttemptPerExercise(
  attempts: Attempt[],
  exerciseIds: string[],
): Map<string, Attempt> {
  const latest = new Map<string, Attempt>();
  const sorted = [...attempts].sort(
    (a, b) =>
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  );

  for (const attempt of sorted) {
    if (exerciseIds.includes(attempt.exerciseId)) {
      latest.set(attempt.exerciseId, attempt);
    }
  }

  return latest;
}

export function computeExamScoreFromAttempts(
  session: ExamSession,
  attempts: Attempt[],
): ExamScoreResult {
  const relevant = getAttemptsAfterSessionStart(attempts, session);
  const latest = computeLatestAttemptPerExercise(
    relevant,
    session.exerciseIds,
  );
  const total = session.exerciseIds.length;
  const correct = [...latest.values()].filter((attempt) => attempt.isCorrect)
    .length;

  return {
    correct,
    total,
    complete: latest.size === total,
  };
}

export function validateLevelCompletion(
  progress: UserProgress,
  attempts: Attempt[],
  levelId: string,
  _levelExerciseIds: string[],
): { ok: true; correct: number; total: number } | { ok: false; error: string; status: number } {
  void _levelExerciseIds;
  const session = getResumableExamSession(progress.activeExamSessions, levelId);

  if (!session) {
    return {
      ok: false,
      error: "Solo un examen en curso puede certificar el nivel.",
      status: 403,
    };
  }

  const score = computeExamScoreFromAttempts(session, attempts);
  if (!score.complete) {
    return {
      ok: false,
      error: "Completa todas las preguntas del examen.",
      status: 403,
    };
  }
  return { ok: true, correct: score.correct, total: score.total };
}

type GuidedAction =
  | "complete-lesson"
  | "complete-practice"
  | "complete-flashcards";

export function validateGuidedAction(
  guided: GuidedProgress,
  action: GuidedAction,
  id: string,
): { ok: true } | { ok: false; error: string; status: number } {
  if (action === "complete-lesson") {
    const lesson = getLessonById(id);
    if (!lesson) {
      return { ok: false, error: "Lección no encontrada.", status: 404 };
    }

    const next = getNextGuidedItem(guided, lesson.levelId);
    if (!next || next.type !== "lesson" || next.id !== id) {
      return {
        ok: false,
        error: "Completa los pasos anteriores primero.",
        status: 403,
      };
    }

    return { ok: true };
  }

  if (action === "complete-practice") {
    const match = getLessonForPracticeStep(id);
    if (!match) {
      return { ok: false, error: "Práctica no encontrada.", status: 404 };
    }

    const next = getNextGuidedItem(guided, match.lesson.levelId);
    if (!next || next.type !== "practice" || next.id !== id) {
      return {
        ok: false,
        error: "Completa los pasos anteriores primero.",
        status: 403,
      };
    }

    return { ok: true };
  }

  if (!canAccessFlashcards(guided, id)) {
    return {
      ok: false,
      error: "Completa lecciones y prácticas primero.",
      status: 403,
    };
  }

  const next = getNextGuidedItem(guided, id);
  if (!next || next.type !== "flashcards") {
    return {
      ok: false,
      error: "Completa los pasos anteriores primero.",
      status: 403,
    };
  }

  return { ok: true };
}
