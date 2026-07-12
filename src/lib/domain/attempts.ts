export interface Attempt {
  exerciseId: string;
  selectedAnswer: string;
  isCorrect: boolean;
  timeSpentMs: number;
  createdAt: string;
}

export function recordAttempt(
  existing: Attempt[],
  attempt: Omit<Attempt, "createdAt">,
): Attempt[] {
  return [
    ...existing,
    { ...attempt, createdAt: new Date().toISOString() },
  ];
}

export function getAttempts(attempts: Attempt[]): Attempt[] {
  return [...attempts].sort(
    (a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

export function getAttemptsForExercise(
  attempts: Attempt[],
  exerciseId: string,
): Attempt[] {
  return attempts.filter((attempt) => attempt.exerciseId === exerciseId);
}

export function countCorrect(attempts: Attempt[]): number {
  return attempts.filter((a) => a.isCorrect).length;
}

export function accuracyRate(attempts: Attempt[]): number {
  if (attempts.length === 0) return 0;
  return Math.round((countCorrect(attempts) / attempts.length) * 100);
}
