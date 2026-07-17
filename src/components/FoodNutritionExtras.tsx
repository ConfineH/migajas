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
    <div className={compact ? "mt-3 space-y-2 text-sm" : "mt-3 space-y-3 border-t border-border/60 pt-3"}>
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-sage-light px-2 py-0.5 text-xs font-medium text-sage-strong">
          {glycemicLabel}
        </span>
        {fiberG !== null ? (
          <span className="rounded-full bg-terracotta-soft/50 px-2 py-0.5 text-xs font-medium text-terracotta-dark">
            Fibra: {fiberG} g
          </span>
        ) : null}
      </div>
      {!compact ? (
        <>
          <p className="text-xs text-muted">{glycemicHint}</p>
          {fiberG !== null ? (
            <p className="text-xs text-muted">{FIBER_INFO_NOTE_ES}</p>
          ) : null}
        </>
      ) : null}
    </div>
  );
}
