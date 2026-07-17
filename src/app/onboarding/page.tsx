import { AppNavBar } from "@/components/AppNavBar";
import { OnboardingFlow } from "@/components/OnboardingFlow";
import { AppPageLayout } from "@/components/layout/AppPageLayout";
import {
  hasPassedNivel3,
  toGuidedProgress,
} from "@/lib/domain/guided-flow";
import { resolveRegionIdFromOnboarding } from "@/lib/domain/regions";
import { resolveProgress } from "@/lib/learning-state";
import { getOnboardingState } from "@/lib/onboarding";
import { createClient } from "@/lib/supabase/server";
import { getUserProfile } from "@/lib/supabase/user-profile";

export const metadata = {
  title: "Configuración — Migajas",
};

export default async function OnboardingPage() {
  const state = await getOnboardingState();
  const settingsMode = state?.completed === true;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const profile = user ? await getUserProfile(user.id) : null;
  const progress = await resolveProgress();
  const guidedProgress = toGuidedProgress(progress);

  return (
    <>
      <AppNavBar />
      <main className="flex flex-1 flex-col">
        <AppPageLayout>
          <OnboardingFlow
            initialRegionId={profile?.region_id ?? resolveRegionIdFromOnboarding(state)}
            initialGuestMode={state?.guestMode ?? true}
            initialDailyCarbGoal={
              profile?.daily_carb_goal_g ?? state?.daily_carb_goal_g ?? null
            }
            initialClinicalModeEnabled={profile?.clinical_mode_enabled ?? false}
            isAuthenticated={Boolean(user)}
            canEnableClinicalMode={hasPassedNivel3(guidedProgress)}
            settingsMode={settingsMode}
          />
        </AppPageLayout>
      </main>
    </>
  );
}
