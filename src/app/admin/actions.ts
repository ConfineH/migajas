"use server";

import { revalidatePath } from "next/cache";
import {
  updateExam,
  updateFood,
  updateLesson,
  updateLessonSteps,
} from "@/lib/supabase/content-admin";
import { parseExerciseIds } from "@/lib/domain/content-admin";
import type {
  ExamUpdateInput,
  FoodUpdateInput,
  LessonStepsUpdateInput,
  LessonUpdateInput,
} from "@/lib/domain/content-admin";

export async function saveFoodAction(input: FoodUpdateInput) {
  const error = await updateFood(input);
  if (error) return { ok: false as const, error };
  revalidatePath("/admin/foods");
  revalidatePath("/catalog");
  return { ok: true as const };
}

export async function saveLessonAction(input: LessonUpdateInput) {
  const error = await updateLesson(input);
  if (error) return { ok: false as const, error };
  revalidatePath("/admin/lessons");
  revalidatePath("/learn");
  return { ok: true as const };
}

export async function saveLessonStepsAction(input: LessonStepsUpdateInput) {
  const error = await updateLessonSteps(input);
  if (error) return { ok: false as const, error };
  revalidatePath("/admin/lessons");
  revalidatePath(`/admin/lessons/${input.id}`);
  revalidatePath("/learn");
  return { ok: true as const };
}

export async function saveExamAction(input: ExamUpdateInput) {
  const error = await updateExam(input);
  if (error) return { ok: false as const, error };
  revalidatePath("/admin/exams");
  revalidatePath("/learn");
  return { ok: true as const };
}

export async function saveExamFromFormAction(
  levelId: string,
  title: string,
  description: string,
  exerciseIdsRaw: string,
) {
  return saveExamAction({
    levelId,
    title,
    description,
    exerciseIds: parseExerciseIds(exerciseIdsRaw),
  });
}
