import { requireContentAdmin } from "@/lib/supabase/content-admin";
import {
  licenseeInputToRow,
  parseLicenseeRow,
  validateLicenseeInput,
  type Licensee,
  type LicenseeInput,
} from "@/lib/domain/licensees";
import { createServiceClient } from "@/lib/supabase/service";

export async function listLicensees(): Promise<Licensee[]> {
  await requireContentAdmin();
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("licensees")
    .select("*")
    .order("contract_date", { ascending: false, nullsFirst: false })
    .order("name", { ascending: true });

  if (error) throw new Error(error.message);
  return (data ?? [])
    .map((row) => parseLicenseeRow(row as Record<string, unknown>))
    .filter((row): row is Licensee => row !== null);
}

export async function createLicensee(input: LicenseeInput): Promise<string | null> {
  await requireContentAdmin();
  const error = validateLicenseeInput(input);
  if (error) return error;

  const supabase = createServiceClient();
  const { error: dbError } = await supabase.from("licensees").insert(licenseeInputToRow(input));
  if (dbError) return dbError.message;
  return null;
}

export async function updateLicensee(
  id: string,
  input: LicenseeInput,
): Promise<string | null> {
  await requireContentAdmin();
  const error = validateLicenseeInput(input);
  if (error) return error;
  if (!id.trim()) return "ID requerido";

  const supabase = createServiceClient();
  const { error: dbError } = await supabase
    .from("licensees")
    .update(licenseeInputToRow(input))
    .eq("id", id.trim());

  if (dbError) return dbError.message;
  return null;
}

export async function deleteLicensee(id: string): Promise<string | null> {
  await requireContentAdmin();
  if (!id.trim()) return "ID requerido";

  const supabase = createServiceClient();
  const { error: dbError } = await supabase.from("licensees").delete().eq("id", id.trim());
  if (dbError) return dbError.message;
  return null;
}
