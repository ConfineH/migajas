import type { Attempt } from "./attempts";
import type { LevelCompletion, UserProgress } from "./progress";
import type { ExamSession } from "./exam-session";

export const MAX_SYNCED_ATTEMPTS = 200;

export function pickBestCompletion(
  a: LevelCompletion,
  b: LevelCompletion,
): LevelCompletion {
  if (a.masteryScore !== b.masteryScore) {
    return a.masteryScore > b.masteryScore ? a : b;
  }
  if (a.passed !== b.passed) {
    return a.passed ? a : b;
  }
  return new Date(a.completedAt) >= new Date(b.completedAt) ? a : b;
}

function unionIds(a: string[], b: string[]): string[] {
  return [...new Set([...a, ...b])];
}

function mergeCompletions(
  local: LevelCompletion[],
  remote: LevelCompletion[],
): LevelCompletion[] {
  const byLevel = new Map<string, LevelCompletion>();
  for (const completion of [...local, ...remote]) {
    const existing = byLevel.get(completion.levelId);
    byLevel.set(
      completion.levelId,
      existing ? pickBestCompletion(existing, completion) : completion,
    );
  }
  return [...byLevel.values()];
}

function mergeExamSessions(
  local: ExamSession[] | undefined,
  remote: ExamSession[] | undefined,
): ExamSession[] | undefined {
  const byLevel = new Map<string, ExamSession>();
  for (const session of [...(remote ?? []), ...(local ?? [])]) {
    const existing = byLevel.get(session.levelId);
    if (!existing || (session.inProgress && !existing.inProgress)) {
      byLevel.set(session.levelId, session);
    }
  }
  const merged = [...byLevel.values()];
  return merged.length > 0 ? merged : undefined;
}

export function mergeUserProgress(
  local: UserProgress,
  remote: UserProgress,
): UserProgress {
  return {
    completions: mergeCompletions(local.completions, remote.completions),
    completedLessons: unionIds(
      local.completedLessons,
      remote.completedLessons,
    ),
    completedPracticeSteps: unionIds(
      local.completedPracticeSteps,
      remote.completedPracticeSteps,
    ),
    freeModeUnlocked: local.freeModeUnlocked || remote.freeModeUnlocked,
    activeExamSessions: mergeExamSessions(
      local.activeExamSessions,
      remote.activeExamSessions,
    ),
  };
}

export function mergeAttempts(
  local: Attempt[],
  remote: Attempt[],
): Attempt[] {
  return [...local, ...remote]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
    .slice(0, MAX_SYNCED_ATTEMPTS);
}
