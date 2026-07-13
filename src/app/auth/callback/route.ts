import { NextResponse } from "next/server";
import { sanitizePostAuthRedirect } from "@/lib/domain/auth";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import {
  applyLearningStateCookies,
  syncGuestLearningState,
} from "@/lib/learning-state";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = sanitizePostAuthRedirect(searchParams.get("next"));

  if (!isSupabaseConfigured()) {
    return NextResponse.redirect(`${origin}/login?error=config`);
  }

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const response = NextResponse.redirect(`${origin}${next}`);

      if (user) {
        const merged = await syncGuestLearningState(user.id);
        applyLearningStateCookies(response, merged);
      }

      return response;
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth`);
}
