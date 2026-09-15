import { NextResponse } from "next/server";
import { validateProfessionalContact } from "@/lib/domain/professional-profile";
import { createClient } from "@/lib/supabase/server";
import { getUserProfile } from "@/lib/supabase/user-profile";
import { insertProfessionalContact } from "@/lib/supabase/professional";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const profile = await getUserProfile(user.id);
  if (!profile?.is_professional) {
    return NextResponse.json(
      { error: "Necesitas un perfil profesional." },
      { status: 403 },
    );
  }

  const body = await request.json();
  const validation = validateProfessionalContact(body);
  if (!validation.ok) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }

  const saved = await insertProfessionalContact({
    professionalUserId: user.id,
    subject: validation.subject,
    body: validation.body,
  });
  if (!saved) {
    return NextResponse.json(
      { error: "No se pudo enviar el mensaje." },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
}
