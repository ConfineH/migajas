import { NextResponse } from "next/server";
import { purgeExpiredIntakeEntries } from "@/lib/supabase/intake-retention";

function isAuthorized(request: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const auth = request.headers.get("authorization");
  return auth === `Bearer ${secret}`;
}

export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const result = await purgeExpiredIntakeEntries();
  return NextResponse.json({ ok: true, deleted: result.deleted });
}
