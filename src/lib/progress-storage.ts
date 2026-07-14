import { cookies } from "next/headers";
import type { UserProgress } from "@/lib/domain/progress";

export const PROGRESS_COOKIE = "migajas_progress";

export const EMPTY_PROGRESS: UserProgress = {
  completions: [],
  completedLessons: [],
  completedPracticeSteps: [],
  freeModeUnlocked: false,
  activeExamSessions: undefined,
};

export async function getStoredProgress(): Promise<UserProgress> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(PROGRESS_COOKIE)?.value;
  if (!raw) return { ...EMPTY_PROGRESS };
  try {
    const parsed = JSON.parse(raw) as Partial<UserProgress>;
    return {
      completions: parsed.completions ?? [],
      completedLessons: parsed.completedLessons ?? [],
      completedPracticeSteps: parsed.completedPracticeSteps ?? [],
      freeModeUnlocked: parsed.freeModeUnlocked ?? false,
      activeExamSessions: parsed.activeExamSessions,
    };
  } catch {
    return { ...EMPTY_PROGRESS };
  }
}

export function serializeProgress(progress: UserProgress): string {
  return JSON.stringify(progress);
}
