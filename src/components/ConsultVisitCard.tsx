import { CONSULT_VISIT_COPY } from "@/lib/domain/professional-cycle";

export function ConsultVisitCard({ body }: { body: string }) {
  return (
    <aside className="callout-sage">
      <h2 className="font-display text-lg font-medium text-foreground">
        {CONSULT_VISIT_COPY.title}
      </h2>
      <p className="mt-2 text-pretty text-sm leading-relaxed text-muted">
        {body}
      </p>
    </aside>
  );
}
