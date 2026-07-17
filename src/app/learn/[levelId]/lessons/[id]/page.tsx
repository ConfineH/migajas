import { notFound } from "next/navigation";
import { AppNavBar } from "@/components/AppNavBar";
import { LessonViewer } from "@/components/LessonViewer";
import { AppPageLayout } from "@/components/layout/AppPageLayout";
import { LearnSectionHeader } from "@/components/layout/LearnSectionHeader";
import { getRegionalContentContext } from "@/lib/content-for-region";
import { localizeLesson } from "@/lib/domain/content-localization";
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

  const { region, foods } = await getRegionalContentContext();
  const localizedLesson = localizeLesson(lesson, region, foods);

  const practice = getPracticeSteps(localizedLesson)[0];
  if (!practice) notFound();

  const nextHref = `/learn/${levelId}/practice/${practice.id}`;

  return (
    <>
      <AppNavBar />
      <main className="flex flex-1 flex-col">
        <AppPageLayout>
          <LearnSectionHeader
            backHref={`/learn/${levelId}`}
            backLabel="Volver al nivel"
            eyebrow={`${level.name} · Lección ${localizedLesson.orderIndex}`}
            title={localizedLesson.title}
            description={localizedLesson.summary}
          />
          <LessonViewer
            lesson={localizedLesson}
            nextHref={nextHref}
            exchangeUnitG={region.exchangeUnitG}
          />
        </AppPageLayout>
      </main>
    </>
  );
}
