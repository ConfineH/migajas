import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { deleteAuthenticatedUserData } from "@/lib/supabase/account-lifecycle";

export async function DELETE() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const deleted = await deleteAuthenticatedUserData(user.id);
  if (!deleted) {
    return NextResponse.json(
      { error: "No se pudo eliminar la cuenta." },
      { status: 503 },
    );
  }

  await supabase.auth.signOut();
  return NextResponse.json({ ok: true });
}
