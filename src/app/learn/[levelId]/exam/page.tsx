import { notFound, redirect } from "next/navigation";
import { AppNavBar } from "@/components/AppNavBar";
import { ExamRunner } from "@/components/ExamRunner";
import { Button } from "@/components/Button";
import { getExamForLevel } from "@/lib/domain/lessons";
import { getExerciseById, getLevelById, getLevels } from "@/lib/domain/exercises";
import { getRegionalContentContext } from "@/lib/content-for-region";
import { localizeExercise } from "@/lib/domain/content-localization";
import { persistProgress, resolveProgress } from "@/lib/learning-state";
import {
  toGuidedProgress,
  canStartExam,
  isGuidedLevelUnlocked,
} from "@/lib/domain/guided-flow";
import {
  buildExamSession,
  getResumableExamSession,
  normalizeExamConfig,
  upsertExamSession,
} from "@/lib/domain/exam-session";

interface Props {
  params: Promise<{ levelId: string }>;
  searchParams: Promise<{ nuevo?: string }>;
}

export default async function ExamPage({ params, searchParams }: Props) {
  const { levelId } = await params;
  const { nuevo } = await searchParams;
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

  const config = normalizeExamConfig(exam);
  const forceNew = nuevo === "1";
  let userProgress = await resolveProgress();

  let session = forceNew
    ? null
    : getResumableExamSession(userProgress.activeExamSessions, levelId);

  if (!session) {
    try {
      session = buildExamSession(
        levelId,
        config.poolExerciseIds,
        config.questionsPerExam,
      );
      userProgress = {
        ...userProgress,
        activeExamSessions: upsertExamSession(
          userProgress.activeExamSessions,
          session,
        ),
      };
      await persistProgress(userProgress);
    } catch {
      redirect(`/learn/${levelId}`);
    }
  }

  const { region, foods } = await getRegionalContentContext();

  const exercises = session.exerciseIds
    .map((id) => getExerciseById(id))
    .filter((e): e is NonNullable<typeof e> => !!e)
    .map((exercise) => localizeExercise(exercise, region, foods));

  const nextLevel = levels.find((l) => l.orderIndex === level.orderIndex + 1);

  return (
    <>
      <AppNavBar />
      <main className="mx-auto max-w-3xl flex-1 px-4 py-8">
        <header className="mb-8">
          <p className="text-sm font-medium text-amber-600">Examen de nivel</p>
          <h1 className="text-2xl font-bold text-gray-900">{exam.title}</h1>
          <p className="mt-2 text-gray-600">{exam.description}</p>
          <p className="mt-2 text-sm text-gray-500">
            {exercises.length} preguntas en este intento · banco de{" "}
            {config.poolExerciseIds.length}
          </p>
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
