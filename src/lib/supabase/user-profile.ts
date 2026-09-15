import {
  parseUserProfileRow,
  type UserProfile,
  type UserProfileUpsert,
} from "@/lib/domain/user-profile";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/client";

const PROFILE_COLUMNS =
  "user_id, region_id, daily_carb_goal_g, clinical_mode_enabled, is_professional, professional_role, professional_share_code, updated_at";

function toProfileRow(userId: string, profile: UserProfileUpsert) {
  return {
    user_id: userId,
    region_id: profile.region_id,
    daily_carb_goal_g: profile.daily_carb_goal_g,
    clinical_mode_enabled: profile.clinical_mode_enabled,
    updated_at: new Date().toISOString(),
    ...(profile.is_professional !== undefined
      ? { is_professional: profile.is_professional }
      : {}),
    ...(profile.professional_role !== undefined
      ? { professional_role: profile.professional_role }
      : {}),
    ...(profile.professional_share_code !== undefined
      ? { professional_share_code: profile.professional_share_code }
      : {}),
  };
}

export async function getUserProfile(
  userId: string,
): Promise<UserProfile | null> {
  if (!isSupabaseConfigured()) return null;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("user_profiles")
    .select(PROFILE_COLUMNS)
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
    .upsert(toProfileRow(userId, profile), { onConflict: "user_id" })
    .select(PROFILE_COLUMNS)
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
    is_professional:
      patch.is_professional !== undefined
        ? patch.is_professional
        : existing.is_professional,
    professional_role:
      patch.professional_role !== undefined
        ? patch.professional_role
        : existing.professional_role,
    professional_share_code:
      patch.professional_share_code !== undefined
        ? patch.professional_share_code
        : existing.professional_share_code,
  });
}

export async function findProfessionalByShareCode(
  code: string,
): Promise<UserProfile | null> {
  if (!isSupabaseConfigured()) return null;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("user_profiles")
    .select(PROFILE_COLUMNS)
    .eq("professional_share_code", code)
    .eq("is_professional", true)
    .maybeSingle();

  if (error || !data) return null;
  return parseUserProfileRow(data);
}
