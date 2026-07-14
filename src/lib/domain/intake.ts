import { calculateRations } from "@/lib/domain/rations";
import { getRegionById } from "@/lib/domain/regions";
import type { RegionId } from "@/lib/domain/user-profile";
import type { FoodItem } from "@/lib/domain/foods";

export const MEAL_SLOTS = ["desayuno", "comida", "cena", "snack"] as const;
export type MealSlot = (typeof MEAL_SLOTS)[number];

export interface IntakeEntry {
  id: string;
  user_id: string;
  food_id: string;
  meal_slot: MealSlot;
  logged_at: string;
  local_date: string;
  portion_multiplier: number;
  carbs_g: number;
  rations: number;
}

export interface IntakeWriteInput {
  food_id: string;
  meal_slot: MealSlot;
  local_date: string;
  portion_multiplier?: number;
}

export interface IntakeEntryDraft {
  food_id: string;
  meal_slot: MealSlot;
  local_date: string;
  logged_at: string;
  portion_multiplier: number;
  carbs_g: number;
  rations: number;
}

const LOCAL_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export function isValidMealSlot(value: unknown): value is MealSlot {
  return typeof value === "string" && MEAL_SLOTS.includes(value as MealSlot);
}

export function validateLocalDate(value: unknown): string | null {
  if (typeof value !== "string" || !LOCAL_DATE_RE.test(value)) {
    return "Fecha local no válida.";
  }
  return null;
}

export function validatePortionMultiplier(value: unknown): number | null {
  const multiplier =
    value === undefined || value === null ? 1 : Number(value);
  if (!Number.isFinite(multiplier) || multiplier <= 0) {
    return null;
  }
  return multiplier;
}

export function validateIntakeWrite(
  input: unknown,
):
  | { ok: true; value: IntakeWriteInput }
  | { ok: false; error: string } {
  if (!input || typeof input !== "object") {
    return { ok: false, error: "Datos de ingesta no válidos." };
  }

  const body = input as Record<string, unknown>;
  const food_id = body.food_id;
  if (typeof food_id !== "string" || !food_id.trim()) {
    return { ok: false, error: "Alimento no válido." };
  }

  if (!isValidMealSlot(body.meal_slot)) {
    return { ok: false, error: "Comida no válida." };
  }

  const localDateError = validateLocalDate(body.local_date);
  if (localDateError) {
    return { ok: false, error: localDateError };
  }

  const portion_multiplier = validatePortionMultiplier(body.portion_multiplier);
  if (portion_multiplier === null) {
    return { ok: false, error: "Porción no válida." };
  }

  return {
    ok: true,
    value: {
      food_id,
      meal_slot: body.meal_slot,
      local_date: body.local_date as string,
      portion_multiplier,
    },
  };
}

export function assertSameDayEditable(
  entryLocalDate: string,
  requestLocalDate: string,
): string | null {
  if (entryLocalDate !== requestLocalDate) {
    return "Solo puedes editar entradas del día actual.";
  }
  return null;
}

export function buildIntakeEntry(
  input: IntakeWriteInput,
  food: FoodItem,
  regionId: RegionId,
  options?: { logged_at?: string },
): IntakeEntryDraft {
  const portion_multiplier = input.portion_multiplier ?? 1;
  const exchangeUnitG = getRegionById(regionId).exchangeUnitG;
  const carbs_g = food.carbsG * portion_multiplier;
  const rations = calculateRations(carbs_g, exchangeUnitG);

  return {
    food_id: food.id,
    meal_slot: input.meal_slot,
    local_date: input.local_date,
    logged_at: options?.logged_at ?? new Date().toISOString(),
    portion_multiplier,
    carbs_g,
    rations,
  };
}

export function sumDailyCarbs(
  entries: Array<Pick<IntakeEntry, "local_date" | "carbs_g">>,
  localDate: string,
): number {
  return entries
    .filter((entry) => entry.local_date === localDate)
    .reduce((sum, entry) => sum + entry.carbs_g, 0);
}

export const MEAL_SLOT_LABELS: Record<MealSlot, string> = {
  desayuno: "Desayuno",
  comida: "Comida",
  cena: "Cena",
  snack: "Snack",
};
