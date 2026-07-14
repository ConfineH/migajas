"use client";

import { useState } from "react";
import { FoodCard } from "@/components/FoodCard";
import type { EnrichedFoodItem } from "@/lib/domain/foods";
import {
  enrichFoods,
  filterAndSearch,
  getCategories,
} from "@/lib/domain/foods";
import {
  REFERENCE_TIPS,
  buildConversionTable,
  carbsToRations,
  formatCarbsInput,
  formatRationsResult,
  rationsToCarbs,
} from "@/lib/domain/reference-guide";
import { formatRations } from "@/lib/domain/rations";

type TabId = "reglas" | "alimentos" | "calculadora";

interface ReferenceGuideClientProps {
  foods: EnrichedFoodItem[];
}

export function ReferenceGuideClient({ foods }: ReferenceGuideClientProps) {
  const [tab, setTab] = useState<TabId>("reglas");
  const [category, setCategory] = useState("Todas");
  const [query, setQuery] = useState("");
  const [carbsInput, setCarbsInput] = useState("15");
  const [rationsInput, setRationsInput] = useState("1.5");

  const categories = ["Todas", ...getCategories(foods)];
  const filtered = enrichFoods(filterAndSearch(foods, category, query));
  const table = buildConversionTable(5, 0.5);
  const carbsValue = Number(carbsInput.replace(",", "."));
  const rationsValue = Number(rationsInput.replace(",", "."));
  const fromCarbs = carbsToRations(carbsValue);
  const fromRations = rationsToCarbs(rationsValue);

  const tabs: { id: TabId; label: string }[] = [
    { id: "reglas", label: "Reglas" },
    { id: "alimentos", label: "Alimentos" },
    { id: "calculadora", label: "Calculadora" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex gap-1 rounded-xl bg-gray-100 p-1">
        {tabs.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTab(item.id)}
            className={`flex-1 rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
              tab === item.id
                ? "bg-white text-emerald-800 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {tab === "reglas" ? (
        <section className="space-y-4">
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
            <h2 className="font-bold text-emerald-900">España</h2>
            <p className="mt-2 text-emerald-800">
              <strong>10 g de carbohidratos = 1 ración</strong>
            </p>
            <p className="mt-2 text-sm text-emerald-700">
              Divide los gramos de HC entre 10 para obtener raciones.
            </p>
          </div>

          <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-left text-gray-600">
                <tr>
                  <th className="px-4 py-3 font-semibold">Raciones</th>
                  <th className="px-4 py-3 font-semibold">Carbohidratos (g)</th>
                </tr>
              </thead>
              <tbody>
                {table.map((row) => (
                  <tr key={row.rations} className="border-t border-gray-100">
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {formatRations(row.rations)}
                    </td>
                    <td className="px-4 py-3 text-gray-700">{row.carbsG} g</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <ul className="space-y-2 rounded-2xl border border-gray-100 bg-white p-5 text-sm text-gray-700">
            {REFERENCE_TIPS.map((tip) => (
              <li key={tip}>• {tip}</li>
            ))}
          </ul>
        </section>
      ) : null}

      {tab === "alimentos" ? (
        <section className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              type="search"
              placeholder="Buscar alimento..."
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="flex-1 rounded-xl border border-emerald-200 px-4 py-3 text-base focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
              aria-label="Buscar alimento"
            />
            <select
              value={category}
              onChange={(event) => setCategory(event.target.value)}
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
            {filtered.length} alimento{filtered.length !== 1 ? "s" : ""}
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            {filtered.map((food) => (
              <FoodCard key={food.id} food={food} />
            ))}
          </div>
        </section>
      ) : null}

      {tab === "calculadora" ? (
        <section className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-emerald-100 bg-white p-5">
            <h2 className="font-semibold text-gray-900">Gramos → raciones</h2>
            <label className="mt-4 block text-sm text-gray-600">
              Carbohidratos (g)
              <input
                type="number"
                min="0"
                step="0.5"
                value={carbsInput}
                onChange={(event) => setCarbsInput(event.target.value)}
                className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2"
              />
            </label>
            <p className="mt-4 rounded-lg bg-emerald-50 px-3 py-2 text-emerald-800">
              {fromCarbs === null
                ? "Introduce un valor válido"
                : `${formatCarbsInput(carbsValue)} = ${formatRationsResult(fromCarbs)}`}
            </p>
          </div>

          <div className="rounded-2xl border border-emerald-100 bg-white p-5">
            <h2 className="font-semibold text-gray-900">Raciones → gramos</h2>
            <label className="mt-4 block text-sm text-gray-600">
              Raciones
              <input
                type="number"
                min="0"
                step="0.5"
                value={rationsInput}
                onChange={(event) => setRationsInput(event.target.value)}
                className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2"
              />
            </label>
            <p className="mt-4 rounded-lg bg-emerald-50 px-3 py-2 text-emerald-800">
              {fromRations === null
                ? "Introduce un valor válido"
                : `${formatRations(rationsValue)} ración${rationsValue === 1 ? "" : "es"} = ${fromRations} g de HC`}
            </p>
          </div>
        </section>
      ) : null}
    </div>
  );
}
