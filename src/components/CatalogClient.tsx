"use client";

import { useState } from "react";
import { FoodCard } from "@/components/FoodCard";
import type { EnrichedFoodItem } from "@/lib/domain/foods";
import {
  enrichFoods,
  filterAndSearch,
  getCategories,
} from "@/lib/domain/foods";

interface CatalogClientProps {
  foods: EnrichedFoodItem[];
}

export function CatalogClient({ foods }: CatalogClientProps) {
  const [category, setCategory] = useState("Todas");
  const [query, setQuery] = useState("");

  const categories = ["Todas", ...getCategories(foods)];
  const filtered = enrichFoods(filterAndSearch(foods, category, query));

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          type="search"
          placeholder="Buscar alimento..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1 rounded-xl border border-emerald-200 px-4 py-3 text-base focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
          aria-label="Buscar alimento"
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="rounded-xl border border-emerald-200 px-4 py-3 text-base focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
          aria-label="Filtrar por categoría"
        >
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      <p className="text-sm text-gray-500">
        {filtered.length} alimento{filtered.length !== 1 ? "s" : ""} · 10 g HC
        = 1 ración
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        {filtered.map((food) => (
          <FoodCard key={food.id} food={food} />
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="py-12 text-center text-gray-500">
          No se encontraron alimentos.
        </p>
      )}
    </div>
  );
}
