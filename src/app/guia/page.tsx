import { AppNavBar } from "@/components/AppNavBar";
import { PageHeader } from "@/components/ui/PageHeader";
import { ReferenceGuideClient } from "@/components/reference-guide/ReferenceGuideClient";
import { getFoodsForCountry } from "@/lib/data/foods";
import { enrichFoods } from "@/lib/domain/foods";
import { buildReferenceTips } from "@/lib/domain/reference-guide";
import { getFreeModeStatus } from "@/lib/free-mode";
import { requireOnboarding } from "@/lib/onboarding";
import { getActiveRegion } from "@/lib/region-server";

export const metadata = {
  title: "Guía de referencia — Migajas",
};

export default async function ReferenceGuidePage() {
  await requireOnboarding();
  const [region, freeMode] = await Promise.all([
    getActiveRegion(),
    getFreeModeStatus(),
  ]);
  const foods = enrichFoods(
    getFoodsForCountry(region.foodCountry),
    region.exchangeUnitG,
  );

  return (
    <>
      <AppNavBar />
      <main className="mx-auto max-w-3xl flex-1 px-4 py-8">
        <PageHeader
          title="Guía de referencia"
          description={
            freeMode
              ? "Reglas y calculadora. El listado de alimentos está en el catálogo."
              : "Reglas, conversión y consulta de alimentos durante el curso."
          }
        />
        <ReferenceGuideClient
          foods={foods}
          freeMode={freeMode}
          regionName={region.name}
          regionFlag={region.flag}
          exchangeUnitG={region.exchangeUnitG}
          tips={buildReferenceTips(region.exchangeUnitG, region.name)}
        />
      </main>
    </>
  );
}
