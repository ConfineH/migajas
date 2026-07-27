"use server";

import { revalidatePath } from "next/cache";
import {
  createFood,
  deleteFood,
  updateExam,
  updateFood,
  updateLesson,
  updateLessonSteps,
} from "@/lib/supabase/content-admin";
import {
  createLicensee,
  deleteLicensee,
  updateLicensee,
} from "@/lib/supabase/licensees-admin";
import { parseExerciseIds } from "@/lib/domain/content-admin";
import type {
  ExamUpdateInput,
  FoodCreateInput,
  FoodUpdateInput,
  LessonStepsUpdateInput,
  LessonUpdateInput,
} from "@/lib/domain/content-admin";
import type { LicenseeInput } from "@/lib/domain/licensees";

export async function saveFoodAction(input: FoodUpdateInput) {
  const error = await updateFood(input);
  if (error) return { ok: false as const, error };
  revalidatePath("/admin/foods");
  revalidatePath("/catalog");
  return { ok: true as const };
}

export async function createFoodAction(input: FoodCreateInput) {
  const error = await createFood(input);
  if (error) return { ok: false as const, error };
  revalidatePath("/admin/foods");
  revalidatePath("/catalog");
  return { ok: true as const };
}

export async function deleteFoodAction(id: string) {
  const error = await deleteFood(id);
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
  poolRaw: string,
  questionsPerExam: number,
) {
  return saveExamAction({
    levelId,
    title,
    description,
    poolExerciseIds: parseExerciseIds(poolRaw),
    questionsPerExam,
  });
}

export async function saveLicenseeAction(id: string | null, input: LicenseeInput) {
  const error = id ? await updateLicensee(id, input) : await createLicensee(input);
  if (error) return { ok: false as const, error };
  revalidatePath("/admin/licensees");
  return { ok: true as const };
}

export async function deleteLicenseeAction(id: string) {
  const error = await deleteLicensee(id);
  if (error) return { ok: false as const, error };
  revalidatePath("/admin/licensees");
  return { ok: true as const };
}
