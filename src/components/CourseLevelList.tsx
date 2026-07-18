import Link from "next/link";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { localizeLevel } from "@/lib/domain/content-localization";
import type { RegionProfile } from "@/lib/domain/regions";
import {
  getLessonProgressPercent,
  isGuidedLevelUnlocked,
  type GuidedProgress,
} from "@/lib/domain/guided-flow";
import { getLevels } from "@/lib/domain/exercises";
import { getLessonsForLevel } from "@/lib/domain/lessons";

interface CourseLevelListProps {
  progress: GuidedProgress;
  region: RegionProfile;
}

export function CourseLevelList({ progress, region }: CourseLevelListProps) {
  const levels = getLevels().map((level) => localizeLevel(level, region));

  return (
    <div className="space-y-4">
      {levels.map((level) => {
        const unlocked = isGuidedLevelUnlocked(level.id, progress, levels);
        const pct = getLessonProgressPercent(progress, level.id);
        const completion = progress.levelCompletions.find(
          (c) => c.levelId === level.id,
        );
        const lessonCount = getLessonsForLevel(level.id).length;

        if (!unlocked) {
          return (
            <div key={level.id} className="callout-muted">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="font-display text-lg font-medium text-muted">
                    {level.name}
                  </h2>
                  <p className="mt-1 text-sm text-muted/80">{level.description}</p>
                </div>
                <StatusBadge variant="locked">Bloqueado</StatusBadge>
              </div>
              <p className="mt-3 text-sm text-muted/80">
                Aprueba el examen del nivel anterior para continuar.
              </p>
            </div>
          );
        }

        return (
          <Link
            key={level.id}
            href={`/learn/${level.id}`}
            className="card-interactive"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="font-display text-lg font-medium text-foreground">
                  {level.name}
                </h2>
                <p className="mt-1 text-pretty text-sm text-muted">
                  {level.description}
                </p>
                <p className="mt-2 text-xs text-muted/80">
                  {lessonCount} lecciones · {pct}% completado
                </p>
              </div>
              {completion?.passed ? (
                <StatusBadge variant="success">
                  ✓ {completion.masteryScore}%
                </StatusBadge>
              ) : (
                <span className="shrink-0 text-sm font-medium text-sage-strong">
                  Entrar →
                </span>
              )}
            </div>
            <ProgressBar percent={pct} className="mt-4" />
          </Link>
        );
      })}
    </div>
  );
}
