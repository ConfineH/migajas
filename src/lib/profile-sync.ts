import { getOnboardingState } from "@/lib/onboarding";
import { mergeCookieIntoProfile } from "@/lib/domain/user-profile";
import {
  getUserProfile,
  upsertUserProfile,
} from "@/lib/supabase/user-profile";

export async function syncGuestProfile(userId: string) {
  const cookie = await getOnboardingState();
  const existing = await getUserProfile(userId);
  const merged = mergeCookieIntoProfile(cookie, existing);
  return upsertUserProfile(userId, merged);
}
