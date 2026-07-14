import {
  canUseClinicalMode,
  hasPassedNivel3,
  toGuidedProgress,
} from "@/lib/domain/guided-flow";
import {
  isClinicalFeatureEnabled,
  type UserProfile,
} from "@/lib/domain/user-profile";
import type { AuthUserSummary } from "@/lib/domain/auth";
import { resolveProgress } from "@/lib/learning-state";
import { syncGuestProfile } from "@/lib/profile-sync";
import { getAuthUser } from "@/lib/supabase/auth";
import { getUserProfile } from "@/lib/supabase/user-profile";

export type ClinicalAccessResult =
  | {
      ok: true;
      user: AuthUserSummary;
      profile: UserProfile;
    }
  | {
      ok: false;
      status: 401 | 403;
      error: string;
      reason: "auth" | "feature" | "nivel" | "opt-in";
    };

export async function requireClinicalAccess(): Promise<ClinicalAccessResult> {
  const user = await getAuthUser();
  if (!user) {
    return {
      ok: false,
      status: 401,
      error: "Inicia sesión para usar el diario.",
      reason: "auth",
    };
  }

  if (!isClinicalFeatureEnabled()) {
    return {
      ok: false,
      status: 403,
      error: "El modo clínico no está disponible.",
      reason: "feature",
    };
  }

  let profile = await getUserProfile(user.id);
  if (!profile) {
    profile = await syncGuestProfile(user.id);
  }
  if (!profile) {
    return {
      ok: false,
      status: 403,
      error: "No se pudo cargar tu perfil.",
      reason: "opt-in",
    };
  }

  const progress = toGuidedProgress(await resolveProgress());
  if (!hasPassedNivel3(progress)) {
    return {
      ok: false,
      status: 403,
      error: "Completa el nivel 3 para usar el diario.",
      reason: "nivel",
    };
  }

  if (!canUseClinicalMode(progress, profile)) {
    return {
      ok: false,
      status: 403,
      error: "Activa el modo clínico en Configuración.",
      reason: "opt-in",
    };
  }

  return { ok: true, user, profile };
}

export async function canShowDiaryLink(): Promise<boolean> {
  const access = await requireClinicalAccess();
  return access.ok;
}

export async function canShowClinicalPrompt(): Promise<{
  show: boolean;
  isAuthenticated: boolean;
}> {
  const user = await getAuthUser();
  if (!user || !isClinicalFeatureEnabled()) {
    return { show: false, isAuthenticated: Boolean(user) };
  }

  const profile = (await getUserProfile(user.id)) ?? (await syncGuestProfile(user.id));
  const progress = toGuidedProgress(await resolveProgress());

  return {
    show: Boolean(
      profile &&
        hasPassedNivel3(progress) &&
        !profile.clinical_mode_enabled,
    ),
    isAuthenticated: true,
  };
}
