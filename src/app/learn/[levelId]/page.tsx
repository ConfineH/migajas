import { notFound } from "next/navigation";
import Link from "next/link";
import { AppNavBar } from "@/components/AppNavBar";
import { GuidedPathList } from "@/components/GuidedPathList";
import { Button } from "@/components/Button";
import { getStoredProgress } from "@/lib/progress-storage";
import {
  toGuidedProgress,
  getLessonProgressPercent,
  getNextGuidedItem,
  isGuidedLevelUnlocked,
} from "@/lib/domain/guided-flow";
import { getLevelById, getLevels } from "@/lib/domain/exercises";

interface Props {
  params: Promise<{ levelId: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { levelId } = await params;
  const level = getLevelById(levelId);
  return { title: level ? `${level.name} — Curso` : "Curso — Migajas" };
}

export default async function LearnLevelPage({ params }: Props) {
  const { levelId } = await params;
  const level = getLevelById(levelId);
  if (!level) notFound();

  const stored = await getStoredProgress();
  const progress = toGuidedProgress(stored);
  const levels = getLevels();

  if (!isGuidedLevelUnlocked(levelId, progress, levels)) {
    return (
      <>
        <AppNavBar />
        <main className="mx-auto max-w-3xl flex-1 px-4 py-12 text-center">
          <p className="text-4xl">🔒</p>
          <h1 className="mt-4 text-xl font-bold">Nivel bloqueado</h1>
          <p className="mt-2 text-gray-600">
            Aprueba el examen del nivel anterior para acceder a{" "}
            <strong>{level.name}</strong>.
          </p>
          <div className="mt-6">
            <Button href="/learn">Volver al curso</Button>
          </div>
        </main>
      </>
    );
  }

  const pct = getLessonProgressPercent(progress, levelId);
  const next = getNextGuidedItem(progress, levelId);

  return (
    <>
      <AppNavBar />
      <main className="mx-auto max-w-3xl flex-1 px-4 py-8">
        <header className="mb-8">
          <Link href="/learn" className="text-sm text-emerald-600 hover:underline">
            ← Todos los niveles
          </Link>
          <h1 className="mt-2 text-2xl font-bold text-gray-900">{level.name}</h1>
          <p className="mt-2 text-gray-600">{level.description}</p>
          <div className="mt-4">
            <div className="mb-1 flex justify-between text-sm text-gray-500">
              <span>Progreso</span>
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
