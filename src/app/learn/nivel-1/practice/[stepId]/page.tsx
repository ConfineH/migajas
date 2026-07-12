import { notFound } from "next/navigation";
import { NavBar } from "@/components/NavBar";
import { SingleExercise } from "@/components/SingleExercise";
import { getLessonsForLevel } from "@/lib/domain/lessons";
import { getExerciseById } from "@/lib/domain/exercises";
import { getFreeModeStatus } from "@/lib/free-mode";

interface Props {
  params: Promise<{ stepId: string }>;
}

export default async function PracticePage({ params }: Props) {
  const { stepId } = await params;
  const lessons = getLessonsForLevel("nivel-1");

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

  const freeMode = await getFreeModeStatus();

  return (
    <>
      <NavBar freeMode={freeMode} />
      <main className="mx-auto max-w-3xl flex-1 px-4 py-8">
        <SingleExercise
          exercise={exercise}
          practiceStepId={stepId}
          returnHref="/learn/nivel-1"
        />
      </main>
    </>
  );
}
