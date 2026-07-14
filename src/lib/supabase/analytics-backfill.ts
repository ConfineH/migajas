import type { UserProgress } from "@/lib/domain/progress";
import {
  buildBackfillEvents,
  extractExistingAnalyticsKeys,
  type LessonRef,
} from "@/lib/domain/analytics-backfill";
import { buildLearningEventRecord } from "@/lib/domain/analytics-persist";
import { createServiceClient, isServiceRoleConfigured } from "@/lib/supabase/service";
import { isSupabaseConfigured } from "@/lib/supabase/client";

export async function backfillLearningEvents(
  userId: string,
  progress: UserProgress,
  lessons: LessonRef[],
): Promise<number> {
  if (!isSupabaseConfigured() || !isServiceRoleConfigured()) return 0;

  try {
    const supabase = createServiceClient();
    const { data, error } = await supabase
      .from("learning_events")
      .select("event_type, payload")
      .eq("user_id", userId);

    if (error) return 0;

    const existing = extractExistingAnalyticsKeys(data ?? []);
    const events = buildBackfillEvents(progress, lessons, existing);
    if (events.length === 0) return 0;

    const rows = events.map((event) => buildLearningEventRecord(event, userId));
    const { error: insertError } = await supabase
      .from("learning_events")
      .insert(rows);

    if (insertError) return 0;
    return events.length;
  } catch {
    return 0;
  }
}
