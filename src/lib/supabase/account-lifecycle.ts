import { createClient } from "@/lib/supabase/server";
import { createServiceClient, isServiceRoleConfigured } from "@/lib/supabase/service";
import { isSupabaseConfigured } from "@/lib/supabase/client";

export async function exportAuthenticatedUserData(userId: string) {
  if (!isSupabaseConfigured()) {
    return {
      profile: null,
      learning_state: null,
      intake_entries: [],
      learning_events: [],
    };
  }

  const supabase = await createClient();
  const [profile, learningState, intake, events] = await Promise.all([
    supabase
      .from("user_profiles")
      .select(
        "user_id, region_id, daily_carb_goal_g, clinical_mode_enabled, updated_at",
      )
      .eq("user_id", userId)
      .maybeSingle(),
    supabase
      .from("user_learning_state")
      .select("user_id, progress, attempts, updated_at")
      .eq("user_id", userId)
      .maybeSingle(),
    supabase
      .from("intake_entries")
      .select(
        "id, food_id, meal_slot, logged_at, local_date, portion_multiplier, carbs_g, rations",
      )
      .eq("user_id", userId),
    supabase
      .from("learning_events")
      .select("id, event_type, payload, created_at")
      .eq("user_id", userId),
  ]);

  return {
    profile: profile.data,
    learning_state: learningState.data,
    intake_entries: intake.data ?? [],
    learning_events: events.data ?? [],
  };
}

export async function deleteAuthenticatedUserData(userId: string): Promise<boolean> {
  if (!isSupabaseConfigured() || !isServiceRoleConfigured()) {
    return false;
  }

  const service = createServiceClient();
  const tables = [
    "intake_entries",
    "learning_events",
    "user_learning_state",
    "user_profiles",
  ] as const;

  for (const table of tables) {
    const { error } = await service.from(table).delete().eq("user_id", userId);
    if (error) return false;
  }

  const { error: authError } = await service.auth.admin.deleteUser(userId);
  return !authError;
}
