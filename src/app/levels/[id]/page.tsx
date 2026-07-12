import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { AppNavBar } from "@/components/AppNavBar";
import { ExerciseRunner } from "@/components/ExerciseRunner";
import { Button } from "@/components/Button";
import {
  getLevelById,
  getExercisesForLevel,
  getLevels,
} from "@/lib/domain/exercises";
import { isLevelUnlocked, getFailedExerciseIds } from "@/lib/domain/progress";
import { getStoredProgress } from "@/lib/progress-storage";
import { getStoredAttempts } from "@/lib/attempts-storage";
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

  const progress = await getStoredProgress();
  const attempts = await getStoredAttempts();
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
        <main className="mx-auto max-w-3xl flex-1 px-4 py-12 text-center">
          <div className="rounded-2xl border border-gray-200 bg-gray-50 p-8">
            <p className="text-4xl">🔒</p>
            <h1 className="mt-4 text-xl font-bold text-gray-900">
              Nivel bloqueado
            </h1>
            <p className="mt-2 text-gray-600">
              Completa el nivel anterior con al menos 60% de aciertos para
              desbloquear <strong>{level.name}</strong>.
            </p>
            <div className="mt-6">
              <Button href="/levels">Volver a niveles</Button>
            </div>
          </div>
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
      <main className="mx-auto max-w-3xl flex-1 px-4 py-8">
        <header className="mb-8">
          <p className="text-sm font-medium text-emerald-600">
            {level.country}
          </p>
          <h1 className="text-2xl font-bold text-gray-900">{level.name}</h1>
          <p className="mt-2 text-gray-600">{level.description}</p>
          {!retryMode && (
            <Link
              href="/progress"
              className="mt-2 inline-block text-sm text-emerald-600 hover:underline"
            >
              Ver mi progreso →
            </Link>
          )}
        </header>
        <ExerciseRunner
          exercises={exercises}
          levelId={id}
          levelName={level.name}
          retryMode={retryMode}
        />
      </main>
    </>
  );
}
