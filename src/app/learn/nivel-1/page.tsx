import { NavBar } from "@/components/NavBar";
import { GuidedPathList } from "@/components/GuidedPathList";
import { getStoredProgress } from "@/lib/progress-storage";
import {
  toGuidedProgress,
  getLessonProgressPercent,
  isFreeModeUnlocked,
  getNextGuidedItem,
} from "@/lib/domain/guided-flow";
import { getLevelById } from "@/lib/domain/exercises";
import { Button } from "@/components/Button";
import Link from "next/link";

export const metadata = {
  title: "Curso guiado — Migajas",
};

export default async function LearnLevelPage() {
  const levelId = "nivel-1";
  const stored = await getStoredProgress();
  const progress = toGuidedProgress(stored);
  const level = getLevelById(levelId)!;
  const pct = getLessonProgressPercent(progress, levelId);
  const next = getNextGuidedItem(progress, levelId);
  const freeMode = isFreeModeUnlocked(progress);

  return (
    <>
      <NavBar freeMode={freeMode} />
      <main className="mx-auto max-w-3xl flex-1 px-4 py-8">
        <header className="mb-8">
          <p className="text-sm font-medium text-emerald-600">Curso guiado</p>
          <h1 className="text-2xl font-bold text-gray-900">{level.name}</h1>
          <p className="mt-2 text-gray-600">{level.description}</p>
          <div className="mt-4">
            <div className="mb-1 flex justify-between text-sm text-gray-500">
              <span>Progreso del curso</span>
              <span>{pct}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-gray-100">
              <div
                className="h-full rounded-full bg-emerald-500 transition-all"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        </header>

        {freeMode && (
          <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
            <p className="font-semibold text-emerald-800">
              ¡Modo libre desbloqueado!
            </p>
            <p className="mt-1 text-sm text-emerald-700">
              Ya puedes usar el catálogo y practicar libremente.
            </p>
            <div className="mt-3 flex gap-3">
              <Link href="/catalog" className="text-sm font-semibold text-emerald-600">
                Catálogo →
              </Link>
              <Link href="/levels" className="text-sm font-semibold text-emerald-600">
                Práctica libre →
              </Link>
            </div>
          </div>
        )}

        <GuidedPathList levelId={levelId} progress={progress} />

        {next && (
          <div className="mt-8 text-center">
            <Button
              href={
                next.type === "lesson"
                  ? `/learn/${levelId}/lessons/${next.id}`
                  : next.type === "practice"
                    ? `/learn/${levelId}/practice/${next.id}`
                    : `/learn/${levelId}/exam`
              }
            >
              Continuar donde lo dejé
            </Button>
          </div>
        )}
      </main>
    </>
  );
}
