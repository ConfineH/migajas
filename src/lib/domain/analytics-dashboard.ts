import type { LearningEventType } from "@/lib/domain/analytics";

export interface StoredLearningEvent {
  eventType: LearningEventType;
  payload: Record<string, unknown>;
  createdAt: string;
}

export interface LevelFunnelStat {
  levelId: string;
  lessonsCompleted: number;
  totalLessons: number;
  examPassed: boolean;
  bestMasteryScore: number | null;
  progressPercent: number;
}

export interface TimelineEntry {
  eventType: LearningEventType;
  label: string;
  createdAt: string;
}

export interface AnalyticsDashboard {
  totalEvents: number;
  lessonsCompleted: number;
  examsPassed: number;
  freeModeUnlocked: boolean;
  levelFunnel: LevelFunnelStat[];
  timeline: TimelineEntry[];
}

export interface LevelMeta {
  id: string;
  lessonCount: number;
}

function asString(value: unknown): string | null {
  return typeof value === "string" ? value : null;
}

function asNumber(value: unknown): number | null {
  return typeof value === "number" ? value : null;
}

export function formatEventLabel(event: StoredLearningEvent): string {
  switch (event.eventType) {
    case "lesson_completed":
      return `Lección completada (${asString(event.payload.levelId) ?? "?"})`;
    case "exam_passed": {
      const score = asNumber(event.payload.masteryScore);
      const level = asString(event.payload.levelId) ?? "?";
      return score !== null
        ? `Examen aprobado — ${level} (${score}%)`
        : `Examen aprobado — ${level}`;
    }
    case "free_mode_unlocked":
      return "Modo libre desbloqueado";
    default:
      return "Evento de aprendizaje";
  }
}

export function aggregateAnalyticsDashboard(
  events: StoredLearningEvent[],
  levels: LevelMeta[],
): AnalyticsDashboard {
  const lessonIds = new Set<string>();
  const lessonsByLevel = new Map<string, Set<string>>();
  const examScoresByLevel = new Map<string, number>();
  let freeModeUnlocked = false;

  for (const event of events) {
    if (event.eventType === "lesson_completed") {
      const lessonId = asString(event.payload.lessonId);
      const levelId = asString(event.payload.levelId);
      if (lessonId) lessonIds.add(lessonId);
      if (levelId && lessonId) {
        const set = lessonsByLevel.get(levelId) ?? new Set<string>();
        set.add(lessonId);
        lessonsByLevel.set(levelId, set);
      }
    }

    if (event.eventType === "exam_passed") {
      const levelId = asString(event.payload.levelId);
      const score = asNumber(event.payload.masteryScore);
      if (levelId && score !== null) {
        const prev = examScoresByLevel.get(levelId);
        if (prev === undefined || score > prev) {
          examScoresByLevel.set(levelId, score);
        }
      }
    }

    if (event.eventType === "free_mode_unlocked") {
      freeModeUnlocked = true;
    }
  }

  const levelFunnel: LevelFunnelStat[] = levels.map((level) => {
    const completed = lessonsByLevel.get(level.id)?.size ?? 0;
    const bestScore = examScoresByLevel.get(level.id) ?? null;
    const examPassed = bestScore !== null;
    const lessonProgress =
      level.lessonCount > 0
        ? Math.round((completed / level.lessonCount) * 100)
        : 0;
    const progressPercent = examPassed ? 100 : lessonProgress;

    return {
      levelId: level.id,
      lessonsCompleted: completed,
      totalLessons: level.lessonCount,
      examPassed,
      bestMasteryScore: bestScore,
      progressPercent,
    };
  });

  const timeline = [...events]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
    .slice(0, 20)
    .map((event) => ({
      eventType: event.eventType,
      label: formatEventLabel(event),
      createdAt: event.createdAt,
    }));

  return {
    totalEvents: events.length,
    lessonsCompleted: lessonIds.size,
    examsPassed: examScoresByLevel.size,
    freeModeUnlocked,
    levelFunnel,
    timeline,
  };
}

export function enrichDashboardWithProgress(
  dashboard: AnalyticsDashboard,
  progress: {
    completedLessons: string[];
    freeModeUnlocked: boolean;
    completions: {
      levelId: string;
      masteryScore: number;
      passed: boolean;
    }[];
  },
  lessonIdsByLevel: Record<string, string[]>,
): AnalyticsDashboard {
  const mergedFunnel = dashboard.levelFunnel.map((level) => {
    const lessonIds = lessonIdsByLevel[level.levelId] ?? [];
    const fromProgress = progress.completedLessons.filter((id) =>
      lessonIds.includes(id),
    ).length;
    const lessonsCompleted = Math.max(level.lessonsCompleted, fromProgress);

    const completion = progress.completions.find(
      (c) => c.levelId === level.levelId && c.passed,
    );
    const bestMasteryScore =
      completion?.masteryScore ?? level.bestMasteryScore ?? null;
    const examPassed = level.examPassed || completion?.passed === true;

    const lessonProgress =
      level.totalLessons > 0
        ? Math.round((lessonsCompleted / level.totalLessons) * 100)
        : 0;
    const progressPercent = examPassed ? 100 : lessonProgress;

    return {
      ...level,
      lessonsCompleted,
      examPassed,
      bestMasteryScore,
      progressPercent,
    };
  });

  const lessonsFromProgress = new Set(progress.completedLessons).size;
  const examsFromProgress = progress.completions.filter((c) => c.passed).length;

  return {
    ...dashboard,
    lessonsCompleted: Math.max(dashboard.lessonsCompleted, lessonsFromProgress),
    examsPassed: Math.max(dashboard.examsPassed, examsFromProgress),
    freeModeUnlocked:
      dashboard.freeModeUnlocked || progress.freeModeUnlocked,
    levelFunnel: mergedFunnel,
  };
}
