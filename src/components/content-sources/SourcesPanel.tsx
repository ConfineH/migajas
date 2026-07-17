import type { ContentSource } from "@/lib/domain/content-sources";
import {
  EDUCATIONAL_DISCLAIMER,
  groupSourcesByScope,
} from "@/lib/domain/content-sources";

interface SourcesPanelProps {
  sources: ContentSource[];
}

export function SourcesPanel({ sources }: SourcesPanelProps) {
  const grouped = groupSourcesByScope(sources);

  return (
    <section className="space-y-6">
      <div className="rounded-2xl bg-terracotta-soft/30 p-4 text-sm text-foreground">
        {EDUCATIONAL_DISCLAIMER}
      </div>

      {Object.entries(grouped).map(([scopeLabel, scopeSources]) => (
        <div key={scopeLabel} className="space-y-3">
          <h2 className="text-sm font-medium uppercase tracking-wide text-muted">
            {scopeLabel}
          </h2>
          <ul className="space-y-3">
            {scopeSources.map((source) => (
              <li key={source.id} id={source.id} className="feature-card scroll-mt-24 p-4">
                <h3 className="font-medium text-foreground">{source.title}</h3>
                <p className="mt-1 text-sm text-muted">{source.publisher}</p>
                <p className="mt-2 text-sm text-muted">{source.summary}</p>
                {source.url.startsWith("http") ? (
                  <a
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-block text-sm font-medium text-sage-strong underline-offset-2 hover:underline"
                  >
                    Consultar fuente ↗
                  </a>
                ) : (
                  <p className="mt-3 text-sm font-medium text-sage-strong">
                    Documentado en esta guía
                  </p>
                )}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </section>
  );
}
