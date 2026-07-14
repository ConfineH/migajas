import { NavBar } from "@/components/NavBar";
import { getFreeModeStatus } from "@/lib/free-mode";
import { getAuthUser } from "@/lib/supabase/auth";
import { isContentAdmin } from "@/lib/domain/admin";
import { hasCompletedOnboarding } from "@/lib/onboarding";

export async function AppNavBar() {
  const [freeMode, user, showGuide] = await Promise.all([
    getFreeModeStatus(),
    getAuthUser(),
    hasCompletedOnboarding(),
  ]);
  return (
    <NavBar
      freeMode={freeMode}
      user={user}
      showAdmin={isContentAdmin(user?.email)}
      showGuide={showGuide}
    />
  );
}
