import { NextResponse } from "next/server";
import { parseOrgDashboardStats } from "@/lib/domain/admin-metrics";
import { requireContentAdmin } from "@/lib/supabase/content-admin";
import { createServiceClient } from "@/lib/supabase/service";

export async function GET() {
  try {
    await requireContentAdmin();
  } catch (error) {
    const message = error instanceof Error ? error.message : "FORBIDDEN";
    if (message === "SERVICE_ROLE_MISSING") {
      return NextResponse.json(
        { error: "Falta SUPABASE_SERVICE_ROLE_KEY en el servidor." },
        { status: 503 },
      );
    }
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const supabase = createServiceClient();
  const { data, error } = await supabase.rpc("get_org_dashboard_stats");

  if (error) {
    return NextResponse.json(
      { error: "No se pudieron cargar las métricas." },
      { status: 500 },
    );
  }

  const stats = parseOrgDashboardStats(data);
  if (!stats) {
    return NextResponse.json(
      { error: "Respuesta de métricas no válida." },
      { status: 500 },
    );
  }

  return NextResponse.json(stats);
}
