import { AppNavBar } from "@/components/AppNavBar";
import { HomeBackgroundBlobs } from "@/components/home/HomeBackgroundBlobs";
import { HomeFeatures, HomeHero } from "@/components/home/HomeAnimated";
import { JsonLd } from "@/components/seo/JsonLd";
import { HERO_COPY } from "@/lib/domain/brand-positioning";
import { localizeLevel } from "@/lib/domain/content-localization";
import { getLevels } from "@/lib/domain/exercises";
import { toGuidedProgress } from "@/lib/domain/guided-flow";
import { buildHomeHeroCtas, resolveHubCourseFocus } from "@/lib/domain/hub-dashboard";
import {
  buildCourseJsonLd,
  buildOrganizationJsonLd,
  buildPageMetadata,
  getSiteUrl,
  PUBLIC_PAGE_SEO,
} from "@/lib/domain/seo";
import { formatExchangeRule } from "@/lib/domain/regions";
import { resolveProgress } from "@/lib/learning-state";
import { getOnboardingState } from "@/lib/onboarding";
import { getActiveRegion, getDefaultRegion } from "@/lib/region-server";
import { getAuthUser } from "@/lib/supabase/auth";

export const metadata = buildPageMetadata(PUBLIC_PAGE_SEO.home);

export default async function Home() {
  const siteUrl = getSiteUrl();
  const [state, user] = await Promise.all([
    getOnboardingState(),
    getAuthUser(),
  ]);
  const onboardingDone = state?.completed === true;
  const region = onboardingDone ? await getActiveRegion() : getDefaultRegion();

  const regionLine = onboardingDone
    ? `${region.flag} ${region.name} · ${formatExchangeRule(region)}`
    : null;

  let continueHref: string | null = null;
  if (user && onboardingDone) {
    const progress = toGuidedProgress(await resolveProgress());
    const levels = getLevels().map((level) => localizeLevel(level, region));
    const focus = resolveHubCourseFocus(progress, levels);
    continueHref = focus?.continueHref ?? null;
  }

  const ctas = buildHomeHeroCtas({
    isLoggedIn: Boolean(user),
    onboardingDone,
    continueHref,
    startLabel: HERO_COPY.ctaPrimary,
    browseLabel: HERO_COPY.ctaSecondary,
  });

  return (
    <>
      <JsonLd data={buildOrganizationJsonLd(siteUrl)} />
      <JsonLd data={buildCourseJsonLd(siteUrl)} />
      <HomeBackgroundBlobs />
      <AppNavBar />
      <main className="relative mx-auto flex w-full max-w-5xl flex-1 flex-col px-5 pb-20 pt-8 sm:px-8 sm:pt-12">
        <HomeHero regionLine={regionLine} ctas={ctas} />
        <HomeFeatures />
      </main>
    </>
  );
}
