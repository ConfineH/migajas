import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export const ONBOARDING_COOKIE = "migajas_onboarding";

export interface OnboardingState {
  country: string;
  guestMode: boolean;
  completed: boolean;
}

export async function getOnboardingState(): Promise<OnboardingState | null> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(ONBOARDING_COOKIE)?.value;
  if (!raw) return null;
  try {
    return JSON.parse(raw) as OnboardingState;
  } catch {
    return null;
  }
}

export function serializeOnboardingState(state: OnboardingState): string {
  return JSON.stringify(state);
}

export async function hasCompletedOnboarding(): Promise<boolean> {
  const state = await getOnboardingState();
  return state?.completed === true;
}

export async function requireOnboarding(redirectTo = "/onboarding") {
  if (!(await hasCompletedOnboarding())) {
    redirect(redirectTo);
  }
}
