import type { IntakeEntry, IntakeEntryDraft } from "@/lib/domain/intake";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/client";

function parseEntry(row: {
  id: string;
  user_id: string;
  food_id: string;
  meal_slot: string;
  logged_at: string;
  local_date: string;
  portion_multiplier: number;
  carbs_g: number;
  rations: number;
}): IntakeEntry {
  return {
    id: row.id,
    user_id: row.user_id,
    food_id: row.food_id,
    meal_slot: row.meal_slot as IntakeEntry["meal_slot"],
    logged_at: row.logged_at,
    local_date: row.local_date,
    portion_multiplier: Number(row.portion_multiplier),
    carbs_g: Number(row.carbs_g),
    rations: Number(row.rations),
  };
}

export async function listIntakeEntries(
  userId: string,
  fromDate: string,
  toDate: string,
): Promise<IntakeEntry[]> {
  if (!isSupabaseConfigured()) return [];

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("intake_entries")
    .select(
      "id, user_id, food_id, meal_slot, logged_at, local_date, portion_multiplier, carbs_g, rations",
    )
    .eq("user_id", userId)
    .gte("local_date", fromDate)
    .lte("local_date", toDate)
    .order("logged_at", { ascending: true });

  if (error || !data) return [];
  return data.map(parseEntry);
}

export async function getIntakeEntry(
  userId: string,
  entryId: string,
): Promise<IntakeEntry | null> {
  if (!isSupabaseConfigured()) return null;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("intake_entries")
    .select(
      "id, user_id, food_id, meal_slot, logged_at, local_date, portion_multiplier, carbs_g, rations",
    )
    .eq("user_id", userId)
    .eq("id", entryId)
    .maybeSingle();

  if (error || !data) return null;
  return parseEntry(data);
}

export async function insertIntakeEntry(
  userId: string,
  draft: IntakeEntryDraft,
): Promise<IntakeEntry | null> {
  if (!isSupabaseConfigured()) return null;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("intake_entries")
    .insert({
      user_id: userId,
      food_id: draft.food_id,
      meal_slot: draft.meal_slot,
      logged_at: draft.logged_at,
      local_date: draft.local_date,
      portion_multiplier: draft.portion_multiplier,
      carbs_g: draft.carbs_g,
      rations: draft.rations,
    })
    .select(
      "id, user_id, food_id, meal_slot, logged_at, local_date, portion_multiplier, carbs_g, rations",
    )
    .single();

  if (error || !data) return null;
  return parseEntry(data);
}

export async function updateIntakeEntry(
  userId: string,
  entryId: string,
  draft: IntakeEntryDraft,
): Promise<IntakeEntry | null> {
  if (!isSupabaseConfigured()) return null;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("intake_entries")
    .update({
      portion_multiplier: draft.portion_multiplier,
      carbs_g: draft.carbs_g,
      rations: draft.rations,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", userId)
    .eq("id", entryId)
    .select(
      "id, user_id, food_id, meal_slot, logged_at, local_date, portion_multiplier, carbs_g, rations",
    )
    .single();

  if (error || !data) return null;
  return parseEntry(data);
}

export async function deleteIntakeEntry(
  userId: string,
  entryId: string,
): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;

  const supabase = await createClient();
  const { error } = await supabase
    .from("intake_entries")
    .delete()
    .eq("user_id", userId)
    .eq("id", entryId);

  return !error;
}
