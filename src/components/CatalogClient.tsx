import { FoodSearchGrid } from "@/components/FoodSearchGrid";
import type { EnrichedFoodItem } from "@/lib/domain/foods";

interface CatalogClientProps {
  foods: EnrichedFoodItem[];
}

export function CatalogClient({ foods }: CatalogClientProps) {
  return <FoodSearchGrid foods={foods} />;
}
