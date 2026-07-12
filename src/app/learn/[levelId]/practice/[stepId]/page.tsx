import { notFound } from "next/navigation";
import { AppNavBar } from "@/components/AppNavBar";
import { SingleExercise } from "@/components/SingleExercise";
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

  return (
    <>
      <AppNavBar />
      <main className="mx-auto max-w-3xl flex-1 px-4 py-8">
        <SingleExercise
          exercise={exercise}
          practiceStepId={stepId}
          returnHref={`/learn/${levelId}`}
        />
      </main>
    </>
  );
}
