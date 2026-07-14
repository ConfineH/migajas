import { FoodSearchGrid } from "@/components/FoodSearchGrid";
import type { EnrichedFoodItem } from "@/lib/domain/foods";

interface CatalogClientProps {
  foods: EnrichedFoodItem[];
  exchangeUnitG: number;
  exchangeRuleLabel: string;
}

export function CatalogClient({
  foods,
  exchangeUnitG,
  exchangeRuleLabel,
}: CatalogClientProps) {
  return (
    <FoodSearchGrid
      foods={foods}
      exchangeUnitG={exchangeUnitG}
      exchangeRuleLabel={exchangeRuleLabel}
    />
  );
}
