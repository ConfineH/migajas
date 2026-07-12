import { notFound } from "next/navigation";
import { NavBar } from "@/components/NavBar";
import { LessonViewer } from "@/components/LessonViewer";
import { getLessonById, getPracticeSteps } from "@/lib/domain/lessons";
import { getFreeModeStatus } from "@/lib/free-mode";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function LessonPage({ params }: Props) {
  const { id } = await params;
  const lesson = getLessonById(id);
  if (!lesson) notFound();

  const practice = getPracticeSteps(lesson)[0];
  if (!practice) notFound();

  const nextHref = `/learn/nivel-1/practice/${practice.id}`;
  const freeMode = await getFreeModeStatus();

  return (
    <>
      <NavBar freeMode={freeMode} />
      <main className="mx-auto max-w-3xl flex-1 px-4 py-8">
        <header className="mb-6">
          <p className="text-sm text-emerald-600">Lección {lesson.orderIndex}</p>
          <h1 className="text-2xl font-bold text-gray-900">{lesson.title}</h1>
          <p className="mt-2 text-gray-600">{lesson.summary}</p>
        </header>
        <LessonViewer lesson={lesson} nextHref={nextHref} />
      </main>
    </>
  );
}
