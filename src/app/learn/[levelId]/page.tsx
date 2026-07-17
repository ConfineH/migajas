import { notFound } from "next/navigation";
import { AppNavBar } from "@/components/AppNavBar";
import { Button } from "@/components/Button";
import { GuidedPathList } from "@/components/GuidedPathList";
import { AppPageLayout } from "@/components/layout/AppPageLayout";
import { LearnSectionHeader } from "@/components/layout/LearnSectionHeader";
import { getActiveRegion } from "@/lib/region-server";
import { localizeLevel } from "@/lib/domain/content-localization";
import { resolveProgress } from "@/lib/learning-state";
import {
  toGuidedProgress,
  getLessonProgressPercent,
  getNextGuidedItem,
  isGuidedLevelUnlocked,
} from "@/lib/domain/guided-flow";
import { getLevelById, getLevels } from "@/lib/domain/exercises";

interface Props {
  params: Promise<{ levelId: string }>;
}

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Props) {
  const { levelId } = await params;
  const level = getLevelById(levelId);
  return { title: level ? `${level.name} — Curso` : "Curso — Migajas" };
}

export default async function LearnLevelPage({ params }: Props) {
  const { levelId } = await params;
  const level = getLevelById(levelId);
  if (!level) notFound();

  const stored = await resolveProgress();
  const progress = toGuidedProgress(stored);
  const levels = getLevels();
  const region = await getActiveRegion();
  const localizedLevel = localizeLevel(level, region);

  if (!isGuidedLevelUnlocked(levelId, progress, levels)) {
    return (
      <>
        <AppNavBar />
        <main className="flex flex-1 flex-col">
          <AppPageLayout className="py-12 text-center">
            <p className="text-4xl" aria-hidden>
              🔒
            </p>
            <h1 className="mt-4 font-display text-xl font-medium text-foreground">
              Nivel bloqueado
            </h1>
            <p className="mt-2 text-muted">
              Aprueba el examen del nivel anterior para acceder a{" "}
              <strong>{level.name}</strong>.
            </p>
            <div className="mt-6">
              <Button href="/learn">Volver al curso</Button>
            </div>
          </AppPageLayout>
        </main>
      </>
    );
  }

  const pct = getLessonProgressPercent(progress, levelId);
  const next = getNextGuidedItem(progress, levelId);

  return (
    <>
      <AppNavBar />
      <main className="flex flex-1 flex-col">
        <AppPageLayout>
          <LearnSectionHeader
            backHref="/learn"
            backLabel="Todos los niveles"
            title={localizedLevel.name}
            description={localizedLevel.description}
            progressPercent={pct}
          />

          <GuidedPathList levelId={levelId} progress={progress} />

          {next ? (
            <div className="mt-8 text-center">
              <Button
                href={
                  next.type === "lesson"
                    ? `/learn/${levelId}/lessons/${next.id}`
                    : next.type === "practice"
                      ? `/learn/${levelId}/practice/${next.id}`
                      : next.type === "flashcards"
                        ? `/learn/${levelId}/fichas`
                        : `/learn/${levelId}/exam`
                }
              >
                Continuar donde lo dejé
              </Button>
            </div>
          ) : null}
        </AppPageLayout>
      </main>
    </>
  );
}
