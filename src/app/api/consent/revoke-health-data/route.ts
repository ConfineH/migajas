import { NextResponse } from "next/server";
import { revokeHealthDataConsent } from "@/lib/supabase/consent-records";
import { createClient } from "@/lib/supabase/server";
import { getUserProfile, patchUserProfile } from "@/lib/supabase/user-profile";

export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const profile = await getUserProfile(user.id);
  if (!profile) {
    return NextResponse.json(
      { error: "No se pudo cargar el perfil" },
      { status: 500 },
    );
  }

  const revoked = await revokeHealthDataConsent(user.id);
  if (!revoked) {
    return NextResponse.json(
      { error: "No se pudo revocar el consentimiento." },
      { status: 503 },
    );
  }

  const updated = await patchUserProfile(user.id, profile, {
    clinical_mode_enabled: false,
  });
  if (!updated) {
    return NextResponse.json(
      { error: "No se pudo actualizar el perfil." },
      { status: 500 },
    );
  }

  return NextResponse.json({
    ok: true,
    clinical_mode_enabled: updated.clinical_mode_enabled,
  });
}
