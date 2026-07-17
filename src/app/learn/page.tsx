import Link from "next/link";
import { AppNavBar } from "@/components/AppNavBar";
import { ClinicalModePrompt } from "@/components/ClinicalModePrompt";
import { CourseLevelList } from "@/components/CourseLevelList";
import { AppPageLayout } from "@/components/layout/AppPageLayout";
import { PageHeader } from "@/components/ui/PageHeader";
import { canShowClinicalPrompt } from "@/lib/clinical-access";
import { isFreeModeUnlocked, toGuidedProgress } from "@/lib/domain/guided-flow";
import { resolveProgress } from "@/lib/learning-state";
import { getActiveRegion } from "@/lib/region-server";

export const metadata = {
  title: "Curso guiado — Migajas",
};

export const dynamic = "force-dynamic";

export default async function LearnPage() {
  const [stored, clinicalPrompt, region] = await Promise.all([
    resolveProgress(),
    canShowClinicalPrompt(),
    getActiveRegion(),
  ]);
  const progress = toGuidedProgress(stored);
  const freeMode = isFreeModeUnlocked(progress);

  return (
    <>
      <AppNavBar />
      <main className="flex flex-1 flex-col">
        <AppPageLayout>
          <PageHeader
            title="Curso guiado"
            description="Cinco niveles con lecciones, práctica y examen. Avanza paso a paso."
          />

          {clinicalPrompt.show ? <ClinicalModePrompt /> : null}

          {freeMode ? (
            <div className="callout-sage mb-6">
              <p className="font-semibold text-foreground">Modo libre activo</p>
              <p className="mt-1 text-pretty text-sm text-muted">
                Puedes consultar el{" "}
                <Link
                  href="/catalog"
                  className="font-semibold text-sage-strong underline-offset-2 hover:underline"
                >
                  catálogo
                </Link>{" "}
                y la{" "}
                <Link
                  href="/levels"
                  className="font-semibold text-sage-strong underline-offset-2 hover:underline"
                >
                  práctica libre
                </Link>{" "}
                cuando quieras.
              </p>
            </div>
          ) : null}

          <CourseLevelList progress={progress} region={region} />
        </AppPageLayout>
      </main>
    </>
  );
}
