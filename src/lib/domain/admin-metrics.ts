export interface OrgDashboardFunnel {
  lessonStarters: number;
  nivel1Passed: number;
  nivel2Passed: number;
  nivel3Passed: number;
  nivel4Passed: number;
  nivel5Passed: number;
  freeModeUnlocked: number;
}

export interface OrgDashboardRegions {
  es: number;
  do: number;
  unknown: number;
}

export interface OrgDashboardClinical {
  profilesCount: number;
  enabledCount: number;
  enabledPct: number;
}

export interface OrgDashboardRetention {
  retention7dPct: number;
  retention30dPct: number;
}

export interface ConsentTypeSummary {
  consentType: string;
  activeGrants: number;
  revoked: number;
}

export interface ConsentVersionSummary {
  consentType: string;
  legalVersion: string;
  activeGrants: number;
}

export interface OrgDashboardConsents {
  byType: ConsentTypeSummary[];
  byVersion: ConsentVersionSummary[];
}

export interface OrgDashboardStats {
  totalUsers: number;
  active7d: number;
  active30d: number;
  avgLevelsPassed: number;
  funnel: OrgDashboardFunnel;
  regions: OrgDashboardRegions;
  clinical: OrgDashboardClinical;
  diaryActive30d: number;
  retention: OrgDashboardRetention;
  consents: OrgDashboardConsents;
}

function toNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function parseFunnel(raw: unknown): OrgDashboardFunnel | null {
  if (!raw || typeof raw !== "object") return null;
  const funnel = raw as Record<string, unknown>;
  const lessonStarters = toNumber(funnel.lesson_starters);
  const nivel1Passed = toNumber(funnel.nivel1_passed);
  const nivel2Passed = toNumber(funnel.nivel2_passed);
  const nivel3Passed = toNumber(funnel.nivel3_passed);
  const nivel4Passed = toNumber(funnel.nivel4_passed);
  const nivel5Passed = toNumber(funnel.nivel5_passed);
  const freeModeUnlocked = toNumber(funnel.free_mode_unlocked);

  if (
    lessonStarters === null ||
    nivel1Passed === null ||
    nivel2Passed === null ||
    nivel3Passed === null ||
    nivel4Passed === null ||
    nivel5Passed === null ||
    freeModeUnlocked === null
  ) {
    return null;
  }

  return {
    lessonStarters,
    nivel1Passed,
    nivel2Passed,
    nivel3Passed,
    nivel4Passed,
    nivel5Passed,
    freeModeUnlocked,
  };
}

function parseRegions(raw: unknown): OrgDashboardRegions | null {
  if (!raw || typeof raw !== "object") return null;
  const regions = raw as Record<string, unknown>;
  const es = toNumber(regions.es);
  const doCount = toNumber(regions.do);
  const unknown = toNumber(regions.unknown);
  if (es === null || doCount === null || unknown === null) return null;
  return { es, do: doCount, unknown };
}

function parseClinical(raw: unknown): OrgDashboardClinical | null {
  if (!raw || typeof raw !== "object") return null;
  const clinical = raw as Record<string, unknown>;
  const profilesCount = toNumber(clinical.profiles_count);
  const enabledCount = toNumber(clinical.enabled_count);
  const enabledPct = toNumber(clinical.enabled_pct);
  if (profilesCount === null || enabledCount === null || enabledPct === null) {
    return null;
  }
  return { profilesCount, enabledCount, enabledPct };
}

function parseRetention(raw: unknown): OrgDashboardRetention | null {
  if (!raw || typeof raw !== "object") return null;
  const retention = raw as Record<string, unknown>;
  const retention7dPct = toNumber(retention.retention_7d_pct);
  const retention30dPct = toNumber(retention.retention_30d_pct);
  if (retention7dPct === null || retention30dPct === null) return null;
  return { retention7dPct, retention30dPct };
}

function parseConsents(raw: unknown): OrgDashboardConsents | null {
  if (!raw || typeof raw !== "object") return null;
  const consents = raw as Record<string, unknown>;
  const byTypeRaw = consents.by_type;
  const byVersionRaw = consents.by_version;
  if (!Array.isArray(byTypeRaw) || !Array.isArray(byVersionRaw)) return null;

  const byType: ConsentTypeSummary[] = [];
  for (const item of byTypeRaw) {
    if (!item || typeof item !== "object") return null;
    const row = item as Record<string, unknown>;
    const consentType = typeof row.consent_type === "string" ? row.consent_type : null;
    const activeGrants = toNumber(row.active_grants);
    const revoked = toNumber(row.revoked);
    if (!consentType || activeGrants === null || revoked === null) return null;
    byType.push({ consentType, activeGrants, revoked });
  }

  const byVersion: ConsentVersionSummary[] = [];
  for (const item of byVersionRaw) {
    if (!item || typeof item !== "object") return null;
    const row = item as Record<string, unknown>;
    const consentType = typeof row.consent_type === "string" ? row.consent_type : null;
    const legalVersion =
      typeof row.legal_version === "string" ? row.legal_version : null;
    const activeGrants = toNumber(row.active_grants);
    if (!consentType || !legalVersion || activeGrants === null) return null;
    byVersion.push({ consentType, legalVersion, activeGrants });
  }

  return { byType, byVersion };
}

export function parseOrgDashboardStats(raw: unknown): OrgDashboardStats | null {
  if (!raw || typeof raw !== "object") return null;
  const data = raw as Record<string, unknown>;

  const totalUsers = toNumber(data.total_users);
  const active7d = toNumber(data.active_7d);
  const active30d = toNumber(data.active_30d);
  const avgLevelsPassed = toNumber(data.avg_levels_passed);
  const funnel = parseFunnel(data.funnel);
  const regions = parseRegions(data.regions);
  const clinical = parseClinical(data.clinical);
  const diaryActive30d = toNumber(data.diary_active_30d);
  const retention = parseRetention(data.retention);
  const consents = parseConsents(data.consents);

  if (
    totalUsers === null ||
    active7d === null ||
    active30d === null ||
    avgLevelsPassed === null ||
    !funnel ||
    !regions ||
    !clinical ||
    diaryActive30d === null ||
    !retention ||
    !consents
  ) {
    return null;
  }

  return {
    totalUsers,
    active7d,
    active30d,
    avgLevelsPassed,
    funnel,
    regions,
    clinical,
    diaryActive30d,
    retention,
    consents,
  };
}
