"use client";

import Link from "next/link";
import StaggeredList from "@/components/react-bits/StaggeredList";
import { PASS_THRESHOLD } from "@/lib/domain/progress";

export type ProgressLevelItem = {
  id: string;
  name: string;
  unlocked: boolean;
  masteryScore?: number;
  passed?: boolean;
  failedCount: number;
  hasCompletion: boolean;
};

export function ProgressLevelsList({ levels }: { levels: ProgressLevelItem[] }) {
  return (
    <StaggeredList className="space-y-4">
      {levels.map((level) => (
        <div
          key={level.id}
          className={level.unlocked ? "feature-card p-5" : "callout-muted p-5"}
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="font-medium text-foreground">{level.name}</h3>
              {!level.unlocked ? (
                <p className="mt-1 text-sm text-muted">Bloqueado</p>
              ) : null}
              {level.hasCompletion ? (
                <p
                  className={`mt-1 text-sm font-medium ${
                    level.passed ? "text-sage-strong" : "text-terracotta"
                  }`}
                >
                  {level.masteryScore}% —{" "}
                  {level.passed ? "Aprobado" : "No aprobado"} (mín.{" "}
                  {PASS_THRESHOLD}%)
                </p>
              ) : null}
              {!level.hasCompletion && level.unlocked ? (
                <p className="mt-1 text-sm text-muted">Sin completar</p>
              ) : null}
            </div>
            {level.passed ? (
              <span className="text-2xl text-sage-strong" aria-label="Aprobado">
                ✓
              </span>
            ) : null}
          </div>
          {level.unlocked ? (
            <div className="mt-3 flex flex-wrap gap-3">
              <Link
                href={`/levels/${level.id}`}
                className="text-sm font-medium text-sage-strong underline-offset-2 hover:underline"
              >
                {level.hasCompletion ? "Repetir" : "Empezar"} →
              </Link>
              {level.failedCount > 0 ? (
                <Link
                  href={`/levels/${level.id}?retry=1`}
                  className="text-sm font-medium text-terracotta underline-offset-2 hover:underline"
                >
                  Repasar {level.failedCount} error
                  {level.failedCount !== 1 ? "es" : ""}
                </Link>
              ) : null}
            </div>
          ) : null}
        </div>
      ))}
    </StaggeredList>
  );
}
