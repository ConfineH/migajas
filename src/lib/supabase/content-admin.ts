import { getAuthUser } from "@/lib/supabase/auth";
import { isContentAdmin } from "@/lib/domain/admin";
import {
  examUpdateToRow,
  foodUpdateToRow,
  lessonStepsUpdateToRow,
  lessonUpdateToRow,
  validateExamUpdate,
  validateFoodUpdate,
  validateLessonStepsUpdate,
  validateLessonUpdate,
  type ExamUpdateInput,
  type FoodUpdateInput,
  type LessonStepsUpdateInput,
  type LessonUpdateInput,
} from "@/lib/domain/content-admin";
import { createServiceClient, isServiceRoleConfigured } from "@/lib/supabase/service";
import { refreshContentFromSupabase } from "@/lib/content-server";

export async function requireContentAdmin() {
  const user = await getAuthUser();
  if (!user || !isContentAdmin(user.email)) {
    throw new Error("FORBIDDEN");
  }
  if (!isServiceRoleConfigured()) {
    throw new Error("SERVICE_ROLE_MISSING");
  }
  return user;
}

export async function updateFood(input: FoodUpdateInput): Promise<string | null> {
  await requireContentAdmin();
  const error = validateFoodUpdate(input);
  if (error) return error;

  const supabase = createServiceClient();
  const { error: dbError } = await supabase
    .from("foods")
    .update(foodUpdateToRow(input))
    .eq("id", input.id);

  if (dbError) return dbError.message;
  await refreshContentFromSupabase();
  return null;
}

export async function updateLesson(
  input: LessonUpdateInput,
): Promise<string | null> {
  await requireContentAdmin();
  const error = validateLessonUpdate(input);
  if (error) return error;

  const supabase = createServiceClient();
  const { error: dbError } = await supabase
    .from("lessons")
    .update(lessonUpdateToRow(input))
    .eq("id", input.id);

  if (dbError) return dbError.message;
  await refreshContentFromSupabase();
  return null;
}

export async function updateLessonSteps(
  input: LessonStepsUpdateInput,
): Promise<string | null> {
  await requireContentAdmin();
  const error = validateLessonStepsUpdate(input);
  if (error) return error;

  const supabase = createServiceClient();
  const { error: dbError } = await supabase
    .from("lessons")
    .update(lessonStepsUpdateToRow(input))
    .eq("id", input.id);

  if (dbError) return dbError.message;
  await refreshContentFromSupabase();
  return null;
}

export async function updateExam(input: ExamUpdateInput): Promise<string | null> {
  await requireContentAdmin();
  const error = validateExamUpdate(input);
  if (error) return error;

  const supabase = createServiceClient();
  const { error: dbError } = await supabase
    .from("level_exams")
    .update(examUpdateToRow(input))
    .eq("level_id", input.levelId);

  if (dbError) return dbError.message;
  await refreshContentFromSupabase();
  return null;
}
