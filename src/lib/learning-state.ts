import { cookies } from "next/headers";
import type { NextResponse } from "next/server";
import type { Attempt } from "@/lib/domain/attempts";
import type { UserProgress } from "@/lib/domain/progress";
import { mergeAttempts, mergeUserProgress } from "@/lib/domain/progress-sync";
import {
  ATTEMPTS_COOKIE,
  getStoredAttempts,
  serializeAttempts,
} from "@/lib/attempts-storage";
import { getAuthUser } from "@/lib/supabase/auth";
import {
  getUserLearningState,
  upsertUserLearningState,
  type UserLearningState,
} from "@/lib/supabase/learning-state";
import {
  PROGRESS_COOKIE,
  EMPTY_PROGRESS,
  getStoredProgress,
  serializeProgress,
} from "@/lib/progress-storage";

export async function resolveProgress(): Promise<UserProgress> {
  const user = await getAuthUser();
  if (!user) {
    return getStoredProgress();
  }

  const remote = await getUserLearningState(user.id);
  if (remote?.progress) {
    return remote.progress;
  }

  return getStoredProgress();
}

export async function resolveAttempts(): Promise<Attempt[]> {
  const user = await getAuthUser();
  if (!user) {
    return getStoredAttempts();
  }

  const remote = await getUserLearningState(user.id);
  if (remote?.attempts?.length) {
    return remote.attempts;
  }

  return getStoredAttempts();
}

export async function persistProgress(
  progress: UserProgress,
  response?: NextResponse,
): Promise<void> {
  const serialized = serializeProgress(progress);
  await setProgressCookie(serialized, response);

  const user = await getAuthUser();
  if (!user) return;

  const attempts = await resolveAttempts();
  await upsertUserLearningState(user.id, { progress, attempts });
}

export async function persistAttempts(
  attempts: Attempt[],
  response?: NextResponse,
): Promise<void> {
  const serialized = serializeAttempts(attempts);
  await setAttemptsCookie(serialized, response);

  const user = await getAuthUser();
  if (!user) return;

  const progress = await resolveProgress();
  await upsertUserLearningState(user.id, { progress, attempts });
}

export async function syncGuestLearningState(
  userId: string,
): Promise<UserLearningState> {
  const localProgress = await getStoredProgress();
  const localAttempts = await getStoredAttempts();
  const remote = await getUserLearningState(userId);

  const merged: UserLearningState = {
    progress: mergeUserProgress(
      localProgress,
      remote?.progress ?? { ...EMPTY_PROGRESS },
    ),
    attempts: mergeAttempts(localAttempts, remote?.attempts ?? []),
  };

  await upsertUserLearningState(userId, merged);
  return merged;
}

export function applyLearningStateCookies(
  response: NextResponse,
  state: UserLearningState,
): void {
  const cookieOptions = {
    httpOnly: true,
    sameSite: "lax" as const,
    maxAge: 60 * 60 * 24 * 365,
    path: "/",
  };

  response.cookies.set(
    PROGRESS_COOKIE,
    serializeProgress(state.progress),
    cookieOptions,
  );
  response.cookies.set(
    ATTEMPTS_COOKIE,
    serializeAttempts(state.attempts),
    cookieOptions,
  );
}

async function setProgressCookie(
  serialized: string,
  response?: NextResponse,
): Promise<void> {
  const cookieOptions = {
    httpOnly: true,
    sameSite: "lax" as const,
    maxAge: 60 * 60 * 24 * 365,
    path: "/",
  };

  const cookieStore = await cookies();
  cookieStore.set(PROGRESS_COOKIE, serialized, cookieOptions);
  response?.cookies.set(PROGRESS_COOKIE, serialized, cookieOptions);
}

async function setAttemptsCookie(
  serialized: string,
  response?: NextResponse,
): Promise<void> {
  const cookieOptions = {
    httpOnly: true,
    sameSite: "lax" as const,
    maxAge: 60 * 60 * 24 * 365,
    path: "/",
  };

  const cookieStore = await cookies();
  cookieStore.set(ATTEMPTS_COOKIE, serialized, cookieOptions);
  response?.cookies.set(ATTEMPTS_COOKIE, serialized, cookieOptions);
}

export { EMPTY_PROGRESS, getStoredProgress, serializeProgress, PROGRESS_COOKIE };
