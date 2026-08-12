import { redirect } from "next/navigation";
import { AppNavBar } from "@/components/AppNavBar";
import { HomeBackgroundBlobs } from "@/components/home/HomeBackgroundBlobs";
import { HomeFeatures, HomeHero } from "@/components/home/HomeAnimated";
import { JsonLd } from "@/components/seo/JsonLd";
import { HERO_COPY } from "@/lib/domain/brand-positioning";
import { buildHomeHeroCtas } from "@/lib/domain/hub-dashboard";
import {
  buildCourseJsonLd,
  buildOrganizationJsonLd,
  buildPageMetadata,
  getSiteUrl,
  PUBLIC_PAGE_SEO,
} from "@/lib/domain/seo";
import { getAuthUser } from "@/lib/supabase/auth";

export const metadata = buildPageMetadata(PUBLIC_PAGE_SEO.home);

export default async function Home() {
  const user = await getAuthUser();
  if (user) {
    redirect("/inicio");
  }

  const siteUrl = getSiteUrl();
  const ctas = buildHomeHeroCtas({
    isLoggedIn: false,
    onboardingDone: false,
    continueHref: null,
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
        <HomeHero ctas={ctas} />
        <HomeFeatures />
      </main>
    </>
  );
}
