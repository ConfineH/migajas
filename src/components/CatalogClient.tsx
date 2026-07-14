import { FoodSearchGrid } from "@/components/FoodSearchGrid";
import type { EnrichedFoodItem } from "@/lib/domain/foods";

interface CatalogClientProps {
  foods: EnrichedFoodItem[];
  exchangeUnitG: number;
  exchangeRuleLabel: string;
  regionId?: string;
}

export function CatalogClient({
  foods,
  exchangeUnitG,
  exchangeRuleLabel,
  regionId = "es",
}: CatalogClientProps) {
  return (
    <FoodSearchGrid
      foods={foods}
      exchangeUnitG={exchangeUnitG}
      exchangeRuleLabel={exchangeRuleLabel}
      regionId={regionId}
    />
  );
}
