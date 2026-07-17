import { AppNavBar } from "@/components/AppNavBar";
import { PageHeader } from "@/components/ui/PageHeader";
import { ReferenceGuideClient } from "@/components/reference-guide/ReferenceGuideClient";
import { getFoodsForCountry } from "@/lib/data/foods";
import { getSourcesForRegion } from "@/lib/domain/content-sources";
import { enrichFoods } from "@/lib/domain/foods";
import { buildReferenceTips } from "@/lib/domain/reference-guide";
import { getFreeModeStatus } from "@/lib/free-mode";
import { requireOnboarding } from "@/lib/onboarding";
import { getActiveRegion } from "@/lib/region-server";

export const metadata = {
  title: "Guía de referencia — Migajas",
};

type Props = {
  searchParams: Promise<{ tab?: string }>;
};

export default async function ReferenceGuidePage({ searchParams }: Props) {
  await requireOnboarding();
  const { tab } = await searchParams;
  const [region, freeMode] = await Promise.all([
    getActiveRegion(),
    getFreeModeStatus(),
  ]);
  const foods = enrichFoods(
    getFoodsForCountry(region.foodCountry),
    region.exchangeUnitG,
    region.id,
  );
  const sources = getSourcesForRegion(region.id);

  return (
    <>
      <AppNavBar />
      <main className="mx-auto max-w-3xl flex-1 px-4 py-8">
        <PageHeader
          title="Guía de referencia"
          description={
            freeMode
              ? "Reglas, fuentes y calculadora. El listado de alimentos está en el catálogo."
              : "Reglas, conversión, fuentes y consulta de alimentos durante el curso."
          }
        />
        <ReferenceGuideClient
          foods={foods}
          freeMode={freeMode}
          regionName={region.name}
          regionFlag={region.flag}
          regionId={region.id}
          exchangeUnitG={region.exchangeUnitG}
          tips={buildReferenceTips(region.exchangeUnitG, region.name, region.id)}
          sources={sources}
          initialTab={tab === "fuentes" ? "fuentes" : undefined}
        />
      </main>
    </>
  );
}
