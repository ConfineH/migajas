const DEFAULT_RETENTION_DAYS = 365;

export function getIntakeRetentionDays(
  envValue: string | undefined = process.env.INTAKE_RETENTION_DAYS,
): number {
  if (!envValue) return DEFAULT_RETENTION_DAYS;
  const parsed = Number(envValue);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    return DEFAULT_RETENTION_DAYS;
  }
  return parsed;
}

export function getIntakeExpirationCutoffDate(
  retentionDays: number,
  now: Date = new Date(),
): string {
  const cutoff = new Date(now);
  cutoff.setUTCDate(cutoff.getUTCDate() - retentionDays);
  return cutoff.toISOString().slice(0, 10);
}
