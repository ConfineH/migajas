import { AppNavBar } from "@/components/AppNavBar";
import { PageHeader } from "@/components/ui/PageHeader";
import { CourseLevelList } from "@/components/CourseLevelList";
import { RegionCourseNotice } from "@/components/RegionCourseNotice";
import { resolveProgress } from "@/lib/learning-state";
import { toGuidedProgress, isFreeModeUnlocked } from "@/lib/domain/guided-flow";
import { getActiveRegion } from "@/lib/region-server";
import Link from "next/link";

export const metadata = {
  title: "Curso guiado — Migajas",
};

export default async function LearnPage() {
  const [stored, region] = await Promise.all([
    resolveProgress(),
    getActiveRegion(),
  ]);
  const progress = toGuidedProgress(stored);
  const freeMode = isFreeModeUnlocked(progress);
  const showRegionNotice = region.id !== "es";

  return (
    <>
      <AppNavBar />
      <main className="mx-auto max-w-3xl flex-1 px-4 py-8">
        <PageHeader
          title="Curso guiado"
          description="Cinco niveles con lecciones, práctica y examen. Avanza paso a paso."
        />

        {showRegionNotice ? (
          <RegionCourseNotice regionName={region.name} />
        ) : null}

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
