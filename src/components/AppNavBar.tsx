import { NavBar } from "@/components/NavBar";
import { canShowDiaryLink } from "@/lib/clinical-access";
import { getFreeModeStatus } from "@/lib/free-mode";
import { getAuthUser } from "@/lib/supabase/auth";
import { isContentAdmin } from "@/lib/domain/admin";
import { hasCompletedOnboarding } from "@/lib/onboarding";
import { getUserProfile } from "@/lib/supabase/user-profile";

export async function AppNavBar() {
  const [freeMode, user, showGuide, showDiary] = await Promise.all([
    getFreeModeStatus(),
    getAuthUser(),
    hasCompletedOnboarding(),
    canShowDiaryLink(),
  ]);
  const profile = user ? await getUserProfile(user.id) : null;
  return (
    <NavBar
      freeMode={freeMode}
      user={user}
      showAdmin={isContentAdmin(user?.email)}
      showGuide={showGuide}
      showDiary={showDiary}
      showProfessional={profile?.is_professional === true}
    />
  );
}
