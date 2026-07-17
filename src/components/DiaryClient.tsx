"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/Button";
import { ClinicalExportPanel } from "@/components/ClinicalExportPanel";
import { StatCard } from "@/components/ui/StatCard";
import {
  MEAL_SLOTS,
  MEAL_SLOT_LABELS,
  sumDailyCarbs,
  type IntakeEntry,
  type MealSlot,
} from "@/lib/domain/intake";
import type { EnrichedFoodItem } from "@/lib/domain/foods";
import { formatRations } from "@/lib/domain/rations";

export interface DiaryEntryView extends IntakeEntry {
  foodName: string;
  portionText: string;
  editable: boolean;
}

interface DiaryClientProps {
  initialEntries: DiaryEntryView[];
  foods: EnrichedFoodItem[];
  localDate: string;
  dailyGoalG: number | null;
  exchangeRuleLabel: string;
}

function getLocalDateString(date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function DiaryClient({
  initialEntries,
  foods,
  localDate: initialLocalDate,
  dailyGoalG,
  exchangeRuleLabel,
}: DiaryClientProps) {
  const [entries, setEntries] = useState(initialEntries);
  const [localDate] = useState(initialLocalDate || getLocalDateString());
  const [query, setQuery] = useState("");
  const [selectedFoodId, setSelectedFoodId] = useState(foods[0]?.id ?? "");
  const [mealSlot, setMealSlot] = useState<MealSlot>("comida");
  const [portionMultiplier, setPortionMultiplier] = useState("1");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const filteredFoods = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return foods.slice(0, 8);
    return foods
      .filter((food) => food.name.toLowerCase().includes(normalized))
      .slice(0, 8);
  }, [foods, query]);

  const totalCarbs = sumDailyCarbs(entries, localDate);
  const goalProgress =
    dailyGoalG && dailyGoalG > 0
      ? Math.round((totalCarbs / dailyGoalG) * 100)
      : null;

  async function refreshEntries() {
    const response = await fetch(
      `/api/intake?local_date=${encodeURIComponent(localDate)}`,
    );
    if (!response.ok) return;
    const payload = (await response.json()) as { entries: IntakeEntry[] };
    setEntries(
      payload.entries.map((entry) => {
        const food = foods.find((item) => item.id === entry.food_id);
        return {
          ...entry,
          foodName: food?.name ?? entry.food_id,
          portionText: food?.portionText ?? "",
          editable: entry.local_date === localDate,
        };
      }),
    );
  }

  async function handleAdd() {
    setError(null);
    setBusy(true);
    try {
      const response = await fetch("/api/intake", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          food_id: selectedFoodId,
          meal_slot: mealSlot,
          local_date: localDate,
          portion_multiplier: Number(portionMultiplier),
        }),
      });
      const payload = (await response.json()) as { error?: string };
      if (!response.ok) {
        setError(payload.error ?? "No se pudo añadir la entrada.");
        return;
      }
      await refreshEntries();
    } finally {
      setBusy(false);
    }
  }

  async function handleUpdate(entryId: string, multiplier: number) {
    setError(null);
    setBusy(true);
    try {
      const response = await fetch("/api/intake", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: entryId,
          local_date: localDate,
          portion_multiplier: multiplier,
        }),
      });
      const payload = (await response.json()) as { error?: string };
      if (!response.ok) {
        setError(payload.error ?? "No se pudo actualizar la entrada.");
        return;
      }
      await refreshEntries();
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete(entryId: string) {
    setError(null);
    setBusy(true);
    try {
      const response = await fetch(
        `/api/intake?id=${encodeURIComponent(entryId)}&local_date=${encodeURIComponent(localDate)}`,
        { method: "DELETE" },
      );
      const payload = (await response.json()) as { error?: string };
      if (!response.ok) {
        setError(payload.error ?? "No se pudo eliminar la entrada.");
        return;
      }
      await refreshEntries();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="HC hoy" value={`${totalCarbs} g`} />
        <StatCard
          label="Raciones hoy"
          value={formatRations(
            entries
              .filter((entry) => entry.local_date === localDate)
              .reduce((sum, entry) => sum + entry.rations, 0),
          )}
        />
        <StatCard
          label="Meta diaria"
          value={dailyGoalG ? `${goalProgress}%` : "—"}
        />
      </div>

      {dailyGoalG ? (
        <p className="text-sm text-muted">
          Meta: {dailyGoalG} g de HC · {exchangeRuleLabel}
        </p>
      ) : null}

      {error ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      <section className="feature-card space-y-4 p-5">
        <h2 className="font-display text-lg font-medium text-foreground">Añadir alimento</h2>
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Buscar alimento..."
          className="field-input"
        />
        <select
          value={selectedFoodId}
          onChange={(event) => setSelectedFoodId(event.target.value)}
          className="field-input"
        >
          {filteredFoods.map((food) => (
            <option key={food.id} value={food.id}>
              {food.name} · {food.carbsG} g HC
            </option>
          ))}
        </select>
        <div className="grid gap-3 sm:grid-cols-2">
          <select
            value={mealSlot}
            onChange={(event) => setMealSlot(event.target.value as MealSlot)}
            className="field-input"
          >
            {MEAL_SLOTS.map((slot) => (
              <option key={slot} value={slot}>
                {MEAL_SLOT_LABELS[slot]}
              </option>
            ))}
          </select>
          <input
            type="number"
            min={0.5}
            step={0.5}
            value={portionMultiplier}
            onChange={(event) => setPortionMultiplier(event.target.value)}
            className="field-input"
            aria-label="Multiplicador de porción"
          />
        </div>
        <Button onClick={handleAdd} disabled={busy || !selectedFoodId}>
          Registrar
        </Button>
      </section>

      <section className="space-y-4">
        <h2 className="font-display text-lg font-medium text-foreground">Hoy</h2>
        {entries.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-border p-8 text-center text-muted">
            Aún no has registrado alimentos hoy.
          </p>
        ) : (
          <div className="space-y-3">
            {entries.map((entry) => (
              <article
                key={entry.id}
                className="feature-card p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-foreground">{entry.foodName}</p>
                    <p className="text-sm text-muted">
                      {MEAL_SLOT_LABELS[entry.meal_slot]} · {entry.portionText} ·{" "}
                      {entry.carbs_g} g HC · {formatRations(entry.rations)} raciones
                    </p>
                  </div>
                  {entry.editable ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min={0.5}
                        step={0.5}
                        defaultValue={entry.portion_multiplier}
                        className="field-input w-20 px-2 py-1 text-sm"
                        onBlur={(event) => {
                          const value = Number(event.target.value);
                          if (
                            Number.isFinite(value) &&
                            value > 0 &&
                            value !== entry.portion_multiplier
                          ) {
                            void handleUpdate(entry.id, value);
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => void handleDelete(entry.id)}
                        className="text-sm font-medium text-red-600 hover:text-red-700"
                      >
                        Eliminar
                      </button>
                    </div>
                  ) : (
                    <span className="text-xs text-muted">Solo lectura</span>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <ClinicalExportPanel />
    </div>
  );
}
