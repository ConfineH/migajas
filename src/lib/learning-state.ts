import { cookies } from "next/headers";
import type { NextResponse } from "next/server";
import type { Attempt } from "@/lib/domain/attempts";
import type { UserProgress } from "@/lib/domain/progress";
import { getAppCookieOptions } from "@/lib/cookie-options";
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

const LEARNING_STATE_COOKIE_OPTIONS = getAppCookieOptions();

export function applyLearningStateCookies(
  response: NextResponse,
  state: UserLearningState,
): void {
  response.cookies.set(
    PROGRESS_COOKIE,
    serializeProgress(state.progress),
    LEARNING_STATE_COOKIE_OPTIONS,
  );
  response.cookies.set(
    ATTEMPTS_COOKIE,
    serializeAttempts(state.attempts),
    LEARNING_STATE_COOKIE_OPTIONS,
  );
}

export async function applyLearningStateToStore(
  state: UserLearningState,
): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(
    PROGRESS_COOKIE,
    serializeProgress(state.progress),
    LEARNING_STATE_COOKIE_OPTIONS,
  );
  cookieStore.set(
    ATTEMPTS_COOKIE,
    serializeAttempts(state.attempts),
    LEARNING_STATE_COOKIE_OPTIONS,
  );
}

async function setProgressCookie(
  serialized: string,
  response?: NextResponse,
): Promise<void> {
  const cookieOptions = getAppCookieOptions();

  if (response) {
    response.cookies.set(PROGRESS_COOKIE, serialized, cookieOptions);
    return;
  }

  const cookieStore = await cookies();
  cookieStore.set(PROGRESS_COOKIE, serialized, cookieOptions);
}

async function setAttemptsCookie(
  serialized: string,
  response?: NextResponse,
): Promise<void> {
  const cookieOptions = getAppCookieOptions();

  if (response) {
    response.cookies.set(ATTEMPTS_COOKIE, serialized, cookieOptions);
    return;
  }

  const cookieStore = await cookies();
  cookieStore.set(ATTEMPTS_COOKIE, serialized, cookieOptions);
}

export { EMPTY_PROGRESS, getStoredProgress, serializeProgress, PROGRESS_COOKIE };
