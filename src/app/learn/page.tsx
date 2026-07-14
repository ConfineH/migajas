import { AppNavBar } from "@/components/AppNavBar";
import { ClinicalModePrompt } from "@/components/ClinicalModePrompt";
import { PageHeader } from "@/components/ui/PageHeader";
import { CourseLevelList } from "@/components/CourseLevelList";
import { canShowClinicalPrompt } from "@/lib/clinical-access";
import { resolveProgress } from "@/lib/learning-state";
import { toGuidedProgress, isFreeModeUnlocked } from "@/lib/domain/guided-flow";
import Link from "next/link";

export const metadata = {
  title: "Curso guiado — Migajas",
};

export default async function LearnPage() {
  const [stored, clinicalPrompt] = await Promise.all([
    resolveProgress(),
    canShowClinicalPrompt(),
  ]);
  const progress = toGuidedProgress(stored);
  const freeMode = isFreeModeUnlocked(progress);

  return (
    <>
      <AppNavBar />
      <main className="mx-auto max-w-3xl flex-1 px-4 py-8">
        <PageHeader
          title="Curso guiado"
          description="Cinco niveles con lecciones, práctica y examen. Avanza paso a paso."
        />

        {clinicalPrompt.show ? <ClinicalModePrompt /> : null}

        {freeMode && (
          <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
            <p className="font-semibold text-emerald-800">Modo libre activo</p>
            <p className="mt-1 text-sm text-emerald-700">
              Puedes consultar el{" "}
              <Link href="/catalog" className="font-semibold underline">
                catálogo
              </Link>{" "}
              y la{" "}
              <Link href="/levels" className="font-semibold underline">
                práctica libre
              </Link>{" "}
              cuando quieras.
            </p>
          </div>
        )}

        <CourseLevelList progress={progress} />
      </main>
    </>
  );
}
