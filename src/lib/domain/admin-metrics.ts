export interface OrgDashboardFunnel {
  lessonStarters: number;
  nivel1Passed: number;
  freeModeUnlocked: number;
}

export interface OrgDashboardStats {
  totalUsers: number;
  active30d: number;
  avgLevelsPassed: number;
  funnel: OrgDashboardFunnel;
}

function toNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

export function parseOrgDashboardStats(raw: unknown): OrgDashboardStats | null {
  if (!raw || typeof raw !== "object") return null;
  const data = raw as Record<string, unknown>;
  const funnelRaw = data.funnel;
  if (!funnelRaw || typeof funnelRaw !== "object") return null;

  const totalUsers = toNumber(data.total_users);
  const active30d = toNumber(data.active_30d);
  const avgLevelsPassed = toNumber(data.avg_levels_passed);
  const funnel = funnelRaw as Record<string, unknown>;
  const lessonStarters = toNumber(funnel.lesson_starters);
  const nivel1Passed = toNumber(funnel.nivel1_passed);
  const freeModeUnlocked = toNumber(funnel.free_mode_unlocked);

  if (
    totalUsers === null ||
    active30d === null ||
    avgLevelsPassed === null ||
    lessonStarters === null ||
    nivel1Passed === null ||
    freeModeUnlocked === null
  ) {
    return null;
  }

  return {
    totalUsers,
    active30d,
    avgLevelsPassed,
    funnel: {
      lessonStarters,
      nivel1Passed,
      freeModeUnlocked,
    },
  };
}
