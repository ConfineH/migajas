import { AppNavBar } from "@/components/AppNavBar";
import { LevelsList } from "@/components/LevelsList";
import { AppPageLayout } from "@/components/layout/AppPageLayout";
import { PageHeader } from "@/components/ui/PageHeader";
import { PASS_THRESHOLD } from "@/lib/domain/progress";
import { resolveAttempts, resolveProgress } from "@/lib/learning-state";
import { requireFreeMode } from "@/lib/free-mode";

import { NOINDEX_METADATA } from "@/lib/domain/seo";

export const metadata = NOINDEX_METADATA;

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
            title="Repaso libre"
            description={`Ejercicios libres por nivel. Necesitas al menos ${PASS_THRESHOLD}% de aciertos para desbloquear el siguiente.`}
          />
          <LevelsList progress={progress} attempts={attempts} />
        </AppPageLayout>
      </main>
    </>
  );
}
