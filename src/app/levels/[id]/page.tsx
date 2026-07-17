import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { AppNavBar } from "@/components/AppNavBar";
import { ExerciseRunner } from "@/components/ExerciseRunner";
import { Button } from "@/components/Button";
import { AppPageLayout } from "@/components/layout/AppPageLayout";
import { LearnSectionHeader } from "@/components/layout/LearnSectionHeader";
import {
  getLevelById,
  getExercisesForLevel,
  getLevels,
} from "@/lib/domain/exercises";
import { isLevelUnlocked, getFailedExerciseIds } from "@/lib/domain/progress";
import { resolveAttempts, resolveProgress } from "@/lib/learning-state";
import { requireFreeMode } from "@/lib/free-mode";

interface LevelPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ retry?: string }>;
}

export async function generateMetadata({ params }: LevelPageProps) {
  const { id } = await params;
  const level = getLevelById(id);
  return { title: level ? `${level.name} — Migajas` : "Nivel — Migajas" };
}

export default async function LevelPage({
  params,
  searchParams,
}: LevelPageProps) {
  await requireFreeMode();
  const { id } = await params;
  const { retry } = await searchParams;
  const retryMode = retry === "1";

  const level = getLevelById(id);
  if (!level) notFound();

  const progress = await resolveProgress();
  const attempts = await resolveAttempts();
  const levels = getLevels();

  const unlocked = isLevelUnlocked(
    level.orderIndex,
    progress.completions,
    levels,
  );

  if (!unlocked) {
    return (
      <>
        <AppNavBar />
        <main className="flex flex-1 flex-col">
          <AppPageLayout className="py-12 text-center">
            <div className="hero-pill p-8">
              <p className="text-4xl" aria-hidden>
                🔒
              </p>
              <h1 className="mt-4 font-display text-xl font-medium text-foreground">
                Nivel bloqueado
              </h1>
              <p className="mt-2 text-muted">
                Completa el nivel anterior con al menos 60% de aciertos para
                desbloquear <strong>{level.name}</strong>.
              </p>
              <div className="mt-6">
                <Button href="/levels">Volver a niveles</Button>
              </div>
            </div>
          </AppPageLayout>
        </main>
      </>
    );
  }

  let exercises = getExercisesForLevel(id);
  if (exercises.length === 0) notFound();

  if (retryMode) {
    const failedIds = getFailedExerciseIds(
      attempts,
      exercises.map((e) => e.id),
    );
    if (failedIds.length === 0) {
      redirect(`/levels/${id}`);
    }
    exercises = exercises.filter((e) => failedIds.includes(e.id));
  }

  return (
    <>
      <AppNavBar />
      <main className="flex flex-1 flex-col">
        <AppPageLayout>
          <LearnSectionHeader
            backHref="/levels"
            backLabel="Volver a practicar"
            eyebrow={level.country}
            title={level.name}
            description={level.description}
          />
          {!retryMode ? (
            <Link
              href="/progress"
              className="-mt-4 mb-6 inline-block text-sm font-medium text-sage-strong underline-offset-2 hover:underline"
            >
              Ver mi progreso →
            </Link>
          ) : null}
          <ExerciseRunner
            exercises={exercises}
            levelId={id}
            levelName={level.name}
            retryMode={retryMode}
          />
        </AppPageLayout>
      </main>
    </>
  );
}
