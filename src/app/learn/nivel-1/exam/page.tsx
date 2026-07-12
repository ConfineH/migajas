import { redirect } from "next/navigation";
import { NavBar } from "@/components/NavBar";
import { ExamRunner } from "@/components/ExamRunner";
import { getExamForLevel } from "@/lib/domain/lessons";
import { getExerciseById } from "@/lib/domain/exercises";
import { getStoredProgress } from "@/lib/progress-storage";
import {
  toGuidedProgress,
  canStartExam,
  isFreeModeUnlocked,
} from "@/lib/domain/guided-flow";
import { getLevelById } from "@/lib/domain/exercises";
import { Button } from "@/components/Button";

export const metadata = {
  title: "Examen Nivel 1 — Migajas",
};

export default async function ExamPage() {
  const levelId = "nivel-1";
  const stored = await getStoredProgress();
  const progress = toGuidedProgress(stored);
  const freeMode = isFreeModeUnlocked(progress);

  if (!canStartExam(progress, levelId)) {
    return (
      <>
        <NavBar freeMode={freeMode} />
        <main className="mx-auto max-w-3xl flex-1 px-4 py-12 text-center">
          <p className="text-4xl">📚</p>
          <h1 className="mt-4 text-xl font-bold">Aún no puedes hacer el examen</h1>
          <p className="mt-2 text-gray-600">
            Completa todas las lecciones y prácticas antes del examen.
          </p>
          <div className="mt-6">
            <Button href="/learn/nivel-1">Volver al curso</Button>
          </div>
        </main>
      </>
    );
  }

  const exam = getExamForLevel(levelId);
  if (!exam) redirect("/learn/nivel-1");

  const exercises = exam.exerciseIds
    .map((id) => getExerciseById(id))
    .filter((e): e is NonNullable<typeof e> => !!e);

  const level = getLevelById(levelId)!;

  return (
    <>
      <NavBar freeMode={freeMode} />
      <main className="mx-auto max-w-3xl flex-1 px-4 py-8">
        <header className="mb-8">
          <p className="text-sm font-medium text-amber-600">Examen de nivel</p>
          <h1 className="text-2xl font-bold text-gray-900">{exam.title}</h1>
          <p className="mt-2 text-gray-600">{exam.description}</p>
        </header>
        <ExamRunner
          exercises={exercises}
          levelId={levelId}
          levelName={level.name}
        />
      </main>
    </>
  );
}
