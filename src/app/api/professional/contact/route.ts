import { NextResponse } from "next/server";
import { CLINICAL_SUSPENSION_ERRORS } from "@/lib/domain/user-profile";
import { createClient } from "@/lib/supabase/server";

export async function POST(_request: Request) {
  void _request;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  return NextResponse.json(
    { error: CLINICAL_SUSPENSION_ERRORS.contact },
    { status: 403 },
  );
}
