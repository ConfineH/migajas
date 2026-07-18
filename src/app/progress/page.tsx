import Link from "next/link";
import { AppNavBar } from "@/components/AppNavBar";
import { Button } from "@/components/Button";
import { AppPageLayout } from "@/components/layout/AppPageLayout";
import { ProgressAnimatedSection } from "@/components/progress/ProgressAnimated";
import { ProgressLevelsList } from "@/components/progress/ProgressLevelsList";
import { ProgressStats } from "@/components/progress/ProgressStats";
import { PageHeader } from "@/components/ui/PageHeader";
import { LevelProgressCard } from "@/components/ui/LevelProgressCard";
import {
  getLevels,
  getExercisesForLevel,
} from "@/lib/domain/exercises";
import {
  isLevelUnlocked,
  getLevelCompletion,
  getFailedExerciseIds,
  countPassedLevels,
} from "@/lib/domain/progress";
import { accuracyRate } from "@/lib/domain/attempts";
import { resolveAttempts, resolveProgress } from "@/lib/learning-state";
import {
  toGuidedProgress,
  getLessonProgressPercent,
} from "@/lib/domain/guided-flow";

export const metadata = {
  title: "Mi progreso — Migajas",
};

export default async function ProgressPage() {
  const progress = await resolveProgress();
  const attempts = await resolveAttempts();
  const guided = toGuidedProgress(progress);
  const levels = getLevels();
  const passed = countPassedLevels(progress);
  const overallAccuracy = accuracyRate(attempts);

  const allFailed = getFailedExerciseIds(
    attempts,
    levels.flatMap((l) => getExercisesForLevel(l.id).map((e) => e.id)),
  );

  const levelItems = levels.map((level) => {
    const completion = getLevelCompletion(progress, level.id);
    const unlocked = isLevelUnlocked(
      level.orderIndex,
      progress.completions,
      levels,
    );
    const exerciseIds = getExercisesForLevel(level.id).map((e) => e.id);
    const failedIds = getFailedExerciseIds(attempts, exerciseIds);

    return {
      id: level.id,
      name: level.name,
      unlocked,
      masteryScore: completion?.masteryScore,
      passed: completion?.passed,
      failedCount: failedIds.length,
      hasCompletion: Boolean(completion),
    };
  });

  return (
    <>
      <AppNavBar />
      <main className="flex flex-1 flex-col">
        <AppPageLayout>
          <PageHeader
            title="Mi progreso"
            description="Curso guiado, niveles aprobados y ejercicios para repasar."
          />

          <ProgressAnimatedSection className="mb-8 space-y-3">
            <h2 className="font-display text-xl font-medium text-foreground">
              Curso guiado
            </h2>
            {levels.map((level) => {
              const pct = getLessonProgressPercent(guided, level.id);
              const completion = getLevelCompletion(progress, level.id);
              return (
                <LevelProgressCard
                  key={level.id}
                  title={level.name}
                  percent={pct}
                  subtitle={
                    completion
                      ? `Examen: ${completion.masteryScore}% ${completion.passed ? "✓" : "(no aprobado)"}`
                      : undefined
                  }
                />
              );
            })}
            <Link
              href="/learn"
              className="inline-block text-sm font-medium text-sage-strong underline-offset-2 hover:underline"
            >
              Ir al curso →
            </Link>
          </ProgressAnimatedSection>

          <ProgressAnimatedSection delay={0.05}>
            <ProgressStats
              passed={passed}
              totalLevels={levels.length}
              accuracy={overallAccuracy}
              reviewCount={allFailed.length}
            />
          </ProgressAnimatedSection>

          <ProgressAnimatedSection className="space-y-4" delay={0.1}>
            <h2 className="font-display text-xl font-medium text-foreground">
              Niveles
            </h2>
            <ProgressLevelsList levels={levelItems} />
          </ProgressAnimatedSection>

          <div className="mt-8 text-center">
            <Button href="/learn">Ir al curso</Button>
          </div>
        </AppPageLayout>
      </main>
    </>
  );
}
