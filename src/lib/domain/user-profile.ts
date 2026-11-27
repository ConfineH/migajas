import { resolveRegionIdFromOnboarding } from "@/lib/domain/regions";
import type { OnboardingState } from "@/lib/onboarding";

export const VALID_REGION_IDS = ["es", "do"] as const;
export type RegionId = (typeof VALID_REGION_IDS)[number];

export interface UserProfile {
  user_id: string;
  region_id: RegionId;
  daily_carb_goal_g: number | null;
  clinical_mode_enabled: boolean;
  is_professional: boolean;
  professional_role: string | null;
  professional_share_code: string | null;
  updated_at?: string;
}

export interface UserProfileUpsert {
  region_id: RegionId;
  daily_carb_goal_g: number | null;
  clinical_mode_enabled: boolean;
  is_professional?: boolean;
  professional_role?: string | null;
  professional_share_code?: string | null;
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

/** App-side switch for the educational pilot. The database trigger is the lock. */
export const CLINICAL_SURFACE_SUSPENDED = true;

export const CLINICAL_SUSPENSION_ERRORS = {
  intakeWrite:
    "El diario no admite registros nuevos. Puedes consultar y borrar lo ya guardado, y descargar tus datos desde Configuración.",
  clinicalReport:
    "La generación de informes clínicos está suspendida. La descarga de tus datos sigue en Configuración.",
  shareSend:
    "El envío de informes está suspendido. Puedes borrar las copias que ya enviaste.",
  shareLookup: "La búsqueda de profesionales está suspendida.",
  contact: "Los mensajes nuevos a administración están suspendidos.",
  profile:
    "La meta clínica y las altas de seguimiento personal están suspendidas.",
} as const;

export function clinicalSurfacePatchBlock(body: unknown): string | null {
  if (!CLINICAL_SURFACE_SUSPENDED || !body || typeof body !== "object") {
    return null;
  }
  const record = body as Record<string, unknown>;
  if (
    "daily_carb_goal_g" in record ||
    record.clinical_mode_enabled === true
  ) {
    return CLINICAL_SUSPENSION_ERRORS.profile;
  }
  return null;
}

export function mergeCookieIntoProfile(
  cookie: OnboardingState | null,
  existing?: UserProfile | null,
): UserProfileUpsert {
  const region_id = (existing?.region_id ??
    resolveRegionIdFromOnboarding(cookie)) as RegionId;
  const daily_carb_goal_g = CLINICAL_SURFACE_SUSPENDED
    ? (existing?.daily_carb_goal_g ?? null)
    : existing?.daily_carb_goal_g != null
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
      return { ok: false, error: "Seguimiento personal no válido." };
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
  is_professional?: boolean | null;
  professional_role?: string | null;
  professional_share_code?: string | null;
  updated_at?: string;
}): UserProfile {
  return {
    user_id: row.user_id,
    region_id: parseRegionId(row.region_id) ?? "es",
    daily_carb_goal_g: row.daily_carb_goal_g,
    clinical_mode_enabled: row.clinical_mode_enabled,
    is_professional: row.is_professional === true,
    professional_role: row.professional_role ?? null,
    professional_share_code: row.professional_share_code ?? null,
    updated_at: row.updated_at,
  };
}
