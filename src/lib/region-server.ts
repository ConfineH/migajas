import {
  DEFAULT_REGION_ID,
  getRegionById,
  resolveRegionIdFromOnboarding,
  type RegionProfile,
} from "@/lib/domain/regions";
import { getOnboardingState } from "@/lib/onboarding";

export async function getActiveRegion(): Promise<RegionProfile> {
  const state = await getOnboardingState();
  const regionId = resolveRegionIdFromOnboarding(state);
  return getRegionById(regionId);
}

export function getDefaultRegion(): RegionProfile {
  return getRegionById(DEFAULT_REGION_ID);
}
