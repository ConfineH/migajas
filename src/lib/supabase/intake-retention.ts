import {
  getIntakeExpirationCutoffDate,
  getIntakeRetentionDays,
} from "@/lib/domain/intake-retention";
import { createServiceClient, isServiceRoleConfigured } from "@/lib/supabase/service";
import { isSupabaseConfigured } from "@/lib/supabase/client";

export async function purgeExpiredIntakeEntries(): Promise<{ deleted: number }> {
  if (!isSupabaseConfigured() || !isServiceRoleConfigured()) {
    return { deleted: 0 };
  }

  const retentionDays = getIntakeRetentionDays();
  const cutoffDate = getIntakeExpirationCutoffDate(retentionDays);
  const service = createServiceClient();

  const { data, error } = await service
    .from("intake_entries")
    .delete()
    .lt("local_date", cutoffDate)
    .select("id");

  if (error) {
    return { deleted: 0 };
  }

  return { deleted: data?.length ?? 0 };
}
