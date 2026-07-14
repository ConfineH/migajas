import { calculateRations, formatRations } from "@/lib/domain/rations";

export interface ConversionRow {
  rations: number;
  carbsG: number;
}

export function buildReferenceTips(exchangeUnitG: number, regionName: string): string[] {
  const half = exchangeUnitG / 2;
  const oneAndHalf = exchangeUnitG * 1.5;
  return [
    "Cuenta solo carbohidratos (HC), no el peso total del alimento.",
    `En ${regionName}: ${exchangeUnitG} g de HC = 1 ración.`,
    `Puedes usar medios: ${half} g = 0,5 raciones, ${oneAndHalf} g = 1,5 raciones.`,
    "Los moduladores (pollo, huevo, pescado) aportan 0 raciones de HC.",
  ];
}

export function buildConversionTable(
  exchangeUnitG: number,
  maxRations = 5,
  step = 0.5,
): ConversionRow[] {
  const rows: ConversionRow[] = [];
  for (let rations = step; rations <= maxRations + 0.001; rations += step) {
    const rounded = Math.round(rations * 10) / 10;
    rows.push({
      rations: rounded,
      carbsG: rounded * exchangeUnitG,
    });
  }
  return rows;
}

export function carbsToRations(
  carbsG: number,
  exchangeUnitG: number,
): number | null {
  if (!Number.isFinite(carbsG) || carbsG < 0) return null;
  return calculateRations(carbsG, exchangeUnitG);
}

export function rationsToCarbs(
  rations: number,
  exchangeUnitG: number,
): number | null {
  if (!Number.isFinite(rations) || rations < 0) return null;
  return rations * exchangeUnitG;
}

export function formatCarbsInput(value: number): string {
  if (!Number.isFinite(value)) return "—";
  return `${value} g`;
}

export function formatRationsResult(value: number): string {
  return `${formatRations(value)} ración${value === 1 ? "" : "es"}`;
}
