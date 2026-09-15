import { NextResponse } from "next/server";
import { randomInt } from "node:crypto";
import { generateProfessionalShareCode, validateProfessionalActivation } from "@/lib/domain/professional-profile";
import { mergeCookieIntoProfile } from "@/lib/domain/user-profile";
import { getOnboardingState } from "@/lib/onboarding";
import { createClient } from "@/lib/supabase/server";
import { syncGuestProfile } from "@/lib/profile-sync";
import {
  getUserProfile,
  patchUserProfile,
  upsertUserProfile,
} from "@/lib/supabase/user-profile";

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function POST(request: Request) {
  const user = await requireUser();
  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const body = await request.json();
  const validation = validateProfessionalActivation(body);
  if (!validation.ok) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }

  let existing = await getUserProfile(user.id);
  if (!existing) {
    existing = await syncGuestProfile(user.id);
  }
  if (!existing) {
    const cookie = await getOnboardingState();
    existing = await upsertUserProfile(user.id, mergeCookieIntoProfile(cookie));
  }
  if (!existing) {
    return NextResponse.json(
      { error: "No se pudo cargar el perfil" },
      { status: 500 },
    );
  }

  const shareCode =
    existing.professional_share_code ??
    generateProfessionalShareCode((max) => randomInt(max));

  const updated = await patchUserProfile(user.id, existing, {
    is_professional: true,
    professional_role: validation.role,
    professional_share_code: shareCode,
  });

  if (!updated) {
    return NextResponse.json(
      { error: "No se pudo guardar el perfil profesional." },
      { status: 500 },
    );
  }

  return NextResponse.json(updated);
}
