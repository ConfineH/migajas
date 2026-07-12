import Link from "next/link";
import { NavBar } from "@/components/NavBar";
import { Button } from "@/components/Button";
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
import { getStoredProgress } from "@/lib/progress-storage";
import { getStoredAttempts } from "@/lib/attempts-storage";

export const metadata = {
  title: "Mi progreso — Migajas",
};

export default async function ProgressPage() {
  const progress = await getStoredProgress();
  const attempts = await getStoredAttempts();
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
      <NavBar />
      <main className="mx-auto max-w-3xl flex-1 px-4 py-8">
        <header className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Mi progreso</h1>
          <p className="mt-2 text-gray-600">
            Niveles completados, tasa de acierto y ejercicios para repasar.
          </p>
        </header>

        <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-emerald-100 bg-white p-4 text-center">
            <p className="text-3xl font-bold text-emerald-700">{passed}/5</p>
            <p className="mt-1 text-sm text-gray-500">Niveles aprobados</p>
          </div>
          <div className="rounded-2xl border border-emerald-100 bg-white p-4 text-center">
            <p className="text-3xl font-bold text-emerald-700">
              {overallAccuracy}%
            </p>
            <p className="mt-1 text-sm text-gray-500">Aciertos totales</p>
          </div>
          <div className="col-span-2 rounded-2xl border border-amber-100 bg-amber-50 p-4 text-center sm:col-span-1">
            <p className="text-3xl font-bold text-amber-700">
              {allFailed.length}
            </p>
            <p className="mt-1 text-sm text-gray-500">Para repasar</p>
          </div>
        </div>

        <section className="space-y-4">
          <h2 className="text-lg font-bold text-gray-900">Niveles</h2>
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
                className={`rounded-2xl border p-5 ${
                  unlocked
                    ? "border-emerald-100 bg-white"
                    : "border-gray-200 bg-gray-50"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {level.name}
                    </h3>
                    {!unlocked && (
                      <p className="mt-1 text-sm text-gray-400">Bloqueado</p>
                    )}
                    {completion && (
                      <p
                        className={`mt-1 text-sm font-medium ${
                          completion.passed
                            ? "text-emerald-600"
                            : "text-amber-600"
                        }`}
                      >
                        {completion.masteryScore}% —{" "}
                        {completion.passed ? "Aprobado" : "No aprobado"} (mín.{" "}
                        {PASS_THRESHOLD}%)
                      </p>
                    )}
                    {!completion && unlocked && (
                      <p className="mt-1 text-sm text-gray-500">
                        Sin completar
                      </p>
                    )}
                  </div>
                  {completion?.passed && (
                    <span className="text-2xl" aria-label="Aprobado">
                      ✓
                    </span>
                  )}
                </div>
                {unlocked && (
                  <div className="mt-3 flex flex-wrap gap-3">
                    <Link
                      href={`/levels/${level.id}`}
                      className="text-sm font-semibold text-emerald-600"
                    >
                      {completion ? "Repetir" : "Empezar"} →
                    </Link>
                    {failedIds.length > 0 && (
                      <Link
                        href={`/levels/${level.id}?retry=1`}
                        className="text-sm font-semibold text-amber-600"
                      >
                        Repasar {failedIds.length} error
                        {failedIds.length !== 1 ? "es" : ""}
                      </Link>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </section>

        <div className="mt-8 text-center">
          <Button href="/levels">Ir a practicar</Button>
        </div>
      </main>
    </>
  );
}
