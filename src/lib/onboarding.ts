import { cookies } from "next/headers";

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
