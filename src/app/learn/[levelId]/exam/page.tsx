import { notFound, redirect } from "next/navigation";
import { AppNavBar } from "@/components/AppNavBar";
import { ExamRunner } from "@/components/ExamRunner";
import { Button } from "@/components/Button";
import { getExamForLevel } from "@/lib/domain/lessons";
import { getExerciseById, getLevelById, getLevels } from "@/lib/domain/exercises";
import { resolveProgress } from "@/lib/learning-state";
import {
  toGuidedProgress,
  canStartExam,
  isGuidedLevelUnlocked,
} from "@/lib/domain/guided-flow";

interface Props {
  params: Promise<{ levelId: string }>;
}

export default async function ExamPage({ params }: Props) {
  const { levelId } = await params;
  const level = getLevelById(levelId);
  if (!level) notFound();

  const stored = await resolveProgress();
  const progress = toGuidedProgress(stored);
  const levels = getLevels();

  if (!isGuidedLevelUnlocked(levelId, progress, levels)) {
    redirect("/learn");
  }

  if (!canStartExam(progress, levelId)) {
    return (
      <>
        <AppNavBar />
        <main className="mx-auto max-w-3xl flex-1 px-4 py-12 text-center">
          <p className="text-4xl">📚</p>
          <h1 className="mt-4 text-xl font-bold">Completa el curso primero</h1>
          <p className="mt-2 text-gray-600">
            Termina todas las lecciones y prácticas antes del examen.
          </p>
          <div className="mt-6">
            <Button href={`/learn/${levelId}`}>Volver al nivel</Button>
          </div>
        </main>
      </>
    );
  }

  const exam = getExamForLevel(levelId);
  if (!exam) redirect(`/learn/${levelId}`);

  const exercises = exam.exerciseIds
    .map((id) => getExerciseById(id))
    .filter((e): e is NonNullable<typeof e> => !!e);

  const nextLevel = levels.find((l) => l.orderIndex === level.orderIndex + 1);

  return (
    <>
      <AppNavBar />
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
          nextLevelId={nextLevel?.id}
        />
      </main>
    </>
  );
}
