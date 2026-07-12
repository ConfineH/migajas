import { NextResponse } from "next/server";
import {
  ONBOARDING_COOKIE,
  serializeOnboardingState,
  type OnboardingState,
} from "@/lib/onboarding";

export async function POST(request: Request) {
  const body = (await request.json()) as OnboardingState;

  const response = NextResponse.json({ ok: true });
  response.cookies.set(ONBOARDING_COOKIE, serializeOnboardingState(body), {
    httpOnly: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 365,
    path: "/",
  });

  return response;
}
