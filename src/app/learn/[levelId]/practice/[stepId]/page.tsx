import { notFound } from "next/navigation";
import { AppNavBar } from "@/components/AppNavBar";
import { SingleExercise } from "@/components/SingleExercise";
import { AppPageLayout } from "@/components/layout/AppPageLayout";
import { getRegionalContentContext } from "@/lib/content-for-region";
import { localizeExercise } from "@/lib/domain/content-localization";
import { getLessonsForLevel } from "@/lib/domain/lessons";
import { getExerciseById, getLevelById } from "@/lib/domain/exercises";

interface Props {
  params: Promise<{ levelId: string; stepId: string }>;
}

export default async function PracticePage({ params }: Props) {
  const { levelId, stepId } = await params;
  const level = getLevelById(levelId);
  if (!level) notFound();

  const lessons = getLessonsForLevel(levelId);
  let exerciseId: string | undefined;

  for (const lesson of lessons) {
    const step = lesson.steps.find((s) => s.id === stepId);
    if (step?.exerciseId) {
      exerciseId = step.exerciseId;
      break;
    }
  }

  if (!exerciseId) notFound();

  const exercise = getExerciseById(exerciseId);
  if (!exercise) notFound();

  const { region, foods } = await getRegionalContentContext();
  const localizedExercise = localizeExercise(exercise, region, foods);

  return (
    <>
      <AppNavBar />
      <main className="flex flex-1 flex-col">
        <AppPageLayout>
          <SingleExercise
            exercise={localizedExercise}
            practiceStepId={stepId}
            returnHref={`/learn/${levelId}`}
          />
        </AppPageLayout>
      </main>
    </>
  );
}
