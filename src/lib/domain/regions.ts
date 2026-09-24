import { buildReferenceTips as buildReferenceTipsFromGuide } from "./reference-guide";

export interface RegionProfile {
  id: string;
  name: string;
  flag: string;
  foodCountry: string;
  exchangeUnitG: number;
}

export const REGIONS: RegionProfile[] = [
  {
    id: "es",
    name: "España",
    flag: "🇪🇸",
    foodCountry: "España",
    exchangeUnitG: 10,
  },
  {
    id: "do",
    name: "República Dominicana",
    flag: "🇩🇴",
    foodCountry: "República Dominicana",
    exchangeUnitG: 15,
  },
];

export const DEFAULT_REGION_ID = "es";

export function getRegionById(id: string | null | undefined): RegionProfile {
  return REGIONS.find((region) => region.id === id) ?? REGIONS[0];
}

export function formatExchangeRule(region: RegionProfile): string {
  return `${region.exchangeUnitG} g de carbohidratos = 1 ración`;
}

export function formatHalfExchangeRule(region: RegionProfile): string {
  const half = region.exchangeUnitG / 2;
  const oneAndHalf = region.exchangeUnitG * 1.5;
  return `Puedes usar medios: ${half} g = 0,5 raciones, ${oneAndHalf} g = 1,5 raciones.`;
}

export function buildReferenceTips(region: RegionProfile): string[] {
  return buildReferenceTipsFromGuide(
    region.exchangeUnitG,
    region.name,
    region.id,
  );
}

export function resolveRegionIdFromOnboarding(state: {
  regionId?: string;
  country?: string;
} | null): string {
  if (state?.regionId) return getRegionById(state.regionId).id;
  if (state?.country === "República Dominicana") return "do";
  return DEFAULT_REGION_ID;
}

/** A recommendation link may only name a region we actually ship. */
export function regionIdFromQuery(
  value: string | null | undefined,
): string | null {
  if (!value) return null;
  const id = value.trim().toLowerCase();
  return REGIONS.some((region) => region.id === id) ? id : null;
}

/**
 * Account country wins. A `?region=` link only preselects the first time,
 * before onboarding is finished. After that, the saved country stays.
 */
export function resolveOnboardingRegionId(input: {
  accountRegionId?: string | null;
  queryRegion?: string | null;
  onboardingCompleted?: boolean;
  state?: { regionId?: string; country?: string } | null;
}): string {
  const account = regionIdFromQuery(input.accountRegionId);
  if (account) return account;
  if (!input.onboardingCompleted) {
    const recommended = regionIdFromQuery(input.queryRegion);
    if (recommended) return recommended;
  }
  return resolveRegionIdFromOnboarding(input.state ?? null);
}

/** Link a professional shares. Uses their account country. */
export function recommendCourseUrl(siteUrl: string, regionId: string): string {
  const origin = siteUrl.trim().replace(/\/$/, "");
  const id = regionIdFromQuery(regionId) ?? DEFAULT_REGION_ID;
  return `${origin}/onboarding?region=${id}`;
}
