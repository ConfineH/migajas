import { getContentCache } from "@/lib/content-cache";
import { isServiceRoleConfigured } from "@/lib/supabase/service";

export function AdminStatusBanner() {
  const source = getContentCache().source;
  const serviceOk = isServiceRoleConfigured();

  return (
    <div
      className={`mb-6 rounded-xl border px-4 py-3 text-sm ${
        serviceOk
          ? "border-emerald-200 bg-emerald-50 text-emerald-800"
          : "border-amber-200 bg-amber-50 text-amber-900"
      }`}
    >
      <p>
        <strong>Fuente:</strong> {source === "supabase" ? "Supabase" : "JSON local"}
        {" · "}
        <strong>Escritura:</strong>{" "}
        {serviceOk ? "service role configurado" : "falta SUPABASE_SERVICE_ROLE_KEY"}
      </p>
      {!serviceOk ? (
        <p className="mt-1 text-xs">
          Los cambios no se guardarán en producción hasta configurar la clave en
          Vercel.
        </p>
      ) : null}
    </div>
  );
}
