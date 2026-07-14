/** Default exchange unit (Spain). Prefer region.exchangeUnitG when available. */
export const EXCHANGE_UNIT_G = 10;

export function calculateRations(
  carbsG: number,
  exchangeUnitG: number = EXCHANGE_UNIT_G,
): number {
  return carbsG / exchangeUnitG;
}

export function formatRations(rations: number): string {
  return rations.toFixed(1);
}
