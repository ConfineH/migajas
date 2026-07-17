import { AppNavBar } from "@/components/AppNavBar";
import { LevelsList } from "@/components/LevelsList";
import { AppPageLayout } from "@/components/layout/AppPageLayout";
import { PageHeader } from "@/components/ui/PageHeader";
import { resolveAttempts, resolveProgress } from "@/lib/learning-state";
import { requireFreeMode } from "@/lib/free-mode";

export const metadata = {
  title: "Practicar — Migajas",
};

export default async function LevelsPage() {
  await requireFreeMode();
  const progress = await resolveProgress();
  const attempts = await resolveAttempts();

  return (
    <>
      <AppNavBar />
      <main className="flex flex-1 flex-col">
        <AppPageLayout>
          <PageHeader
            title="Practicar"
            description="Avanza por niveles. Necesitas al menos 60% de aciertos para desbloquear el siguiente."
          />
          <LevelsList progress={progress} attempts={attempts} />
        </AppPageLayout>
      </main>
    </>
  );
}
