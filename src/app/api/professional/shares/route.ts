import { NextResponse } from "next/server";
import { requireClinicalAccess } from "@/lib/clinical-access";
import { buildClinicalReport, parseExportRange } from "@/lib/domain/clinical-report";
import { getFoodById } from "@/lib/data/foods";
import {
  normalizeShareCode,
  validateShareConfirmation,
} from "@/lib/domain/professional-profile";
import { listIntakeEntries } from "@/lib/supabase/intake";
import { shareReportWithProfessional } from "@/lib/supabase/professional";

function getTodayUtcDate(): string {
  const now = new Date();
  return new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
  )
    .toISOString()
    .slice(0, 10);
}

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

  const confirmation = validateShareConfirmation({ confirm: body.confirm });
  if (!confirmation.ok) {
    return NextResponse.json({ error: confirmation.error }, { status: 400 });
  }

  const parsedRange = parseExportRange(
    body.range ?? "7d",
    body.from,
    body.to,
    new Date(getTodayUtcDate()),
  );
  if (!parsedRange.ok) {
    return NextResponse.json({ error: parsedRange.error }, { status: 400 });
  }

  const rawEntries = await listIntakeEntries(
    access.user.id,
    parsedRange.from,
    parsedRange.to,
  );
  const entries = rawEntries.map((entry) => ({
    ...entry,
    foodName: getFoodById(entry.food_id)?.name ?? entry.food_id,
  }));
  const snapshot = buildClinicalReport(
    entries,
    parsedRange.from,
    parsedRange.to,
    access.profile.daily_carb_goal_g,
    { includeTopFoods: true },
  );

  const result = await shareReportWithProfessional({
    shareCode,
    rangeFrom: parsedRange.from,
    rangeTo: parsedRange.to,
    snapshot,
  });

  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json({ ok: true, id: result.id });
}
