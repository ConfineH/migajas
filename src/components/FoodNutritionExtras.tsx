import type { EnrichedFoodItem } from "@/lib/domain/foods";
import {
  FIBER_INFO_NOTE_ES,
  formatGlycemicImpact,
  getGlycemicImpactHint,
  resolveFoodFiberG,
} from "@/lib/domain/food-nutrition";

interface FoodNutritionExtrasProps {
  food: EnrichedFoodItem;
  regionId?: string;
  compact?: boolean;
}

export function FoodNutritionExtras({
  food,
  regionId = "es",
  compact = false,
}: FoodNutritionExtrasProps) {
  const fiberG = resolveFoodFiberG(food);
  const glycemicLabel = formatGlycemicImpact(food.difficulty, regionId);
  const glycemicHint = getGlycemicImpactHint(food.difficulty, regionId);

  return (
    <div className={compact ? "mt-3 space-y-2 text-sm" : "mt-3 space-y-3 border-t border-gray-100 pt-3"}>
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-sky-50 px-2 py-0.5 text-xs font-medium text-sky-800">
          {glycemicLabel}
        </span>
        {fiberG !== null ? (
          <span className="rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-900">
            Fibra: {fiberG} g
          </span>
        ) : null}
      </div>
      {!compact ? (
        <>
          <p className="text-xs text-gray-500">{glycemicHint}</p>
          {fiberG !== null ? (
            <p className="text-xs text-gray-500">{FIBER_INFO_NOTE_ES}</p>
          ) : null}
        </>
      ) : null}
    </div>
  );
}
