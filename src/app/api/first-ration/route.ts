import { NextResponse } from "next/server";
import { getAppCookieOptions } from "@/lib/cookie-options";
import {
  ONBOARDING_COOKIE,
  getOnboardingState,
  serializeOnboardingState,
} from "@/lib/onboarding";

export async function POST() {
  const state = await getOnboardingState();
  if (!state?.completed) {
    return NextResponse.json({ error: "Completa el inicio primero." }, { status: 400 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(
    ONBOARDING_COOKIE,
    serializeOnboardingState({ ...state, firstRationDone: true }),
    { ...getAppCookieOptions() },
  );
  return response;
}
