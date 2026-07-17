"use client";

import Link from "next/link";
import { useState } from "react";
import { FoodSearchGrid } from "@/components/FoodSearchGrid";
import { SourcesPanel } from "@/components/content-sources/SourcesPanel";
import { GlycemicGuidePanel } from "@/components/reference-guide/GlycemicGuidePanel";
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
        <div className="callout-sage text-sm text-foreground">
          El listado completo de alimentos está en el{" "}
          <Link
            href="/catalog"
            className="font-semibold text-sage-strong underline-offset-2 hover:underline"
          >
            catálogo
          </Link>
          . Aquí tienes reglas y calculadora para consultar al vuelo.
        </div>
      ) : null}

      <div className="flex gap-1 rounded-full bg-sage-muted/40 p-1">
        {tabs.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTab(item.id)}
            className={`flex-1 rounded-full px-3 py-2 text-sm font-medium transition-all duration-200 ${
              tab === item.id
                ? "bg-surface text-foreground shadow-soft"
                : "text-muted hover:text-foreground"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {tab === "reglas" ? (
        <section className="space-y-4">
          <div className="callout-sage">
            <h2 className="font-display text-xl font-medium text-foreground">
              {regionFlag} {regionName}
            </h2>
            <p className="mt-2 text-foreground">
              <strong>{exchangeRuleLabel}</strong>
            </p>
            <p className="mt-2 text-sm text-muted">
              {regionId === "do"
                ? `Divide los gramos de carbohidratos entre ${exchangeUnitG} para obtener raciones.`
                : `Divide los gramos de HC entre ${exchangeUnitG} para obtener raciones.`}
            </p>
          </div>

          <div className="feature-card overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-sage-light/50 text-left text-muted">
                <tr>
                  <th className="px-4 py-3 font-medium">Raciones</th>
                  <th className="px-4 py-3 font-medium">Carbohidratos (g)</th>
                </tr>
              </thead>
              <tbody>
                {table.map((row) => (
                  <tr key={row.rations} className="border-t border-border/60">
                    <td className="px-4 py-3 font-medium text-foreground">
                      {formatRations(row.rations)}
                    </td>
                    <td className="px-4 py-3 text-muted">{row.carbsG} g</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <ul className="feature-card space-y-2 p-5 text-sm text-muted">
            {tips.map((tip) => (
              <li key={tip}>• {tip}</li>
            ))}
          </ul>
          {sources.length > 0 ? (
            <p className="text-center text-sm text-muted">
              Metodología y bibliografía en la pestaña{" "}
              <button
                type="button"
                onClick={() => setTab("fuentes")}
                className="font-medium text-sage-strong underline-offset-2 hover:underline"
              >
                Fuentes
              </button>
              .
            </p>
          ) : null}

          <GlycemicGuidePanel />
        </section>
      ) : null}

      {tab === "fuentes" && sources.length > 0 ? (
        <SourcesPanel sources={sources} />
      ) : null}

      {tab === "alimentos" && !freeMode ? (
        <section>
          <p className="mb-4 text-sm text-muted">
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
          <div className="feature-card p-5">
            <h2 className="font-medium text-foreground">Gramos → raciones</h2>
            <label className="mt-4 block text-sm text-muted">
              Carbohidratos (g)
              <input
                type="number"
                min="0"
                step="0.5"
                value={carbsInput}
                onChange={(event) => setCarbsInput(event.target.value)}
                className="field-input mt-1"
              />
            </label>
            <p className="mt-4 rounded-xl bg-sage-light px-3 py-2 text-sage-strong">
              {fromCarbs === null
                ? "Introduce un valor válido"
                : `${formatCarbsInput(carbsValue)} = ${formatRationsResult(fromCarbs)}`}
            </p>
          </div>

          <div className="feature-card p-5">
            <h2 className="font-medium text-foreground">Raciones → gramos</h2>
            <label className="mt-4 block text-sm text-muted">
              Raciones
              <input
                type="number"
                min="0"
                step="0.5"
                value={rationsInput}
                onChange={(event) => setRationsInput(event.target.value)}
                className="field-input mt-1"
              />
            </label>
            <p className="mt-4 rounded-xl bg-sage-light px-3 py-2 text-sage-strong">
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
