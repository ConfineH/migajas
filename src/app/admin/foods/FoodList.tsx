"use client";

import { useMemo, useState } from "react";
import type { FoodItem } from "@/lib/domain/foods";
import { calculateRations } from "@/lib/domain/rations";
import { AdminSearch } from "@/app/admin/AdminSearch";
import { CollapsiblePanel } from "@/app/admin/CollapsiblePanel";
import { FoodEditor } from "@/app/admin/foods/FoodEditor";

interface FoodListProps {
  foods: FoodItem[];
}

export function FoodList({ foods }: FoodListProps) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Todas");

  const categories = useMemo(
    () => ["Todas", ...new Set(foods.map((food) => food.category))].sort(),
    [foods],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return foods.filter((food) => {
      const matchesCategory = category === "Todas" || food.category === category;
      if (!matchesCategory) return false;
      if (!q) return true;
      return (
        food.name.toLowerCase().includes(q) ||
        food.id.toLowerCase().includes(q) ||
        food.category.toLowerCase().includes(q)
      );
    });
  }, [foods, query, category]);

  return (
    <>
      <AdminSearch
        value={query}
        onChange={setQuery}
        placeholder="Buscar por nombre, id o categoría…"
        resultCount={filtered.length}
        totalCount={foods.length}
      />

      <div className="mb-6 flex flex-wrap gap-2">
        {categories.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setCategory(item)}
            className={`rounded-full px-3 py-1 text-xs font-medium ${
              category === item
                ? "bg-emerald-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {item}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {filtered.map((food) => {
          const rations = calculateRations(food.carbsG);
          return (
            <CollapsiblePanel
              key={food.id}
              id={food.id}
              title={food.name}
              subtitle={`${food.category} · ${food.portionText} · ${food.carbsG} g CHO · ${rations} ración${rations === 1 ? "" : "es"}`}
            >
              <FoodEditor food={food} />
            </CollapsiblePanel>
          );
        })}
      </div>
    </>
  );
}
