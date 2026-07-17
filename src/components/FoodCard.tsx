import type { EnrichedFoodItem } from "@/lib/domain/foods";
import { formatRations } from "@/lib/domain/rations";
import { inferFoodSourceId } from "@/lib/domain/content-sources";
import { ContentSourceLink } from "@/components/content-sources/ContentSourceLink";
import { FoodNutritionExtras } from "@/components/FoodNutritionExtras";

interface FoodCardProps {
  food: EnrichedFoodItem;
  regionId?: string;
}

const typeLabelsEs = {
  base: "Base",
  mixed: "Plato mixto",
  modulator: "Modulador",
};

const typeLabelsDo = {
  base: "Base",
  mixed: "Plato con varias cosas",
  modulator: "No suma raciones",
};

export function FoodCard({ food, regionId = "es" }: FoodCardProps) {
  const typeLabels = regionId === "do" ? typeLabelsDo : typeLabelsEs;
  const sourceId = inferFoodSourceId(food);
  return (
    <article className="feature-card p-5">
      <div className="mb-2 flex items-start justify-between gap-2">
        <h3 className="font-display text-lg font-medium text-foreground">
          {food.name}
        </h3>
        <span className="shrink-0 rounded-full bg-sage-light px-2.5 py-0.5 text-xs font-medium text-sage-strong">
          {typeLabels[food.itemType]}
        </span>
      </div>
      <p className="mb-3 text-sm text-muted">{food.category}</p>
      <dl className="grid grid-cols-2 gap-2 text-sm">
        <div>
          <dt className="text-muted">Porción</dt>
          <dd className="font-medium text-foreground">{food.portionText}</dd>
        </div>
        <div>
          <dt className="text-muted">Gramos</dt>
          <dd className="font-medium text-foreground">{food.grams} g</dd>
        </div>
        <div>
          <dt className="text-muted">Carbohidratos</dt>
          <dd className="font-medium text-foreground">{food.carbsG} g</dd>
        </div>
        <div>
          <dt className="text-muted">Raciones</dt>
          <dd className="font-display text-lg font-medium tabular-nums text-sage-strong">
            {formatRations(food.rations)}
          </dd>
        </div>
      </dl>
      <FoodNutritionExtras food={food} regionId={regionId} />
      {sourceId ? (
        <p className="mt-3 border-t border-border/60 pt-3 text-xs">
          <ContentSourceLink sourceId={sourceId} />
        </p>
      ) : null}
    </article>
  );
}
