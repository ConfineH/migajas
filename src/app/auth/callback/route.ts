import { NextResponse } from "next/server";
import { sanitizePostAuthRedirect } from "@/lib/domain/auth";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import {
  applyLearningStateCookies,
  syncGuestLearningState,
} from "@/lib/learning-state";
import { getAllLessons } from "@/lib/domain/lessons";
import { backfillLearningEvents } from "@/lib/supabase/analytics-backfill";

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
        await backfillLearningEvents(
          user.id,
          merged.progress,
          getAllLessons().map((lesson) => ({
            id: lesson.id,
            levelId: lesson.levelId,
          })),
        );
        applyLearningStateCookies(response, merged);
      }

      return response;
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth`);
}
