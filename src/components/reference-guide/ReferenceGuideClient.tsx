"use client";

import Link from "next/link";
import { useState } from "react";
import { FoodSearchGrid } from "@/components/FoodSearchGrid";
import { SourcesPanel } from "@/components/content-sources/SourcesPanel";
import type { ContentSource } from "@/lib/domain/content-sources";
import type { EnrichedFoodItem } from "@/lib/domain/foods";
import {
  buildConversionTable,
  carbsToRations,
  formatCarbsInput,
  formatRationsResult,
  rationsToCarbs,
} from "@/lib/domain/reference-guide";
import { formatRations } from "@/lib/domain/rations";

type TabId = "reglas" | "alimentos" | "calculadora" | "fuentes";

interface ReferenceGuideClientProps {
  foods: EnrichedFoodItem[];
  freeMode: boolean;
  regionName: string;
  regionFlag: string;
  regionId?: string;
  exchangeUnitG: number;
  tips: string[];
  sources: ContentSource[];
  initialTab?: TabId;
}

export function ReferenceGuideClient({
  foods,
  freeMode,
  regionName,
  regionFlag,
  regionId = "es",
  exchangeUnitG,
  tips,
  sources,
  initialTab,
}: ReferenceGuideClientProps) {
  const [tab, setTab] = useState<TabId>(initialTab ?? "reglas");
  const [carbsInput, setCarbsInput] = useState(String(exchangeUnitG));
  const [rationsInput, setRationsInput] = useState("1.5");

  const table = buildConversionTable(exchangeUnitG, 5, 0.5);
  const carbsValue = Number(carbsInput.replace(",", "."));
  const rationsValue = Number(rationsInput.replace(",", "."));
  const fromCarbs = carbsToRations(carbsValue, exchangeUnitG);
  const fromRations = rationsToCarbs(rationsValue, exchangeUnitG);
  const exchangeRuleLabel = `${exchangeUnitG} g de carbohidratos = 1 ración`;

  const tabs: { id: TabId; label: string }[] = [
    { id: "reglas", label: "Reglas" },
    ...(!freeMode ? [{ id: "alimentos" as const, label: "Alimentos" }] : []),
    { id: "calculadora", label: "Calculadora" },
    ...(sources.length > 0 ? [{ id: "fuentes" as const, label: "Fuentes" }] : []),
  ];

  return (
    <div className="space-y-6">
      {freeMode ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
          El listado completo de alimentos está en el{" "}
          <Link href="/catalog" className="font-semibold underline">
            catálogo
          </Link>
          . Aquí tienes reglas y calculadora para consultar al vuelo.
        </div>
      ) : null}

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
            <h2 className="font-bold text-emerald-900">
              {regionFlag} {regionName}
            </h2>
            <p className="mt-2 text-emerald-800">
              <strong>{exchangeRuleLabel}</strong>
            </p>
            <p className="mt-2 text-sm text-emerald-700">
              {regionId === "do"
                ? `Divide los gramos de carbohidratos entre ${exchangeUnitG} para obtener raciones.`
                : `Divide los gramos de HC entre ${exchangeUnitG} para obtener raciones.`}
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
            {tips.map((tip) => (
              <li key={tip}>• {tip}</li>
            ))}
          </ul>
          {sources.length > 0 ? (
            <p className="text-center text-sm text-gray-500">
              Metodología y bibliografía en la pestaña{" "}
              <button
                type="button"
                onClick={() => setTab("fuentes")}
                className="font-semibold text-emerald-700 hover:text-emerald-900"
              >
                Fuentes
              </button>
              .
            </p>
          ) : null}
        </section>
      ) : null}

      {tab === "fuentes" && sources.length > 0 ? (
        <SourcesPanel sources={sources} />
      ) : null}

      {tab === "alimentos" && !freeMode ? (
        <section>
          <p className="mb-4 text-sm text-gray-600">
            Consulta rápida durante el curso. Tras aprobar el examen del nivel 1,
            el catálogo completo queda en el menú principal.
          </p>
          <FoodSearchGrid
            foods={foods}
            exchangeUnitG={exchangeUnitG}
            exchangeRuleLabel={exchangeRuleLabel}
            regionId={regionId}
          />
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
