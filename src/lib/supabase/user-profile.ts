import {
  parseUserProfileRow,
  type UserProfile,
  type UserProfileUpsert,
} from "@/lib/domain/user-profile";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/client";

export async function getUserProfile(
  userId: string,
): Promise<UserProfile | null> {
  if (!isSupabaseConfigured()) return null;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("user_profiles")
    .select(
      "user_id, region_id, daily_carb_goal_g, clinical_mode_enabled, updated_at",
    )
    .eq("user_id", userId)
    .maybeSingle();

  if (error || !data) return null;
  return parseUserProfileRow(data);
}

export async function upsertUserProfile(
  userId: string,
  profile: UserProfileUpsert,
): Promise<UserProfile | null> {
  if (!isSupabaseConfigured()) return null;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("user_profiles")
    .upsert(
      {
        user_id: userId,
        region_id: profile.region_id,
        daily_carb_goal_g: profile.daily_carb_goal_g,
        clinical_mode_enabled: profile.clinical_mode_enabled,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" },
    )
    .select(
      "user_id, region_id, daily_carb_goal_g, clinical_mode_enabled, updated_at",
    )
    .single();

  if (error || !data) return null;
  return parseUserProfileRow(data);
}

export async function patchUserProfile(
  userId: string,
  existing: UserProfile,
  patch: Partial<UserProfileUpsert>,
): Promise<UserProfile | null> {
  return upsertUserProfile(userId, {
    region_id: patch.region_id ?? existing.region_id,
    daily_carb_goal_g:
      patch.daily_carb_goal_g !== undefined
        ? patch.daily_carb_goal_g
        : existing.daily_carb_goal_g,
    clinical_mode_enabled:
      patch.clinical_mode_enabled !== undefined
        ? patch.clinical_mode_enabled
        : existing.clinical_mode_enabled,
  });
}
