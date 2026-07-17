import { StatCard } from "@/components/ui/StatCard";
import { parseOrgDashboardStats } from "@/lib/domain/admin-metrics";
import { createServiceClient, isServiceRoleConfigured } from "@/lib/supabase/service";

export async function AdminOrgMetrics() {
  if (!isServiceRoleConfigured()) {
    return (
      <p className="rounded-2xl bg-terracotta-soft/30 px-4 py-3 text-sm text-foreground">
        Configura SUPABASE_SERVICE_ROLE_KEY para ver métricas agregadas.
      </p>
    );
  }

  const supabase = createServiceClient();
  const { data, error } = await supabase.rpc("get_org_dashboard_stats");
  const stats = error ? null : parseOrgDashboardStats(data);

  if (!stats) {
    return (
      <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
        No se pudieron cargar las métricas agregadas.
      </p>
    );
  }

  return (
    <section className="space-y-4">
      <div>
        <h2 className="font-display text-lg font-medium text-foreground">
          Métricas de organización
        </h2>
        <p className="text-sm text-muted">
          Datos agregados y anónimos. Sin emails, perfiles individuales ni diarios de ingesta.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Usuarios registrados" value={stats.totalUsers} />
        <StatCard label="Activos (30 días)" value={stats.active30d} />
        <StatCard
          label="Media niveles aprobados"
          value={stats.avgLevelsPassed.toFixed(1)}
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Iniciaron lecciones"
          value={stats.funnel.lessonStarters}
        />
        <StatCard label="Aprobaron nivel 1" value={stats.funnel.nivel1Passed} />
        <StatCard
          label="Modo libre desbloqueado"
          value={stats.funnel.freeModeUnlocked}
        />
      </div>
    </section>
  );
}
