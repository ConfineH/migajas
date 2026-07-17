import { getContentCache } from "@/lib/content-cache";
import { isServiceRoleConfigured } from "@/lib/supabase/service";

export function AdminStatusBanner() {
  const source = getContentCache().source;
  const serviceOk = isServiceRoleConfigured();

  return (
    <div
      className={`mb-6 rounded-2xl px-4 py-3 text-sm ${
        serviceOk
          ? "callout-sage text-foreground"
          : "bg-terracotta-soft/30 text-foreground"
      }`}
    >
      <p>
        <strong>Fuente:</strong> {source === "supabase" ? "Supabase" : "JSON local"}
        {" · "}
        <strong>Escritura:</strong>{" "}
        {serviceOk ? "service role configurado" : "falta SUPABASE_SERVICE_ROLE_KEY"}
      </p>
      {!serviceOk ? (
        <p className="mt-1 text-xs text-muted">
          Los cambios no se guardarán en producción hasta configurar la clave en
          Vercel.
        </p>
      ) : null}
    </div>
  );
}
