import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  COOKIE_CONSENT_COOKIE,
  type CookieConsentValue,
} from "@/lib/domain/cookie-consent";
import { getAppCookieOptions } from "@/lib/cookie-options";

export async function GET() {
  const cookieStore = await cookies();
  const value = cookieStore.get(COOKIE_CONSENT_COOKIE)?.value ?? null;
  return NextResponse.json({ value });
}

export async function POST(request: Request) {
  const body = (await request.json()) as { value?: CookieConsentValue };
  if (body.value !== "accepted" && body.value !== "essential") {
    return NextResponse.json({ error: "Valor no válido." }, { status: 400 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(COOKIE_CONSENT_COOKIE, body.value, {
    ...getAppCookieOptions(),
  });
  return response;
}
