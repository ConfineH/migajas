/** Minimum mastery % to pass a level and unlock the next */
export const PASS_THRESHOLD = 60;

export interface LevelCompletion {
  levelId: string;
  masteryScore: number;
  correctCount: number;
  totalCount: number;
  completedAt: string;
  passed: boolean;
}

export interface UserProgress {
  completions: LevelCompletion[];
  completedLessons: string[];
  completedPracticeSteps: string[];
  freeModeUnlocked: boolean;
}

export interface LevelRef {
  id: string;
  orderIndex: number;
}

export function calculateMasteryScore(correct: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((correct / total) * 100);
}

export function hasPassed(masteryScore: number): boolean {
  return masteryScore >= PASS_THRESHOLD;
}

export function isLevelUnlocked(
  levelOrderIndex: number,
  completions: LevelCompletion[],
  allLevels: LevelRef[],
): boolean {
  if (levelOrderIndex <= 1) return true;

  const prevLevel = allLevels.find((l) => l.orderIndex === levelOrderIndex - 1);
  if (!prevLevel) return false;

  const prevCompletion = completions.find((c) => c.levelId === prevLevel.id);
  return prevCompletion?.passed === true;
}

export function completeLevel(
  progress: UserProgress,
  levelId: string,
  correct: number,
  total: number,
): UserProgress {
  const masteryScore = calculateMasteryScore(correct, total);
  const passed = hasPassed(masteryScore);
  const filtered = progress.completions.filter((c) => c.levelId !== levelId);

  const unlockFree =
    levelId === "nivel-1" && passed ? true : progress.freeModeUnlocked;

  return {
    ...progress,
    freeModeUnlocked: unlockFree,
    completions: [
      ...filtered,
      {
        levelId,
        masteryScore,
        correctCount: correct,
        totalCount: total,
        completedAt: new Date().toISOString(),
        passed,
      },
    ],
  };
}

export function getLevelCompletion(
  progress: UserProgress,
  levelId: string,
): LevelCompletion | undefined {
  return progress.completions.find((c) => c.levelId === levelId);
}

export function getFailedExerciseIds(
  attempts: { exerciseId: string; isCorrect: boolean; createdAt: string }[],
  exerciseIds: string[],
): string[] {
  const latest = new Map<string, { isCorrect: boolean; createdAt: string }>();

  for (const attempt of attempts) {
    if (!exerciseIds.includes(attempt.exerciseId)) continue;
    const existing = latest.get(attempt.exerciseId);
    if (
      !existing ||
      new Date(attempt.createdAt) > new Date(existing.createdAt)
    ) {
      latest.set(attempt.exerciseId, attempt);
    }
  }

  return [...latest.entries()]
    .filter(([, a]) => !a.isCorrect)
    .map(([id]) => id);
}

export function countPassedLevels(progress: UserProgress): number {
  return progress.completions.filter((c) => c.passed).length;
}
