import { NextResponse } from "next/server";
import {
  ONBOARDING_COOKIE,
  serializeOnboardingState,
  type OnboardingState,
} from "@/lib/onboarding";
import { getAppCookieOptions } from "@/lib/cookie-options";

export async function POST(request: Request) {
  const body = (await request.json()) as OnboardingState;

  const response = NextResponse.json({ ok: true });
  response.cookies.set(ONBOARDING_COOKIE, serializeOnboardingState(body), {
    ...getAppCookieOptions(),
  });

  return response;
}
