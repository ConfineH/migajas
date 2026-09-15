import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import {
  createServiceClient,
  isServiceRoleConfigured,
} from "@/lib/supabase/service";
import type { ClinicalReport } from "@/lib/domain/clinical-report";

export interface ProfessionalShareRow {
  id: string;
  professional_user_id: string;
  patient_user_id: string;
  range_from: string;
  range_to: string;
  snapshot: ClinicalReport;
  created_at: string;
}

export interface ProfessionalContactRow {
  id: string;
  subject: string;
  body: string;
  created_at: string;
}

export async function listSharesForProfessional(
  professionalUserId: string,
): Promise<ProfessionalShareRow[]> {
  if (!isSupabaseConfigured()) return [];
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("professional_report_shares")
    .select(
      "id, professional_user_id, patient_user_id, range_from, range_to, snapshot, created_at",
    )
    .eq("professional_user_id", professionalUserId)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error || !data) return [];
  return data as ProfessionalShareRow[];
}

export async function getShareForProfessional(
  professionalUserId: string,
  shareId: string,
): Promise<ProfessionalShareRow | null> {
  if (!isSupabaseConfigured()) return null;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("professional_report_shares")
    .select(
      "id, professional_user_id, patient_user_id, range_from, range_to, snapshot, created_at",
    )
    .eq("professional_user_id", professionalUserId)
    .eq("id", shareId)
    .maybeSingle();

  if (error || !data) return null;
  return data as ProfessionalShareRow;
}

export async function shareReportWithProfessional(input: {
  shareCode: string;
  rangeFrom: string;
  rangeTo: string;
  snapshot: ClinicalReport;
}): Promise<{ id: string } | { error: string }> {
  if (!isSupabaseConfigured()) {
    return { error: "No se pudo enviar el informe." };
  }
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("share_report_with_professional", {
    share_code: input.shareCode,
    range_from: input.rangeFrom,
    range_to: input.rangeTo,
    snapshot: input.snapshot,
  });

  if (error) {
    if (error.message.includes("no válido")) {
      return { error: "Ese código no corresponde a un profesional." };
    }
    return { error: "No se pudo enviar el informe." };
  }
  return { id: String(data) };
}

export async function insertProfessionalContact(input: {
  professionalUserId: string;
  subject: string;
  body: string;
}): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;
  const supabase = await createClient();
  const { error } = await supabase.from("professional_contact_messages").insert({
    professional_user_id: input.professionalUserId,
    subject: input.subject,
    body: input.body,
  });
  return !error;
}

export async function listProfessionalContacts(
  professionalUserId: string,
): Promise<ProfessionalContactRow[]> {
  if (!isSupabaseConfigured()) return [];
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("professional_contact_messages")
    .select("id, subject, body, created_at")
    .eq("professional_user_id", professionalUserId)
    .order("created_at", { ascending: false })
    .limit(20);

  if (error || !data) return [];
  return data as ProfessionalContactRow[];
}

export async function listAllProfessionalContactsForAdmin(): Promise<
  Array<ProfessionalContactRow & { professional_user_id: string }>
> {
  if (!isServiceRoleConfigured()) return [];
  const service = createServiceClient();
  const { data, error } = await service
    .from("professional_contact_messages")
    .select("id, professional_user_id, subject, body, created_at")
    .order("created_at", { ascending: false })
    .limit(50);
  if (error || !data) return [];
  return data as Array<ProfessionalContactRow & { professional_user_id: string }>;
}
