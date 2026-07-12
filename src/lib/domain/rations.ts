/** Spain standard: 10g carbohydrates = 1 ration */
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
