import { NextResponse } from "next/server";
import {
  hasPassedNivel3,
  toGuidedProgress,
} from "@/lib/domain/guided-flow";
import {
  isClinicalFeatureEnabled,
  mergeCookieIntoProfile,
  validateProfilePatch,
} from "@/lib/domain/user-profile";
import { resolveProgress } from "@/lib/learning-state";
import { syncGuestProfile } from "@/lib/profile-sync";
import { createClient } from "@/lib/supabase/server";
import {
  getUserProfile,
  patchUserProfile,
  upsertUserProfile,
} from "@/lib/supabase/user-profile";
import { getOnboardingState } from "@/lib/onboarding";
import {
  grantHealthDataConsent,
  revokeHealthDataConsent,
} from "@/lib/supabase/consent-records";

async function requireAuthenticatedUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function GET() {
  const user = await requireAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  let profile = await getUserProfile(user.id);
  if (!profile) {
    profile = await syncGuestProfile(user.id);
  }

  if (!profile) {
    const cookie = await getOnboardingState();
    const merged = mergeCookieIntoProfile(cookie);
    profile = await upsertUserProfile(user.id, merged);
  }

  if (!profile) {
    return NextResponse.json(
      { error: "No se pudo cargar el perfil" },
      { status: 500 },
    );
  }

  return NextResponse.json(profile);
}

export async function PATCH(request: Request) {
  const user = await requireAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const body = await request.json();
  const validation = validateProfilePatch(body);
  if (!validation.ok) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }

  if (
    validation.value.clinical_mode_enabled === true &&
    !isClinicalFeatureEnabled()
  ) {
    return NextResponse.json(
      { error: "El seguimiento personal no está disponible." },
      { status: 403 },
    );
  }

  if (validation.value.clinical_mode_enabled === true) {
    const progress = await resolveProgress();
    if (!hasPassedNivel3(toGuidedProgress(progress))) {
      return NextResponse.json(
        { error: "Completa el nivel 3 para activar el seguimiento personal." },
        { status: 403 },
      );
    }
  }

  let existing = await getUserProfile(user.id);
  if (!existing) {
    existing = await syncGuestProfile(user.id);
  }
  if (!existing) {
    const cookie = await getOnboardingState();
    existing = await upsertUserProfile(
      user.id,
      mergeCookieIntoProfile(cookie),
    );
  }

  if (!existing) {
    return NextResponse.json(
      { error: "No se pudo cargar el perfil" },
      { status: 500 },
    );
  }

  const updated = await patchUserProfile(user.id, existing, validation.value);
  if (!updated) {
    return NextResponse.json(
      { error: "No se pudo guardar el perfil" },
      { status: 500 },
    );
  }

  if (validation.value.clinical_mode_enabled === true) {
    const recorded = await grantHealthDataConsent(user.id);
    if (!recorded) {
      return NextResponse.json(
        { error: "No se pudo registrar el consentimiento de salud." },
        { status: 503 },
      );
    }
  } else if (
    validation.value.clinical_mode_enabled === false &&
    existing.clinical_mode_enabled
  ) {
    await revokeHealthDataConsent(user.id);
  }

  return NextResponse.json(updated);
}
