import type { UserProgress } from "@/lib/domain/progress";
import type { LearningEvent } from "@/lib/domain/analytics";
import {
  buildExamPassedEvent,
  buildFreeModeUnlockedEvent,
  buildLessonCompletedEvent,
} from "@/lib/domain/analytics";

export interface LessonRef {
  id: string;
  levelId: string;
}

export interface ExistingAnalyticsKeys {
  lessonIds: Set<string>;
  passedExamLevelIds: Set<string>;
  hasFreeMode: boolean;
}

export function extractExistingAnalyticsKeys(
  events: { event_type: string; payload: Record<string, unknown> }[],
): ExistingAnalyticsKeys {
  const lessonIds = new Set<string>();
  const passedExamLevelIds = new Set<string>();
  let hasFreeMode = false;

  for (const event of events) {
    if (event.event_type === "lesson_completed") {
      const lessonId = event.payload.lessonId;
      if (typeof lessonId === "string") lessonIds.add(lessonId);
    }
    if (event.event_type === "exam_passed") {
      const levelId = event.payload.levelId;
      if (typeof levelId === "string") passedExamLevelIds.add(levelId);
    }
    if (event.event_type === "free_mode_unlocked") {
      hasFreeMode = true;
    }
  }

  return { lessonIds, passedExamLevelIds, hasFreeMode };
}

export function buildBackfillEvents(
  progress: UserProgress,
  lessons: LessonRef[],
  existing: ExistingAnalyticsKeys,
): LearningEvent[] {
  const events: LearningEvent[] = [];
  const lessonLevel = new Map(lessons.map((l) => [l.id, l.levelId]));

  for (const lessonId of progress.completedLessons) {
    if (existing.lessonIds.has(lessonId)) continue;
    const levelId = lessonLevel.get(lessonId);
    if (!levelId) continue;
    events.push(buildLessonCompletedEvent(lessonId, levelId));
  }

  for (const completion of progress.completions) {
    if (!completion.passed) continue;
    if (existing.passedExamLevelIds.has(completion.levelId)) continue;
    events.push(
      buildExamPassedEvent(completion.levelId, completion.masteryScore),
    );
  }

  if (progress.freeModeUnlocked && !existing.hasFreeMode) {
    events.push(buildFreeModeUnlockedEvent());
  }

  return events;
}
