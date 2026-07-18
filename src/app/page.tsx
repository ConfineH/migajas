import { AppNavBar } from "@/components/AppNavBar";
import { HomeBackgroundBlobs } from "@/components/home/HomeBackgroundBlobs";
import { HomeFeatures, HomeHero } from "@/components/home/HomeAnimated";
import { formatExchangeRule } from "@/lib/domain/regions";
import { getOnboardingState } from "@/lib/onboarding";
import { getActiveRegion, getDefaultRegion } from "@/lib/region-server";

export default async function Home() {
  const state = await getOnboardingState();
  const region = state?.completed ? await getActiveRegion() : getDefaultRegion();

  const regionLine = state?.completed
    ? `${region.flag} ${region.name} · ${formatExchangeRule(region)}`
    : null;

  return (
    <>
      <HomeBackgroundBlobs />
      <AppNavBar />
      <main className="relative mx-auto flex w-full max-w-5xl flex-1 flex-col px-5 pb-20 pt-8 sm:px-8 sm:pt-12">
        <HomeHero regionLine={regionLine} />
        <HomeFeatures />
      </main>
    </>
  );
}
