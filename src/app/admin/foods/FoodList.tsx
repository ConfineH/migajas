"use client";

import { useMemo, useState } from "react";
import type { FoodItem } from "@/lib/domain/foods";
import { calculateRations } from "@/lib/domain/rations";
import { AdminSearch } from "@/app/admin/AdminSearch";
import { CollapsiblePanel } from "@/app/admin/CollapsiblePanel";
import { FoodCreateForm } from "@/app/admin/foods/FoodCreateForm";
import { FoodEditor } from "@/app/admin/foods/FoodEditor";

interface FoodListProps {
  foods: FoodItem[];
}

export function FoodList({ foods }: FoodListProps) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Todas");
  const [country, setCountry] = useState("Todos");

  const categories = useMemo(
    () => ["Todas", ...new Set(foods.map((food) => food.category))].sort(),
    [foods],
  );

  const countries = useMemo(
    () => ["Todos", ...new Set(foods.map((food) => food.country))].sort(),
    [foods],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return foods.filter((food) => {
      const matchesCategory = category === "Todas" || food.category === category;
      const matchesCountry = country === "Todos" || food.country === country;
      if (!matchesCategory || !matchesCountry) return false;
      if (!q) return true;
      return (
        food.name.toLowerCase().includes(q) ||
        food.id.toLowerCase().includes(q) ||
        food.category.toLowerCase().includes(q)
      );
    });
  }, [foods, query, category, country]);

  return (
    <>
      <FoodCreateForm />

      <div className="mt-8">
        <AdminSearch
          value={query}
          onChange={setQuery}
          placeholder="Buscar por nombre, id o categoría…"
          resultCount={filtered.length}
          totalCount={foods.length}
        />
      </div>

      <div className="mb-4 mt-6 flex flex-wrap gap-2">
        {countries.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setCountry(item)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              country === item
                ? "bg-sage-strong text-white"
                : "bg-sage-light text-foreground hover:bg-sage/30"
            }`}
          >
            {item}
          </button>
        ))}
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        {categories.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setCategory(item)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              category === item
                ? "bg-sage-strong text-white"
                : "bg-sage-light text-foreground hover:bg-sage/30"
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
              subtitle={`${food.country} · ${food.category} · ${food.portionText} · ${food.carbsG} g CHO · ${rations} ración${rations === 1 ? "" : "es"}`}
            >
              <FoodEditor food={food} />
            </CollapsiblePanel>
          );
        })}
      </div>
    </>
  );
}
