import { redirect } from "next/navigation";
import { AppNavBar } from "@/components/AppNavBar";
import { FirstRationClient } from "@/components/first-ration/FirstRationClient";
import { AppPageLayout } from "@/components/layout/AppPageLayout";
import { PageHeader } from "@/components/ui/PageHeader";
import { getFoodById } from "@/lib/data/foods";
import { localizeLevel } from "@/lib/domain/content-localization";
import { getLevels } from "@/lib/domain/exercises";
import {
  FIRST_RATION_COPY,
  buildFirstRationSession,
} from "@/lib/domain/first-ration";
import { toGuidedProgress } from "@/lib/domain/guided-flow";
import { resolveHubCourseFocus } from "@/lib/domain/hub-dashboard";
import { NOINDEX_METADATA } from "@/lib/domain/seo";
import type { RegionId } from "@/lib/domain/user-profile";
import { resolveProgress } from "@/lib/learning-state";
import { getOnboardingState } from "@/lib/onboarding";
import { getActiveRegion } from "@/lib/region-server";

export const metadata = NOINDEX_METADATA;
export const dynamic = "force-dynamic";

export default async function PrimeraRacionPage() {
  const state = await getOnboardingState();
  if (!state?.completed) {
    redirect("/onboarding");
  }

  const region = await getActiveRegion();
  const session = buildFirstRationSession(
    region.id as RegionId,
    getFoodById,
  );
  if (!session) {
    redirect("/learn");
  }

  const progress = toGuidedProgress(await resolveProgress());
  const levels = getLevels().map((level) => localizeLevel(level, region));
  const focus = resolveHubCourseFocus(progress, levels);

  return (
    <>
      <AppNavBar />
      <main className="flex flex-1 flex-col">
        <AppPageLayout>
          <PageHeader
            title={FIRST_RATION_COPY.title}
            description={FIRST_RATION_COPY.lead}
          />
          <FirstRationClient
            session={session}
            continueHref={focus?.continueHref ?? "/learn"}
          />
        </AppPageLayout>
      </main>
    </>
  );
}
