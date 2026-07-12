import { notFound } from "next/navigation";
import { AppNavBar } from "@/components/AppNavBar";
import { LessonViewer } from "@/components/LessonViewer";
import { getLessonById, getPracticeSteps } from "@/lib/domain/lessons";
import { getLevelById } from "@/lib/domain/exercises";

interface Props {
  params: Promise<{ levelId: string; id: string }>;
}

export default async function LessonPage({ params }: Props) {
  const { levelId, id } = await params;
  const level = getLevelById(levelId);
  const lesson = getLessonById(id);
  if (!level || !lesson || lesson.levelId !== levelId) notFound();

  const practice = getPracticeSteps(lesson)[0];
  if (!practice) notFound();

  const nextHref = `/learn/${levelId}/practice/${practice.id}`;

  return (
    <>
      <AppNavBar />
      <main className="mx-auto max-w-3xl flex-1 px-4 py-8">
        <header className="mb-6">
          <p className="text-sm text-emerald-600">
            {level.name} · Lección {lesson.orderIndex}
          </p>
          <h1 className="text-2xl font-bold text-gray-900">{lesson.title}</h1>
          <p className="mt-2 text-gray-600">{lesson.summary}</p>
        </header>
        <LessonViewer lesson={lesson} nextHref={nextHref} />
      </main>
    </>
  );
}
