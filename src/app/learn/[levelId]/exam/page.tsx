import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { AppNavBar } from "@/components/AppNavBar";
import { ExamRunner } from "@/components/ExamRunner";
import { Button } from "@/components/Button";
import { AppPageLayout } from "@/components/layout/AppPageLayout";
import { LearnSectionHeader } from "@/components/layout/LearnSectionHeader";
import { getExamForLevel } from "@/lib/domain/lessons";
import { getExerciseById, getLevelById, getLevels } from "@/lib/domain/exercises";
import { getRegionalContentContext } from "@/lib/content-for-region";
import { localizeExercise } from "@/lib/domain/content-localization";
import { resolveProgress } from "@/lib/learning-state";
import {
  toGuidedProgress,
  canStartExam,
  hasCompletedFlashcards,
  isGuidedLevelUnlocked,
} from "@/lib/domain/guided-flow";
import {
  getResumableExamSession,
  normalizeExamConfig,
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
        <main className="flex flex-1 flex-col">
          <AppPageLayout className="py-12 text-center">
            <p className="text-4xl" aria-hidden>
              📚
            </p>
            <h1 className="mt-4 font-display text-xl font-medium text-foreground">
              Completa el curso primero
            </h1>
            <p className="mt-2 text-muted">
              Termina todas las lecciones y prácticas antes del examen.
            </p>
            <div className="mt-6">
              <Button href={`/learn/${levelId}`}>Volver al nivel</Button>
            </div>
          </AppPageLayout>
        </main>
      </>
    );
  }

  const exam = getExamForLevel(levelId);
  if (!exam) redirect(`/learn/${levelId}`);

  const forceNew = nuevo === "1";
  let session = forceNew
    ? null
    : getResumableExamSession(stored.activeExamSessions, levelId);

  if (!session) {
    redirect(`/api/exam/start?levelId=${levelId}${forceNew ? "&nuevo=1" : ""}`);
  }

  const config = normalizeExamConfig(exam);
  const { region, foods } = await getRegionalContentContext();

  const exercises = session.exerciseIds
    .map((id) => getExerciseById(id))
    .filter((e): e is NonNullable<typeof e> => !!e)
    .map((exercise) => localizeExercise(exercise, region, foods));

  if (exercises.length === 0) {
    return (
      <>
        <AppNavBar />
        <main className="flex flex-1 flex-col">
          <AppPageLayout className="py-12 text-center">
            <p className="text-4xl" aria-hidden>
              ⚠️
            </p>
            <h1 className="mt-4 font-display text-xl font-medium text-foreground">
              No se pudo cargar el examen
            </h1>
            <p className="mt-2 text-muted">
              El banco de preguntas no está disponible. Inténtalo de nuevo.
            </p>
            <div className="mt-6 flex justify-center gap-3">
              <Button href={`/api/exam/start?levelId=${levelId}&nuevo=1`}>
                Reintentar examen
              </Button>
              <Button href={`/learn/${levelId}`} variant="secondary">
                Volver al nivel
              </Button>
            </div>
          </AppPageLayout>
        </main>
      </>
    );
  }

  const nextLevel = levels.find((l) => l.orderIndex === level.orderIndex + 1);
  const fichasIncomplete =
    canStartExam(progress, levelId) && !hasCompletedFlashcards(progress, levelId);

  return (
    <>
      <AppNavBar />
      <main className="flex flex-1 flex-col">
        <AppPageLayout>
          {fichasIncomplete ? (
            <div className="mb-6 rounded-2xl bg-terracotta-soft/25 px-5 py-4 text-sm text-foreground">
              <p className="font-semibold">Recomendado antes del examen</p>
              <p className="mt-1 text-muted">
                Aún no has completado las fichas del nivel. Repásalas para memorizar
                porciones y carbohidratos de los alimentos del examen.
              </p>
              <Link
                href={`/learn/${levelId}/fichas`}
                className="mt-2 inline-block font-medium text-terracotta-dark underline-offset-2 hover:underline"
              >
                Ir a Fichas del nivel →
              </Link>
            </div>
          ) : null}
          <LearnSectionHeader
            backHref={`/learn/${levelId}`}
            backLabel="Volver al nivel"
            eyebrow="Examen de nivel"
            title={exam.title}
            description={`${exam.description} · ${exercises.length} preguntas en este intento · banco de ${config.poolExerciseIds.length}`}
          />
          <ExamRunner
            exercises={exercises}
            levelId={levelId}
            levelName={level.name}
            nextLevelId={nextLevel?.id}
          />
        </AppPageLayout>
      </main>
    </>
  );
}
