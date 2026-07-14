import {
  MEAL_SLOTS,
  MEAL_SLOT_LABELS,
  type IntakeEntry,
  type MealSlot,
} from "@/lib/domain/intake";
import { validateLocalDate } from "@/lib/domain/intake";

export const MAX_EXPORT_RANGE_DAYS = 90;

export interface MealTotals {
  carbsG: number;
  rations: number;
}

export interface DailySummary {
  date: string;
  totalCarbsG: number;
  totalRations: number;
  meals: Partial<Record<MealSlot, MealTotals>>;
  goalPercent: number | null;
}

export interface RollupSummary {
  kind: "week" | "month";
  label: string;
  from: string;
  to: string;
  totalCarbsG: number;
  totalRations: number;
}

export interface TopFoodSummary {
  foodId: string;
  foodName: string;
  totalCarbsG: number;
  entryCount: number;
}

export interface ClinicalReport {
  from: string;
  to: string;
  goalG: number | null;
  days: DailySummary[];
  rollups: RollupSummary[];
  topFoods: TopFoodSummary[];
}

function parseLocalDate(value: string): Date {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

function formatLocalDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function daysBetweenInclusive(from: string, to: string): number {
  const start = parseLocalDate(from).getTime();
  const end = parseLocalDate(to).getTime();
  return Math.floor((end - start) / (24 * 60 * 60 * 1000)) + 1;
}

export function enumerateLocalDates(from: string, to: string): string[] {
  const dates: string[] = [];
  const cursor = parseLocalDate(from);
  const end = parseLocalDate(to);

  while (cursor.getTime() <= end.getTime()) {
    dates.push(formatLocalDate(cursor));
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }

  return dates;
}

function shiftLocalDate(date: string, offsetDays: number): string {
  const cursor = parseLocalDate(date);
  cursor.setUTCDate(cursor.getUTCDate() + offsetDays);
  return formatLocalDate(cursor);
}

export function parseExportRange(
  range: string,
  from?: string | null,
  to?: string | null,
  anchorDate = new Date(),
): { ok: true; from: string; to: string } | { ok: false; error: string } {
  const anchor = formatLocalDate(
    new Date(
      Date.UTC(
        anchorDate.getUTCFullYear(),
        anchorDate.getUTCMonth(),
        anchorDate.getUTCDate(),
      ),
    ),
  );

  if (range === "7d") {
    return { ok: true, from: shiftLocalDate(anchor, -6), to: anchor };
  }

  if (range === "30d") {
    return { ok: true, from: shiftLocalDate(anchor, -29), to: anchor };
  }

  if (range === "custom") {
    if (!from || !to || validateLocalDate(from) || validateLocalDate(to)) {
      return { ok: false, error: "Indica un rango de fechas válido." };
    }
    if (from > to) {
      return { ok: false, error: "La fecha inicial no puede ser posterior a la final." };
    }
    if (daysBetweenInclusive(from, to) > MAX_EXPORT_RANGE_DAYS) {
      return {
        ok: false,
        error: `El rango no puede superar ${MAX_EXPORT_RANGE_DAYS} días.`,
      };
    }
    return { ok: true, from, to };
  }

  return { ok: false, error: "Rango de exportación no válido." };
}

function emptyMealTotals(): Record<MealSlot, MealTotals> {
  return {
    desayuno: { carbsG: 0, rations: 0 },
    comida: { carbsG: 0, rations: 0 },
    cena: { carbsG: 0, rations: 0 },
    snack: { carbsG: 0, rations: 0 },
  };
}

function buildTopFoods(
  entries: Array<IntakeEntry & { foodName: string }>,
): TopFoodSummary[] {
  const totals = new Map<string, TopFoodSummary>();

  for (const entry of entries) {
    const existing = totals.get(entry.food_id);
    if (existing) {
      existing.totalCarbsG += entry.carbs_g;
      existing.entryCount += 1;
      continue;
    }
    totals.set(entry.food_id, {
      foodId: entry.food_id,
      foodName: entry.foodName,
      totalCarbsG: entry.carbs_g,
      entryCount: 1,
    });
  }

  return [...totals.values()].sort((a, b) => b.totalCarbsG - a.totalCarbsG);
}

function buildRollups(days: DailySummary[]): RollupSummary[] {
  const rollups: RollupSummary[] = [];

  if (days.length >= 7) {
    for (let index = 0; index < days.length; index += 7) {
      const chunk = days.slice(index, index + 7);
      rollups.push({
        kind: "week",
        label: `Semana ${Math.floor(index / 7) + 1}`,
        from: chunk[0].date,
        to: chunk[chunk.length - 1].date,
        totalCarbsG: chunk.reduce((sum, day) => sum + day.totalCarbsG, 0),
        totalRations: chunk.reduce((sum, day) => sum + day.totalRations, 0),
      });
    }
  }

  if (days.length >= 28) {
    const byMonth = new Map<string, DailySummary[]>();
    for (const day of days) {
      const monthKey = day.date.slice(0, 7);
      const bucket = byMonth.get(monthKey) ?? [];
      bucket.push(day);
      byMonth.set(monthKey, bucket);
    }

    for (const [monthKey, monthDays] of byMonth) {
      rollups.push({
        kind: "month",
        label: monthKey,
        from: monthDays[0].date,
        to: monthDays[monthDays.length - 1].date,
        totalCarbsG: monthDays.reduce((sum, day) => sum + day.totalCarbsG, 0),
        totalRations: monthDays.reduce((sum, day) => sum + day.totalRations, 0),
      });
    }
  }

  return rollups;
}

export function buildClinicalReport(
  entries: Array<IntakeEntry & { foodName: string }>,
  from: string,
  to: string,
  goalG: number | null,
  options?: { includeTopFoods?: boolean },
): ClinicalReport {
  const dates = enumerateLocalDates(from, to);
  const entriesInRange = entries.filter(
    (entry) => entry.local_date >= from && entry.local_date <= to,
  );

  const days = dates.map((date) => {
    const dayEntries = entriesInRange.filter(
      (entry) => entry.local_date === date,
    );
    const meals = emptyMealTotals();

    for (const entry of dayEntries) {
      meals[entry.meal_slot].carbsG += entry.carbs_g;
      meals[entry.meal_slot].rations += entry.rations;
    }

    const totalCarbsG = dayEntries.reduce((sum, entry) => sum + entry.carbs_g, 0);
    const totalRations = dayEntries.reduce((sum, entry) => sum + entry.rations, 0);
    const goalPercent =
      goalG && goalG > 0 ? Math.round((totalCarbsG / goalG) * 100) : null;

    const mealBreakdown = Object.fromEntries(
      MEAL_SLOTS.map((slot) => [slot, meals[slot]]),
    ) as Partial<Record<MealSlot, MealTotals>>;

    return {
      date,
      totalCarbsG,
      totalRations,
      meals: mealBreakdown,
      goalPercent,
    };
  });

  return {
    from,
    to,
    goalG,
    days,
    rollups: buildRollups(days),
    topFoods:
      options?.includeTopFoods === false
        ? []
        : buildTopFoods(entriesInRange),
  };
}
