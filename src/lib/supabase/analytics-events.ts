import type { StoredLearningEvent } from "@/lib/domain/analytics-dashboard";
import type { LearningEventType } from "@/lib/domain/analytics";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/client";

interface LearningEventRow {
  event_type: LearningEventType;
  payload: Record<string, unknown>;
  created_at: string;
}

export async function getUserLearningEvents(
  userId: string,
): Promise<StoredLearningEvent[]> {
  if (!isSupabaseConfigured()) return [];

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("learning_events")
    .select("event_type, payload, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error || !data) return [];

  return (data as LearningEventRow[]).map((row) => ({
    eventType: row.event_type,
    payload: row.payload,
    createdAt: row.created_at,
  }));
}
