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
    <div className="space-y-8">
      <section className="space-y-4">
        <div>
          <h2 className="font-display text-lg font-medium text-foreground">
            Adopción general
          </h2>
          <p className="text-sm text-muted">
            Datos agregados y anónimos. Sin emails, perfiles individuales ni diarios de ingesta.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard label="Usuarios registrados" value={stats.totalUsers} />
          <StatCard label="Activos (7 días)" value={stats.active7d} />
          <StatCard label="Activos (30 días)" value={stats.active30d} />
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard
            label="Media niveles aprobados"
            value={stats.avgLevelsPassed.toFixed(1)}
          />
          <StatCard
            label="Retención 7 días"
            value={`${stats.retention.retention7dPct}%`}
          />
          <StatCard
            label="Retención 30 días"
            value={`${stats.retention.retention30dPct}%`}
          />
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="font-display text-lg font-medium text-foreground">
          Embudo de aprendizaje
        </h2>
        <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-4">
          <StatCard
            label="Iniciaron lecciones"
            value={stats.funnel.lessonStarters}
          />
          <StatCard label="Nivel 1 aprobado" value={stats.funnel.nivel1Passed} />
          <StatCard label="Nivel 2 aprobado" value={stats.funnel.nivel2Passed} />
          <StatCard label="Nivel 3 aprobado" value={stats.funnel.nivel3Passed} />
          <StatCard label="Nivel 4 aprobado" value={stats.funnel.nivel4Passed} />
          <StatCard label="Nivel 5 aprobado" value={stats.funnel.nivel5Passed} />
          <StatCard
            label="Modo libre desbloqueado"
            value={stats.funnel.freeModeUnlocked}
          />
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="font-display text-lg font-medium text-foreground">
          Territorio y modo clínico
        </h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard label="Perfiles España" value={stats.regions.es} />
          <StatCard label="Perfiles RD" value={stats.regions.do} />
          <StatCard label="Sin perfil regional" value={stats.regions.unknown} />
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard
            label="Modo clínico activo"
            value={stats.clinical.enabledCount}
          />
          <StatCard
            label="% modo clínico"
            value={`${stats.clinical.enabledPct}%`}
          />
          <StatCard
            label="Diario activo (30 días)"
            value={stats.diaryActive30d}
          />
        </div>
      </section>
    </div>
  );
}
