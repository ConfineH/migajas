export function parseAdminEmails(raw: string | undefined): string[] {
  if (!raw?.trim()) return [];
  return raw
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

export function isContentAdmin(
  email: string | null | undefined,
  adminEmails: string[] = parseAdminEmails(process.env.ADMIN_EMAILS),
): boolean {
  if (!email) return false;
  return adminEmails.includes(email.trim().toLowerCase());
}
