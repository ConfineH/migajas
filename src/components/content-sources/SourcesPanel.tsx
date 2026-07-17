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
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
        {EDUCATIONAL_DISCLAIMER}
      </div>

      {Object.entries(grouped).map(([scopeLabel, scopeSources]) => (
        <div key={scopeLabel} className="space-y-3">
          <h2 className="text-sm font-bold uppercase tracking-wide text-gray-500">
            {scopeLabel}
          </h2>
          <ul className="space-y-3">
            {scopeSources.map((source) => (
              <li
                key={source.id}
                id={source.id}
                className="scroll-mt-24 rounded-2xl border border-gray-100 bg-white p-4"
              >
                <h3 className="font-semibold text-gray-900">{source.title}</h3>
                <p className="mt-1 text-sm text-gray-500">{source.publisher}</p>
                <p className="mt-2 text-sm text-gray-700">{source.summary}</p>
                {source.url.startsWith("http") ? (
                  <a
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-block text-sm font-semibold text-emerald-700 hover:text-emerald-900"
                  >
                    Consultar fuente ↗
                  </a>
                ) : (
                  <p className="mt-3 text-sm font-medium text-emerald-700">
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
