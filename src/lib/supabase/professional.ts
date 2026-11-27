import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import {
  createServiceClient,
  isServiceRoleConfigured,
} from "@/lib/supabase/service";
import type { ClinicalReport } from "@/lib/domain/clinical-report";
import {
  parsePatientShareRecipients,
  type PatientRecipientLabelId,
  type PatientShareRecipient,
  type RecipientRepeatMode,
} from "@/lib/domain/professional-profile";

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

export async function lookupProfessionalByShareCode(
  shareCode: string,
): Promise<{ role: string; display_name: string | null } | { error: string }> {
  void shareCode;
  return { error: "La comprobación de códigos profesionales no está disponible." };
}

export async function deleteSharesSentByPatient(patientUserId: string): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;
  const supabase = await createClient();
  const { error } = await supabase
    .from("professional_report_shares")
    .delete()
    .eq("patient_user_id", patientUserId);
  return !error;
}

export async function listPatientShareRecipients(): Promise<
  PatientShareRecipient[] | { error: string }
> {
  if (!isSupabaseConfigured()) {
    return { error: "No se pudo cargar a quién has enviado informes." };
  }
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("list_patient_share_recipients");
  if (error) {
    return { error: "No se pudo cargar a quién has enviado informes." };
  }
  return parsePatientShareRecipients(data);
}

export async function deleteSharesSentToProfessional(
  patientUserId: string,
  professionalUserId: string,
): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;
  const supabase = await createClient();
  const { error } = await supabase
    .from("professional_report_shares")
    .delete()
    .eq("patient_user_id", patientUserId)
    .eq("professional_user_id", professionalUserId);
  return !error;
}

export async function updatePatientRecipientContact(input: {
  patientUserId: string;
  professionalUserId: string;
  label?: PatientRecipientLabelId;
  repeatMode?: RecipientRepeatMode | null;
}): Promise<boolean> {
  void input;
  return false;
}

export async function shareReportWithProfessional(input: {
  shareCode: string;
  rangeFrom: string;
  rangeTo: string;
  snapshot: ClinicalReport;
}): Promise<{ id: string } | { error: string }> {
  void input;
  return { error: "El envío de informes no está disponible." };
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
