import { resolveRegionIdFromOnboarding } from "@/lib/domain/regions";
import type { OnboardingState } from "@/lib/onboarding";

export const VALID_REGION_IDS = ["es", "do"] as const;
export type RegionId = (typeof VALID_REGION_IDS)[number];

export interface UserProfile {
  user_id: string;
  region_id: RegionId;
  daily_carb_goal_g: number | null;
  clinical_mode_enabled: boolean;
  updated_at?: string;
}

export interface UserProfileUpsert {
  region_id: RegionId;
  daily_carb_goal_g: number | null;
  clinical_mode_enabled: boolean;
}

export interface ProfilePatchInput {
  region_id?: unknown;
  daily_carb_goal_g?: unknown;
  clinical_mode_enabled?: unknown;
  health_data_consent?: unknown;
}

export function isClinicalFeatureEnabled(
  envValue: string | undefined = process.env.CLINICAL_MODE_ENABLED,
): boolean {
  return envValue !== "false";
}

export function mergeCookieIntoProfile(
  cookie: OnboardingState | null,
  existing?: UserProfile | null,
): UserProfileUpsert {
  const region_id = (existing?.region_id ??
    resolveRegionIdFromOnboarding(cookie)) as RegionId;
  const daily_carb_goal_g =
    existing?.daily_carb_goal_g != null
      ? existing.daily_carb_goal_g
      : (cookie?.daily_carb_goal_g ?? null);
  const clinical_mode_enabled = existing?.clinical_mode_enabled ?? false;

  return {
    region_id,
    daily_carb_goal_g,
    clinical_mode_enabled,
  };
}

export function validateDailyCarbGoal(value: unknown): string | null {
  if (value === null || value === undefined) {
    return null;
  }
  if (typeof value !== "number" || !Number.isInteger(value) || value <= 0) {
    return "La meta diaria debe ser un número entero mayor que 0.";
  }
  return null;
}

function parseRegionId(value: unknown): RegionId | null {
  if (typeof value !== "string") return null;
  return VALID_REGION_IDS.includes(value as RegionId)
    ? (value as RegionId)
    : null;
}

export function validateProfilePatch(
  input: ProfilePatchInput,
): { ok: true; value: Partial<UserProfileUpsert> } | { ok: false; error: string } {
  const patch: Partial<UserProfileUpsert> = {};

  if (input.region_id !== undefined) {
    const region_id = parseRegionId(input.region_id);
    if (!region_id) {
      return { ok: false, error: "Región no válida." };
    }
    patch.region_id = region_id;
  }

  if (input.daily_carb_goal_g !== undefined) {
    const goalError = validateDailyCarbGoal(input.daily_carb_goal_g);
    if (goalError) {
      return { ok: false, error: goalError };
    }
    patch.daily_carb_goal_g =
      input.daily_carb_goal_g === null || input.daily_carb_goal_g === undefined
        ? null
        : (input.daily_carb_goal_g as number);
  }

  if (input.clinical_mode_enabled !== undefined) {
    if (typeof input.clinical_mode_enabled !== "boolean") {
      return { ok: false, error: "Modo clínico no válido." };
    }
    if (input.clinical_mode_enabled === true) {
      if (input.health_data_consent !== true) {
        return {
          ok: false,
          error:
            "Debes dar tu consentimiento explícito para tratar datos de salud.",
        };
      }
    }
    patch.clinical_mode_enabled = input.clinical_mode_enabled;
  }

  if (Object.keys(patch).length === 0) {
    return { ok: false, error: "No hay cambios para guardar." };
  }

  return { ok: true, value: patch };
}

export function parseUserProfileRow(row: {
  user_id: string;
  region_id: string;
  daily_carb_goal_g: number | null;
  clinical_mode_enabled: boolean;
  updated_at?: string;
}): UserProfile {
  return {
    user_id: row.user_id,
    region_id: parseRegionId(row.region_id) ?? "es",
    daily_carb_goal_g: row.daily_carb_goal_g,
    clinical_mode_enabled: row.clinical_mode_enabled,
    updated_at: row.updated_at,
  };
}
