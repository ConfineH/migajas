export interface RegionProfile {
  id: string;
  name: string;
  flag: string;
  foodCountry: string;
  exchangeUnitG: number;
}

export const REGIONS: RegionProfile[] = [
  {
    id: "es",
    name: "España",
    flag: "🇪🇸",
    foodCountry: "España",
    exchangeUnitG: 10,
  },
  {
    id: "do",
    name: "República Dominicana",
    flag: "🇩🇴",
    foodCountry: "República Dominicana",
    exchangeUnitG: 15,
  },
];

export const DEFAULT_REGION_ID = "es";

export function getRegionById(id: string | null | undefined): RegionProfile {
  return REGIONS.find((region) => region.id === id) ?? REGIONS[0];
}

export function formatExchangeRule(region: RegionProfile): string {
  return `${region.exchangeUnitG} g de carbohidratos = 1 ración`;
}

export function formatHalfExchangeRule(region: RegionProfile): string {
  const half = region.exchangeUnitG / 2;
  const oneAndHalf = region.exchangeUnitG * 1.5;
  return `Puedes usar medios: ${half} g = 0,5 raciones, ${oneAndHalf} g = 1,5 raciones.`;
}

export function buildReferenceTips(region: RegionProfile): string[] {
  return [
    "Cuenta solo carbohidratos (HC), no el peso total del alimento.",
    `En ${region.name}: ${formatExchangeRule(region)}.`,
    formatHalfExchangeRule(region),
    "Los moduladores (pollo, huevo, pescado) aportan 0 raciones de HC.",
  ];
}

export function resolveRegionIdFromOnboarding(state: {
  regionId?: string;
  country?: string;
} | null): string {
  if (state?.regionId) return getRegionById(state.regionId).id;
  if (state?.country === "República Dominicana") return "do";
  return DEFAULT_REGION_ID;
}
