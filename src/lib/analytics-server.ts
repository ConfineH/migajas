import type { LearningEvent } from "@/lib/domain/analytics";
import { buildLearningEventRecord } from "@/lib/domain/analytics-persist";
import { getAuthUser } from "@/lib/supabase/auth";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/client";

export async function trackLearningEvent(event: LearningEvent): Promise<void> {
  if (process.env.NODE_ENV === "test") return;

  const user = await getAuthUser();
  const enriched = user ? { ...event, userId: user.id } : event;
  console.info("[analytics]", JSON.stringify(enriched));

  if (!user || !isSupabaseConfigured()) return;

  try {
    const supabase = await createClient();
    await supabase
      .from("learning_events")
      .insert(buildLearningEventRecord(event, user.id));
  } catch {
    // Analytics must not break learning flows
  }
}
