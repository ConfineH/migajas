import { EXCHANGE_UNIT_G, calculateRations, formatRations } from "@/lib/domain/rations";

export interface ConversionRow {
  rations: number;
  carbsG: number;
}

export const REFERENCE_TIPS = [
  "Cuenta solo carbohidratos (HC), no el peso total del alimento.",
  "En España: 10 g de HC = 1 ración.",
  "Puedes usar medios: 5 g = 0,5 raciones, 15 g = 1,5 raciones.",
  "Los moduladores (pollo, huevo, pescado) aportan 0 raciones de HC.",
] as const;

export function buildConversionTable(
  maxRations = 5,
  step = 0.5,
): ConversionRow[] {
  const rows: ConversionRow[] = [];
  for (let rations = step; rations <= maxRations + 0.001; rations += step) {
    const rounded = Math.round(rations * 10) / 10;
    rows.push({
      rations: rounded,
      carbsG: rounded * EXCHANGE_UNIT_G,
    });
  }
  return rows;
}

export function carbsToRations(carbsG: number): number | null {
  if (!Number.isFinite(carbsG) || carbsG < 0) return null;
  return calculateRations(carbsG);
}

export function rationsToCarbs(rations: number): number | null {
  if (!Number.isFinite(rations) || rations < 0) return null;
  return rations * EXCHANGE_UNIT_G;
}

export function formatCarbsInput(value: number): string {
  if (!Number.isFinite(value)) return "—";
  return `${value} g`;
}

export function formatRationsResult(value: number): string {
  return `${formatRations(value)} ración${value === 1 ? "" : "es"}`;
}
