import { AppNavBar } from "@/components/AppNavBar";
import { OnboardingFlow } from "@/components/OnboardingFlow";
import { resolveRegionIdFromOnboarding } from "@/lib/domain/regions";
import { getOnboardingState } from "@/lib/onboarding";

export const metadata = {
  title: "Configuración — Migajas",
};

export default async function OnboardingPage() {
  const state = await getOnboardingState();
  const settingsMode = state?.completed === true;

  return (
    <>
      <AppNavBar />
      <main className="mx-auto max-w-3xl flex-1 px-4 py-12">
        <OnboardingFlow
          initialRegionId={resolveRegionIdFromOnboarding(state)}
          initialGuestMode={state?.guestMode ?? true}
          settingsMode={settingsMode}
        />
      </main>
    </>
  );
}
