export type LearningEventType =
  | "lesson_completed"
  | "exam_passed"
  | "free_mode_unlocked";

interface BaseLearningEvent {
  type: LearningEventType;
  timestamp: string;
}

export interface LessonCompletedEvent extends BaseLearningEvent {
  type: "lesson_completed";
  lessonId: string;
  levelId: string;
}

export interface ExamPassedEvent extends BaseLearningEvent {
  type: "exam_passed";
  levelId: string;
  masteryScore: number;
}

export interface FreeModeUnlockedEvent extends BaseLearningEvent {
  type: "free_mode_unlocked";
  levelId: "nivel-1";
}

export type LearningEvent =
  | LessonCompletedEvent
  | ExamPassedEvent
  | FreeModeUnlockedEvent;

function timestamp(): string {
  return new Date().toISOString();
}

export function buildLessonCompletedEvent(
  lessonId: string,
  levelId: string,
): LessonCompletedEvent {
  return {
    type: "lesson_completed",
    lessonId,
    levelId,
    timestamp: timestamp(),
  };
}

export function buildExamPassedEvent(
  levelId: string,
  masteryScore: number,
): ExamPassedEvent {
  return {
    type: "exam_passed",
    levelId,
    masteryScore,
    timestamp: timestamp(),
  };
}

export function buildFreeModeUnlockedEvent(): FreeModeUnlockedEvent {
  return {
    type: "free_mode_unlocked",
    levelId: "nivel-1",
    timestamp: timestamp(),
  };
}

export function shouldEmitExamPassed(passed: boolean): boolean {
  return passed;
}

export function shouldEmitFreeModeUnlocked(
  levelId: string,
  passed: boolean,
  wasFreeModeUnlocked: boolean,
): boolean {
  return levelId === "nivel-1" && passed && !wasFreeModeUnlocked;
}
