import { cookies } from "next/headers";
import type { UserProgress } from "@/lib/domain/progress";

export const PROGRESS_COOKIE = "migajas_progress";

const EMPTY: UserProgress = { completions: [] };

export async function getStoredProgress(): Promise<UserProgress> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(PROGRESS_COOKIE)?.value;
  if (!raw) return EMPTY;
  try {
    const parsed = JSON.parse(raw) as UserProgress;
    return parsed?.completions ? parsed : EMPTY;
  } catch {
    return EMPTY;
  }
}

export function serializeProgress(progress: UserProgress): string {
  return JSON.stringify(progress);
}
