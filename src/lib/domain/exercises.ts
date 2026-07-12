import type { Difficulty } from "./foods";
import exercisesData from "@/lib/data/exercises.json";
import levelsData from "@/lib/data/levels.json";

export type ExerciseType =
  | "multiple_choice"
  | "count_rations"
  | "identify_portion";

export interface ExerciseOption {
  id: string;
  label: string;
  value: string;
  isCorrect: boolean;
}

export interface Exercise {
  id: string;
  levelId: string;
  type: ExerciseType;
  prompt: string;
  explanation: string;
  difficulty: Difficulty;
  foodId?: string;
  correctAnswer: string;
  options: ExerciseOption[];
}

export interface Level {
  id: string;
  orderIndex: number;
  name: string;
  description: string;
  country: string;
}

export function getLevels(): Level[] {
  return levelsData as Level[];
}

export function getLevelById(id: string): Level | undefined {
  return getLevels().find((level) => level.id === id);
}

export function getAllExercises(): Exercise[] {
  return exercisesData as Exercise[];
}

export function getExercisesForLevel(levelId: string): Exercise[] {
  return getAllExercises().filter((exercise) => exercise.levelId === levelId);
}

export function getExerciseById(id: string): Exercise | undefined {
  return getAllExercises().find((exercise) => exercise.id === id);
}

export function getExerciseTypesForLevel(levelId: string): ExerciseType[] {
  const types = new Set(
    getExercisesForLevel(levelId).map((exercise) => exercise.type),
  );
  return Array.from(types);
}

export function gradeAnswer(exercise: Exercise, selectedAnswer: string): boolean {
  return exercise.correctAnswer === selectedAnswer;
}

export const exerciseTypeLabels: Record<ExerciseType, string> = {
  multiple_choice: "Opción múltiple",
  count_rations: "Contar raciones",
  identify_portion: "Identificar alimento",
};
