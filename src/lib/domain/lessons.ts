import { getContentCache } from "@/lib/content-cache";

export type LessonStepType = "explanation" | "example" | "practice";

export interface LessonStep {
  id: string;
  type: LessonStepType;
  title: string;
  body: string;
  foodId?: string;
  exerciseId?: string;
}

export interface Lesson {
  id: string;
  levelId: string;
  orderIndex: number;
  title: string;
  summary: string;
  steps: LessonStep[];
}

export interface LevelExam {
  levelId: string;
  title: string;
  description: string;
  poolExerciseIds: string[];
  questionsPerExam: number;
  /** @deprecated legacy fixed list */
  exerciseIds?: string[];
}

export function getAllLessons(): Lesson[] {
  return getContentCache().lessons;
}

export function getLessonsForLevel(levelId: string): Lesson[] {
  return getAllLessons()
    .filter((l) => l.levelId === levelId)
    .sort((a, b) => a.orderIndex - b.orderIndex);
}

export function getLessonById(id: string): Lesson | undefined {
  return getAllLessons().find((l) => l.id === id);
}

export function getExplanationSteps(lesson: Lesson): LessonStep[] {
  return lesson.steps.filter(
    (s) => s.type === "explanation" || s.type === "example",
  );
}

export function getPracticeStepIds(lesson: Lesson): string[] {
  return lesson.steps.filter((s) => s.type === "practice").map((s) => s.id);
}

export function getPracticeSteps(lesson: Lesson): LessonStep[] {
  return lesson.steps.filter((s) => s.type === "practice");
}

export function getAllExams(): LevelExam[] {
  return getContentCache().exams;
}

export function getExamForLevel(levelId: string): LevelExam | undefined {
  return getAllExams().find((e) => e.levelId === levelId);
}
