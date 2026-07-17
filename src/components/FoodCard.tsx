import type { EnrichedFoodItem } from "@/lib/domain/foods";
import { formatRations } from "@/lib/domain/rations";
import { inferFoodSourceId } from "@/lib/domain/content-sources";
import { ContentSourceLink } from "@/components/content-sources/ContentSourceLink";

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
    <article className="rounded-2xl border border-emerald-100 bg-white p-4 shadow-sm">
      <div className="mb-2 flex items-start justify-between gap-2">
        <h3 className="text-lg font-semibold text-gray-900">{food.name}</h3>
        <span className="shrink-0 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
          {typeLabels[food.itemType]}
        </span>
      </div>
      <p className="mb-3 text-sm text-gray-500">{food.category}</p>
      <dl className="grid grid-cols-2 gap-2 text-sm">
        <div>
          <dt className="text-gray-500">Porción</dt>
          <dd className="font-medium text-gray-900">{food.portionText}</dd>
        </div>
        <div>
          <dt className="text-gray-500">Gramos</dt>
          <dd className="font-medium text-gray-900">{food.grams} g</dd>
        </div>
        <div>
          <dt className="text-gray-500">Carbohidratos</dt>
          <dd className="font-medium text-gray-900">{food.carbsG} g</dd>
        </div>
        <div>
          <dt className="text-gray-500">Raciones</dt>
          <dd className="font-bold text-emerald-700">
            {formatRations(food.rations)}
          </dd>
        </div>
      </dl>
      {sourceId ? (
        <p className="mt-3 border-t border-gray-100 pt-3 text-xs">
          <ContentSourceLink sourceId={sourceId} />
        </p>
      ) : null}
    </article>
  );
}
