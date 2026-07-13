import type { AuthUserSummary } from "@/lib/domain/auth";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/client";

export async function getAuthUser(): Promise<AuthUserSummary | null> {
  if (!isSupabaseConfigured()) return null;

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;

    const metadata = user.user_metadata as Record<string, string | undefined>;

    return {
      id: user.id,
      email: user.email ?? null,
      displayName: metadata.full_name ?? metadata.name ?? null,
      provider:
        (user.app_metadata?.provider as string | undefined) ?? "google",
    };
  } catch {
    return null;
  }
}
