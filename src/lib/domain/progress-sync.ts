import type { Attempt } from "./attempts";
import type { LevelCompletion, UserProgress } from "./progress";

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
