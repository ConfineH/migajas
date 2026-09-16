import { NextResponse } from "next/server";
import { requireClinicalAccess } from "@/lib/clinical-access";
import {
  formatShareRecipientPreview,
  normalizeShareCode,
  parseProfessionalSharePreview,
} from "@/lib/domain/professional-profile";
import { lookupProfessionalByShareCode } from "@/lib/supabase/professional";

export async function POST(request: Request) {
  const access = await requireClinicalAccess();
  if (!access.ok) {
    return NextResponse.json(
      { error: access.error },
      { status: access.status },
    );
  }

  const body = await request.json();
  const shareCode = normalizeShareCode(body.share_code);
  if (!shareCode) {
    return NextResponse.json(
      { error: "El código del profesional no es válido." },
      { status: 400 },
    );
  }

  const result = await lookupProfessionalByShareCode(shareCode);
  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  const preview = parseProfessionalSharePreview(result, shareCode);
  if (!preview) {
    return NextResponse.json(
      { error: "Ese código no corresponde a un profesional." },
      { status: 400 },
    );
  }

  return NextResponse.json({
    summary: formatShareRecipientPreview(preview),
  });
}
