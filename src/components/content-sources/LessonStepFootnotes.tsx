import { ContentSourceLink } from "@/components/content-sources/ContentSourceLink";
import { resolveStepSourceIds } from "@/lib/domain/content-sources";

interface LessonStepFootnotesProps {
  step: {
    sourceIds?: string[];
    title?: string;
    body?: string;
  };
}

export function LessonStepFootnotes({ step }: LessonStepFootnotesProps) {
  const sourceIds = resolveStepSourceIds(step);
  if (sourceIds.length === 0) return null;

  return (
    <p className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-1 border-t border-border pt-3 text-xs text-muted">
      <span>Fuentes:</span>
      {sourceIds.map((sourceId, index) => (
        <span key={sourceId} className="inline-flex items-center gap-2">
          {index > 0 ? <span aria-hidden="true">·</span> : null}
          <ContentSourceLink sourceId={sourceId} compact />
        </span>
      ))}
    </p>
  );
}
