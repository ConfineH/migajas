import Link from "next/link";
import { AppNavBar } from "@/components/AppNavBar";
import { Button } from "@/components/Button";
import { AppPageLayout } from "@/components/layout/AppPageLayout";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatCard } from "@/components/ui/StatCard";
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
  PASS_THRESHOLD,
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
    levels.flatMap((l) =>
      getExercisesForLevel(l.id).map((e) => e.id),
    ),
  );

  return (
    <>
      <AppNavBar />
      <main className="flex flex-1 flex-col">
        <AppPageLayout>
          <PageHeader
            title="Mi progreso"
            description="Curso guiado, niveles aprobados y ejercicios para repasar."
          />

          <div className="mb-8 space-y-3">
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
          </div>

          <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-3">
            <StatCard label="Niveles aprobados" value={`${passed}/5`} />
            <StatCard label="Aciertos totales" value={`${overallAccuracy}%`} />
            <div className="col-span-2 sm:col-span-1">
              <StatCard label="Para repasar" value={allFailed.length} />
            </div>
          </div>

          <section className="space-y-4">
            <h2 className="font-display text-xl font-medium text-foreground">
              Niveles
            </h2>
            {levels.map((level) => {
              const completion = getLevelCompletion(progress, level.id);
              const unlocked = isLevelUnlocked(
                level.orderIndex,
                progress.completions,
                levels,
              );
              const exerciseIds = getExercisesForLevel(level.id).map((e) => e.id);
              const failedIds = getFailedExerciseIds(attempts, exerciseIds);

              return (
                <div
                  key={level.id}
                  className={unlocked ? "feature-card p-5" : "callout-muted p-5"}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-medium text-foreground">
                        {level.name}
                      </h3>
                      {!unlocked ? (
                        <p className="mt-1 text-sm text-muted">Bloqueado</p>
                      ) : null}
                      {completion ? (
                        <p
                          className={`mt-1 text-sm font-medium ${
                            completion.passed
                              ? "text-sage-strong"
                              : "text-terracotta"
                          }`}
                        >
                          {completion.masteryScore}% —{" "}
                          {completion.passed ? "Aprobado" : "No aprobado"} (mín.{" "}
                          {PASS_THRESHOLD}%)
                        </p>
                      ) : null}
                      {!completion && unlocked ? (
                        <p className="mt-1 text-sm text-muted">Sin completar</p>
                      ) : null}
                    </div>
                    {completion?.passed ? (
                      <span className="text-2xl text-sage-strong" aria-label="Aprobado">
                        ✓
                      </span>
                    ) : null}
                  </div>
                  {unlocked ? (
                    <div className="mt-3 flex flex-wrap gap-3">
                      <Link
                        href={`/levels/${level.id}`}
                        className="text-sm font-medium text-sage-strong underline-offset-2 hover:underline"
                      >
                        {completion ? "Repetir" : "Empezar"} →
                      </Link>
                      {failedIds.length > 0 ? (
                        <Link
                          href={`/levels/${level.id}?retry=1`}
                          className="text-sm font-medium text-terracotta underline-offset-2 hover:underline"
                        >
                          Repasar {failedIds.length} error
                          {failedIds.length !== 1 ? "es" : ""}
                        </Link>
                      ) : null}
                    </div>
                  ) : null}
                </div>
              );
            })}
          </section>

          <div className="mt-8 text-center">
            <Button href="/learn">Ir al curso</Button>
          </div>
        </AppPageLayout>
      </main>
    </>
  );
}
