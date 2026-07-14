import type { Attempt } from "@/lib/domain/attempts";
import type { UserProgress } from "@/lib/domain/progress";
import { EMPTY_PROGRESS } from "@/lib/progress-storage";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/client";

export interface UserLearningState {
  progress: UserProgress;
  attempts: Attempt[];
}

export function parseUserProgress(raw: unknown): UserProgress {
  if (!raw || typeof raw !== "object") return { ...EMPTY_PROGRESS };
  const p = raw as Partial<UserProgress>;
  return {
    completions: p.completions ?? [],
    completedLessons: p.completedLessons ?? [],
    completedPracticeSteps: p.completedPracticeSteps ?? [],
    freeModeUnlocked: p.freeModeUnlocked ?? false,
    activeExamSessions: Array.isArray(p.activeExamSessions)
      ? p.activeExamSessions
      : undefined,
    completedFlashcardLevels: Array.isArray(p.completedFlashcardLevels)
      ? p.completedFlashcardLevels
      : undefined,
  };
}

function parseProgress(raw: unknown): UserProgress {
  return parseUserProgress(raw);
}

function parseAttempts(raw: unknown): Attempt[] {
  if (!Array.isArray(raw)) return [];
  return raw as Attempt[];
}

export async function getUserLearningState(
  userId: string,
): Promise<UserLearningState | null> {
  if (!isSupabaseConfigured()) return null;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("user_learning_state")
    .select("progress, attempts")
    .eq("user_id", userId)
    .maybeSingle();

  if (error || !data) return null;

  return {
    progress: parseProgress(data.progress),
    attempts: parseAttempts(data.attempts),
  };
}

export async function upsertUserLearningState(
  userId: string,
  state: UserLearningState,
): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;

  const supabase = await createClient();
  const { error } = await supabase.from("user_learning_state").upsert(
    {
      user_id: userId,
      progress: state.progress,
      attempts: state.attempts,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" },
  );

  return !error;
}
