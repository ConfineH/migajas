import Link from "next/link";
import { Button } from "@/components/Button";

export function ClinicalModePrompt() {
  return (
    <div className="mb-6 rounded-2xl border border-sky-200 bg-sky-50 p-5">
      <p className="font-semibold text-sky-900">Modo clínico disponible</p>
      <p className="mt-1 text-sm text-sky-800">
        Ya aprobaste el nivel 3. Puedes activar el diario de ingesta para llevar
        un registro de carbohidratos y preparar reportes para tu equipo de salud.
      </p>
      <div className="mt-4">
        <Button href="/onboarding" variant="secondary">
          Activar en Configuración
        </Button>
      </div>
    </div>
  );
}

export function ClinicalAccessMessage({
  title,
  description,
  actionHref,
  actionLabel,
}: {
  title: string;
  description: string;
  actionHref?: string;
  actionLabel?: string;
}) {
  return (
    <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-center">
      <p className="text-4xl">📓</p>
      <h1 className="mt-4 text-xl font-bold text-gray-900">{title}</h1>
      <p className="mt-2 text-gray-600">{description}</p>
      {actionHref && actionLabel ? (
        <div className="mt-6">
          <Link
            href={actionHref}
            className="inline-flex items-center rounded-xl bg-emerald-600 px-4 py-2 font-medium text-white hover:bg-emerald-700"
          >
            {actionLabel}
          </Link>
        </div>
      ) : null}
    </div>
  );
}
