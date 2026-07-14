export interface ExamSession {
  levelId: string;
  exerciseIds: string[];
  startedAt: string;
  inProgress: boolean;
}

export function shuffleExerciseIds(
  poolExerciseIds: string[],
  questionsPerExam: number,
  random: () => number = Math.random,
): string[] {
  const pool = [...new Set(poolExerciseIds)];
  if (pool.length < questionsPerExam) {
    throw new Error("POOL_TOO_SMALL");
  }

  for (let i = pool.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }

  return pool.slice(0, questionsPerExam);
}

export function buildExamSession(
  levelId: string,
  poolExerciseIds: string[],
  questionsPerExam: number,
  random: () => number = Math.random,
  now: () => string = () => new Date().toISOString(),
): ExamSession {
  return {
    levelId,
    exerciseIds: shuffleExerciseIds(poolExerciseIds, questionsPerExam, random),
    startedAt: now(),
    inProgress: true,
  };
}

export function getResumableExamSession(
  sessions: ExamSession[] | undefined,
  levelId: string,
): ExamSession | null {
  return (
    sessions?.find(
      (session) => session.levelId === levelId && session.inProgress,
    ) ?? null
  );
}

export function upsertExamSession(
  sessions: ExamSession[] | undefined,
  session: ExamSession,
): ExamSession[] {
  const rest = (sessions ?? []).filter((item) => item.levelId !== session.levelId);
  return [...rest, session];
}

export function clearExamSession(
  sessions: ExamSession[] | undefined,
  levelId: string,
): ExamSession[] {
  return (sessions ?? []).filter((session) => session.levelId !== levelId);
}

export function defaultQuestionsPerExam(levelId: string): number {
  return levelId === "nivel-5" ? 5 : 4;
}

export function normalizeExamConfig(exam: {
  levelId: string;
  poolExerciseIds?: string[];
  exerciseIds?: string[];
  questionsPerExam?: number;
}): { poolExerciseIds: string[]; questionsPerExam: number } {
  const pool =
    exam.poolExerciseIds?.length
      ? exam.poolExerciseIds
      : (exam.exerciseIds ?? []);
  const questionsPerExam =
    exam.questionsPerExam ?? defaultQuestionsPerExam(exam.levelId);

  return { poolExerciseIds: pool, questionsPerExam };
}
