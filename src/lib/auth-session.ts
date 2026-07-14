import { redirect } from "next/navigation";
import { sanitizePostAuthRedirect } from "@/lib/domain/auth";
import { getAllLessons } from "@/lib/domain/lessons";
import { backfillLearningEvents } from "@/lib/supabase/analytics-backfill";
import { createClient } from "@/lib/supabase/server";
import {
  applyLearningStateToStore,
  syncGuestLearningState,
} from "@/lib/learning-state";

export async function finalizeAuthenticatedSession(
  nextPath: string,
): Promise<never> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?error=auth");
  }

  const safeNext = sanitizePostAuthRedirect(nextPath);
  const merged = await syncGuestLearningState(user.id);
  await backfillLearningEvents(
    user.id,
    merged.progress,
    getAllLessons().map((lesson) => ({
      id: lesson.id,
      levelId: lesson.levelId,
    })),
  );
  await applyLearningStateToStore(merged);
  redirect(safeNext);
}
