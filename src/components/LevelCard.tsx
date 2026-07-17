import Link from "next/link";
import type { LevelCompletion } from "@/lib/domain/progress";
import { StatusBadge } from "@/components/ui/StatusBadge";

export function LevelCard({
  id,
  name,
  description,
  exerciseCount,
  unlocked,
  completion,
  failedCount,
}: {
  id: string;
  name: string;
  description: string;
  exerciseCount: number;
  unlocked: boolean;
  completion?: LevelCompletion;
  failedCount: number;
}) {
  if (!unlocked) {
    return (
      <div className="callout-muted">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="font-display text-lg font-medium text-muted">
              {name}
            </h2>
            <p className="mt-2 text-sm text-muted/80">{description}</p>
          </div>
          <StatusBadge variant="locked">Bloqueado</StatusBadge>
        </div>
        <p className="mt-4 text-sm text-muted/80">
          Completa el nivel anterior con ≥60% para desbloquear.
        </p>
      </div>
    );
  }

  return (
    <div className="feature-card p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="font-display text-lg font-medium text-foreground">
            {name}
          </h2>
          <p className="mt-2 text-pretty text-sm text-muted">{description}</p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1">
          <StatusBadge variant="muted">{exerciseCount} ejercicios</StatusBadge>
          {completion ? (
            <StatusBadge variant={completion.passed ? "success" : "warning"}>
              {completion.masteryScore}%
            </StatusBadge>
          ) : null}
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-3">
        <Link
          href={`/levels/${id}`}
          className="text-sm font-medium text-sage-strong underline-offset-2 hover:underline"
        >
          {completion ? "Repetir" : "Practicar"} →
        </Link>
        {failedCount > 0 ? (
          <Link
            href={`/levels/${id}?retry=1`}
            className="text-sm font-medium text-terracotta underline-offset-2 hover:underline"
          >
            Repasar {failedCount} error{failedCount !== 1 ? "es" : ""}
          </Link>
        ) : null}
      </div>
    </div>
  );
}
