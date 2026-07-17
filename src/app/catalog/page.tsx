import { AppNavBar } from "@/components/AppNavBar";
import { CatalogClient } from "@/components/CatalogClient";
import { AppPageLayout } from "@/components/layout/AppPageLayout";
import { PageHeader } from "@/components/ui/PageHeader";
import { getFoodsForCountry } from "@/lib/data/foods";
import { enrichFoods } from "@/lib/domain/foods";
import { formatExchangeRule } from "@/lib/domain/regions";
import { requireFreeMode } from "@/lib/free-mode";
import { getActiveRegion } from "@/lib/region-server";

export const metadata = {
  title: "Catálogo — Migajas",
};

export default async function CatalogPage() {
  await requireFreeMode();
  const region = await getActiveRegion();
  const foods = enrichFoods(
    getFoodsForCountry(region.foodCountry),
    region.exchangeUnitG,
    region.id,
  );

  return (
    <>
      <AppNavBar />
      <main className="flex flex-1 flex-col">
        <AppPageLayout>
          <PageHeader
            title="Catálogo de alimentos"
            description={`Alimentos habituales en ${region.name}. Cada ficha muestra la porción, los gramos, los carbohidratos y las raciones (${formatExchangeRule(region)}).`}
          />
          <CatalogClient
            foods={foods}
            exchangeUnitG={region.exchangeUnitG}
            exchangeRuleLabel={formatExchangeRule(region)}
            regionId={region.id}
          />
        </AppPageLayout>
      </main>
    </>
  );
}
