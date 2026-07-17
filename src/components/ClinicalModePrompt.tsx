import Link from "next/link";
import { Button } from "@/components/Button";

export function ClinicalModePrompt() {
  return (
    <div className="callout-sage mb-6">
      <p className="font-semibold text-foreground">Modo clínico disponible</p>
      <p className="mt-1 text-pretty text-sm text-muted">
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
    <div className="hero-pill p-8 text-center">
      <p className="text-4xl" aria-hidden>
        📓
      </p>
      <h1 className="mt-4 font-display text-xl font-medium text-foreground">
        {title}
      </h1>
      <p className="mt-2 text-pretty text-muted">{description}</p>
      {actionHref && actionLabel ? (
        <div className="mt-6">
          <Link href={actionHref} className="btn-terracotta inline-flex items-center rounded-full px-6 py-2.5 font-medium">
            {actionLabel}
          </Link>
        </div>
      ) : null}
    </div>
  );
}
