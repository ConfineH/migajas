export type LicenseeTerritory = "es" | "do";
export type LicenseeSupportTier = "basic" | "standard" | "premium";

export interface Licensee {
  id: string;
  name: string;
  territory: LicenseeTerritory;
  contractDate: string | null;
  supportTier: LicenseeSupportTier;
  contactEmail: string | null;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface LicenseeInput {
  name: string;
  territory: LicenseeTerritory;
  contractDate: string | null;
  supportTier: LicenseeSupportTier;
  contactEmail: string | null;
  notes: string;
}

const TERRITORIES: LicenseeTerritory[] = ["es", "do"];
const SUPPORT_TIERS: LicenseeSupportTier[] = ["basic", "standard", "premium"];

export function validateLicenseeInput(input: LicenseeInput): string | null {
  if (!input.name.trim()) return "Nombre requerido";
  if (!TERRITORIES.includes(input.territory)) return "Territorio inválido";
  if (!SUPPORT_TIERS.includes(input.supportTier)) return "Nivel de soporte inválido";
  if (input.contactEmail && !input.contactEmail.includes("@")) {
    return "Email de contacto inválido";
  }
  if (input.contractDate && !/^\d{4}-\d{2}-\d{2}$/.test(input.contractDate)) {
    return "Fecha de contrato inválida";
  }
  return null;
}

export function licenseeInputToRow(input: LicenseeInput) {
  return {
    name: input.name.trim(),
    territory: input.territory,
    contract_date: input.contractDate,
    support_tier: input.supportTier,
    contact_email: input.contactEmail?.trim() || null,
    notes: input.notes.trim(),
    updated_at: new Date().toISOString(),
  };
}

export function parseLicenseeRow(row: Record<string, unknown>): Licensee | null {
  const id = typeof row.id === "string" ? row.id : null;
  const name = typeof row.name === "string" ? row.name : null;
  const territory = row.territory;
  const supportTier = row.support_tier;
  const createdAt = typeof row.created_at === "string" ? row.created_at : null;
  const updatedAt = typeof row.updated_at === "string" ? row.updated_at : null;

  if (
    !id ||
    !name ||
    (territory !== "es" && territory !== "do") ||
    (supportTier !== "basic" &&
      supportTier !== "standard" &&
      supportTier !== "premium") ||
    !createdAt ||
    !updatedAt
  ) {
    return null;
  }

  return {
    id,
    name,
    territory,
    contractDate:
      typeof row.contract_date === "string" ? row.contract_date : null,
    supportTier,
    contactEmail:
      typeof row.contact_email === "string" ? row.contact_email : null,
    notes: typeof row.notes === "string" ? row.notes : "",
    createdAt,
    updatedAt,
  };
}

export const territoryLabels: Record<LicenseeTerritory, string> = {
  es: "España",
  do: "República Dominicana",
};

export const supportTierLabels: Record<LicenseeSupportTier, string> = {
  basic: "Básico",
  standard: "Estándar",
  premium: "Premium",
};
