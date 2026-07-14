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
      <div className="rounded-2xl border border-gray-200 bg-gray-50 p-6 opacity-75">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-gray-500">{name}</h2>
            <p className="mt-2 text-sm text-gray-400">{description}</p>
          </div>
          <StatusBadge variant="locked">Bloqueado</StatusBadge>
        </div>
        <p className="mt-4 text-sm text-gray-400">
          Completa el nivel anterior con ≥60% para desbloquear.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-gray-900">{name}</h2>
          <p className="mt-2 text-sm text-gray-600">{description}</p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1">
          <StatusBadge variant="muted">{exerciseCount} ejercicios</StatusBadge>
          {completion && (
            <StatusBadge variant={completion.passed ? "success" : "warning"}>
              {completion.masteryScore}%
            </StatusBadge>
          )}
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-3">
        <Link
          href={`/levels/${id}`}
          className="text-sm font-semibold text-emerald-600 hover:text-emerald-700"
        >
          {completion ? "Repetir" : "Practicar"} →
        </Link>
        {failedCount > 0 && (
          <Link
            href={`/levels/${id}?retry=1`}
            className="text-sm font-semibold text-amber-600 hover:text-amber-700"
          >
            Repasar {failedCount} error{failedCount !== 1 ? "es" : ""}
          </Link>
        )}
      </div>
    </div>
  );
}
