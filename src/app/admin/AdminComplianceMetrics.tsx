import Link from "next/link";
import { parseOrgDashboardStats } from "@/lib/domain/admin-metrics";
import { createServiceClient, isServiceRoleConfigured } from "@/lib/supabase/service";

const consentTypeLabels: Record<string, string> = {
  health_data: "Datos de salud",
  cookie_preferences: "Cookies",
  privacy_policy: "Política de privacidad",
};

export async function AdminComplianceMetrics() {
  if (!isServiceRoleConfigured()) {
    return (
      <p className="rounded-2xl bg-terracotta-soft/30 px-4 py-3 text-sm text-foreground">
        Configura SUPABASE_SERVICE_ROLE_KEY para ver métricas de cumplimiento.
      </p>
    );
  }

  const supabase = createServiceClient();
  const { data, error } = await supabase.rpc("get_org_dashboard_stats");
  const stats = error ? null : parseOrgDashboardStats(data);

  if (!stats) {
    return (
      <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
        No se pudieron cargar las métricas de cumplimiento.
      </p>
    );
  }

  return (
    <div className="space-y-8">
      <section className="space-y-4">
        <div>
          <h2 className="font-display text-lg font-medium text-foreground">
            Consentimientos por tipo
          </h2>
          <p className="text-sm text-muted">
            Totales agregados. No se muestran usuarios individuales.
          </p>
        </div>
        {stats.consents.byType.length === 0 ? (
          <p className="text-sm text-muted">Aún no hay registros de consentimiento.</p>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-border">
            <table className="min-w-full text-sm">
              <thead className="bg-sage-light/40 text-left text-muted">
                <tr>
                  <th className="px-4 py-3 font-medium">Tipo</th>
                  <th className="px-4 py-3 font-medium">Activos</th>
                  <th className="px-4 py-3 font-medium">Revocados</th>
                </tr>
              </thead>
              <tbody>
                {stats.consents.byType.map((row) => (
                  <tr key={row.consentType} className="border-t border-border">
                    <td className="px-4 py-3">
                      {consentTypeLabels[row.consentType] ?? row.consentType}
                    </td>
                    <td className="px-4 py-3 tabular-nums">{row.activeGrants}</td>
                    <td className="px-4 py-3 tabular-nums">{row.revoked}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="space-y-4">
        <h2 className="font-display text-lg font-medium text-foreground">
          Consentimientos activos por versión legal
        </h2>
        {stats.consents.byVersion.length === 0 ? (
          <p className="text-sm text-muted">Sin versiones legales registradas.</p>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-border">
            <table className="min-w-full text-sm">
              <thead className="bg-sage-light/40 text-left text-muted">
                <tr>
                  <th className="px-4 py-3 font-medium">Tipo</th>
                  <th className="px-4 py-3 font-medium">Versión</th>
                  <th className="px-4 py-3 font-medium">Activos</th>
                </tr>
              </thead>
              <tbody>
                {stats.consents.byVersion.map((row) => (
                  <tr
                    key={`${row.consentType}-${row.legalVersion}`}
                    className="border-t border-border"
                  >
                    <td className="px-4 py-3">
                      {consentTypeLabels[row.consentType] ?? row.consentType}
                    </td>
                    <td className="px-4 py-3">{row.legalVersion}</td>
                    <td className="px-4 py-3 tabular-nums">{row.activeGrants}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <p className="text-sm text-muted">
        <Link href="/admin" className="font-medium text-sage-strong underline-offset-2 hover:underline">
          ← Volver al panel
        </Link>
      </p>
    </div>
  );
}
