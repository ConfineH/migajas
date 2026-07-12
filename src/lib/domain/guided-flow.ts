import type { LevelCompletion } from "./progress";
import {
  getLessonsForLevel,
  getLessonById,
  getPracticeStepIds,
  getExamForLevel,
} from "./lessons";

export type GuidedItemType = "lesson" | "practice" | "exam";

export interface GuidedItem {
  type: GuidedItemType;
  id: string;
  lessonId?: string;
  exerciseId?: string;
  title: string;
}

export interface GuidedProgress {
  completedLessons: string[];
  completedPracticeSteps: string[];
  levelCompletions: LevelCompletion[];
  freeModeUnlocked: boolean;
}

export function buildGuidedSequence(levelId: string): GuidedItem[] {
  const items: GuidedItem[] = [];
  const lessons = getLessonsForLevel(levelId);

  for (const lesson of lessons) {
    items.push({
      type: "lesson",
      id: lesson.id,
      lessonId: lesson.id,
      title: lesson.title,
    });

    for (const step of lesson.steps.filter((s) => s.type === "practice")) {
      items.push({
        type: "practice",
        id: step.id,
        lessonId: lesson.id,
        exerciseId: step.exerciseId,
        title: `Práctica: ${lesson.title}`,
      });
    }
  }

  const exam = getExamForLevel(levelId);
  if (exam) {
    items.push({
      type: "exam",
      id: `exam-${levelId}`,
      title: exam.title,
    });
  }

  return items;
}

export function isGuidedItemComplete(
  progress: GuidedProgress,
  item: GuidedItem,
  levelId: string,
): boolean {
  if (item.type === "lesson") {
    return progress.completedLessons.includes(item.id);
  }
  if (item.type === "practice") {
    return progress.completedPracticeSteps.includes(item.id);
  }
  const completion = progress.levelCompletions.find(
    (c) => c.levelId === levelId,
  );
  return completion?.passed === true;
}

export function getNextGuidedItem(
  progress: GuidedProgress,
  levelId: string,
): GuidedItem | null {
  const sequence = buildGuidedSequence(levelId);
  return (
    sequence.find((item) => !isGuidedItemComplete(progress, item, levelId)) ??
    null
  );
}

export function completeLesson(
  progress: GuidedProgress,
  lessonId: string,
): GuidedProgress {
  if (progress.completedLessons.includes(lessonId)) return progress;
  return {
    ...progress,
    completedLessons: [...progress.completedLessons, lessonId],
  };
}

export function completePracticeStep(
  progress: GuidedProgress,
  stepId: string,
): GuidedProgress {
  if (progress.completedPracticeSteps.includes(stepId)) return progress;
  return {
    ...progress,
    completedPracticeSteps: [...progress.completedPracticeSteps, stepId],
  };
}

export function canStartExam(
  progress: GuidedProgress,
  levelId: string,
): boolean {
  const lessons = getLessonsForLevel(levelId);
  const allLessonsDone = lessons.every((l) =>
    progress.completedLessons.includes(l.id),
  );
  const allPracticeDone = lessons.every((l) =>
    getPracticeStepIds(l).every((id) =>
      progress.completedPracticeSteps.includes(id),
    ),
  );
  return allLessonsDone && allPracticeDone;
}

export function isFreeModeUnlocked(progress: GuidedProgress): boolean {
  if (progress.freeModeUnlocked) return true;
  const n1 = progress.levelCompletions.find(
    (c) => c.levelId === "nivel-1" && c.passed,
  );
  return !!n1;
}

export function unlockFreeMode(progress: GuidedProgress): GuidedProgress {
  return { ...progress, freeModeUnlocked: true };
}

export function countCompletedLessons(progress: GuidedProgress): number {
  return progress.completedLessons.length;
}

export function getLessonProgressPercent(
  progress: GuidedProgress,
  levelId: string,
): number {
  const sequence = buildGuidedSequence(levelId);
  if (sequence.length === 0) return 0;
  const done = sequence.filter((item) =>
    isGuidedItemComplete(progress, item, levelId),
  ).length;
  return Math.round((done / sequence.length) * 100);
}

export function toGuidedProgress(userProgress: {
  completions: LevelCompletion[];
  completedLessons?: string[];
  completedPracticeSteps?: string[];
  freeModeUnlocked?: boolean;
}): GuidedProgress {
  return {
    completedLessons: userProgress.completedLessons ?? [],
    completedPracticeSteps: userProgress.completedPracticeSteps ?? [],
    levelCompletions: userProgress.completions,
    freeModeUnlocked: userProgress.freeModeUnlocked ?? false,
  };
}

export function mergeGuidedIntoUserProgress(
  userProgress: {
    completions: LevelCompletion[];
    completedLessons?: string[];
    completedPracticeSteps?: string[];
    freeModeUnlocked?: boolean;
  },
  guided: GuidedProgress,
): {
  completions: LevelCompletion[];
  completedLessons: string[];
  completedPracticeSteps: string[];
  freeModeUnlocked: boolean;
} {
  return {
    completions: guided.levelCompletions,
    completedLessons: guided.completedLessons,
    completedPracticeSteps: guided.completedPracticeSteps,
    freeModeUnlocked: guided.freeModeUnlocked,
  };
}

export function getLessonForPracticeStep(stepId: string) {
  const lessons = getLessonsForLevel("nivel-1");
  for (const lesson of lessons) {
    const step = lesson.steps.find((s) => s.id === stepId);
    if (step) return { lesson, step };
  }
  return undefined;
}

export { getLessonById };
