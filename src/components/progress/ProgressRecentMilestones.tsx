import Link from "next/link";
import type { TimelineEntry } from "@/lib/domain/analytics-dashboard";

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("es-ES", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(iso));
}

export function ProgressRecentMilestones({
  timeline,
  signedIn,
}: {
  timeline: TimelineEntry[];
  signedIn: boolean;
}) {
  return (
    <section className="space-y-3">
      <h2 className="font-display text-xl font-medium text-foreground">
        Hitos recientes
      </h2>
      {!signedIn ? (
        <p className="rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted">
          <Link
            href="/login?next=/progress"
            className="font-medium text-sage-strong underline-offset-2 hover:underline"
          >
            Inicia sesión
          </Link>{" "}
          para guardar y ver el historial de lecciones y exámenes.
        </p>
      ) : timeline.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted">
          Aún no hay hitos registrados. Completa lecciones en{" "}
          <Link
            href="/learn"
            className="font-medium text-sage-strong underline-offset-2 hover:underline"
          >
            el curso
          </Link>{" "}
          para verlos aquí.
        </p>
      ) : (
        <ul className="space-y-2">
          {timeline.map((entry) => (
            <li
              key={`${entry.eventType}-${entry.createdAt}`}
              className="feature-card flex items-start justify-between gap-4 px-4 py-3 text-sm"
            >
              <span className="text-foreground">{entry.label}</span>
              <time
                className="shrink-0 text-xs text-muted"
                dateTime={entry.createdAt}
              >
                {formatDate(entry.createdAt)}
              </time>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
