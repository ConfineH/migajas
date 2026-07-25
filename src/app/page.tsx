import { AppNavBar } from "@/components/AppNavBar";
import { HomeBackgroundBlobs } from "@/components/home/HomeBackgroundBlobs";
import { HomeFeatures, HomeHero } from "@/components/home/HomeAnimated";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  buildCourseJsonLd,
  buildOrganizationJsonLd,
  buildPageMetadata,
  getSiteUrl,
  PUBLIC_PAGE_SEO,
} from "@/lib/domain/seo";
import { formatExchangeRule } from "@/lib/domain/regions";
import { getOnboardingState } from "@/lib/onboarding";
import { getActiveRegion, getDefaultRegion } from "@/lib/region-server";

export const metadata = buildPageMetadata(PUBLIC_PAGE_SEO.home);

export default async function Home() {
  const siteUrl = getSiteUrl();
  const state = await getOnboardingState();
  const region = state?.completed ? await getActiveRegion() : getDefaultRegion();

  const regionLine = state?.completed
    ? `${region.flag} ${region.name} · ${formatExchangeRule(region)}`
    : null;

  return (
    <>
      <JsonLd data={buildOrganizationJsonLd(siteUrl)} />
      <JsonLd data={buildCourseJsonLd(siteUrl)} />
      <HomeBackgroundBlobs />
      <AppNavBar />
      <main className="relative mx-auto flex w-full max-w-5xl flex-1 flex-col px-5 pb-20 pt-8 sm:px-8 sm:pt-12">
        <HomeHero regionLine={regionLine} />
        <HomeFeatures />
      </main>
    </>
  );
}
