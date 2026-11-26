-- S3. Suspend new clinical writes and professional reading of stored reports.
--
-- This file does not insert, update, or delete rows. It does not grant
-- EXECUTE on share_report_with_professional or lookup_professional_by_share_code.
-- Those functions stay revoked once S2 has been applied. Do not add those
-- grants here, and do not recreate the old contact INSERT policy: its WITH
-- CHECK compared each column with itself.
--
-- After this migration:
--   intake_entries: authenticated and service_role keep SELECT and DELETE.
--     INSERT and UPDATE are revoked. A trigger rejects them if a grant returns.
--   professional_report_shares: same SELECT and DELETE. The policy that let a
--     professional read a snapshot is dropped. Existing rows stay.
--   patient_professional_contacts: same SELECT and DELETE. INSERT and UPDATE
--     policies are dropped.
--   professional_contact_messages: authenticated keeps SELECT. service_role
--     keeps SELECT and DELETE so account deletion can remove sent messages.
--     INSERT is revoked and the insert policy is dropped.
--   user_profiles: region updates and a new educational profile still work.
--     A non-exempt caller cannot change daily_carb_goal_g, cannot turn
--     clinical_mode_enabled from false to true, and cannot insert a profile
--     that starts with clinical mode or a carb goal. Turning clinical mode
--     off stays allowed.
--
-- Exemption inside the profile trigger, both sides required and exact:
--   current_user = 'service_role' AND auth.role() = 'service_role'
-- postgres is not an exemption. The write trigger on intake, shares, contacts,
-- and messages has no exemption: a security-definer function still fires it.
--
-- Safe before or after S2. Applying this file does not deploy the app.
-- Do not recover by dropping these triggers or by restoring INSERT, UPDATE,
-- or the professional read policy. To put the suspension back, run
-- supabase/recovery/s3_reassert_clinical_suspension.sql

begin;

set local lock_timeout = '10s';
set local statement_timeout = '30s';

-- LOCK STATEMENTS BEGIN
create or replace function public.reject_suspended_clinical_write()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  raise exception 'writes to % are suspended', tg_table_name
    using errcode = '42501';
end;
$$;

revoke all on function public.reject_suspended_clinical_write()
  from public, anon, authenticated, service_role;

drop trigger if exists reject_suspended_clinical_write on public.intake_entries;
create trigger reject_suspended_clinical_write
  before insert or update on public.intake_entries
  for each row
  execute function public.reject_suspended_clinical_write();

drop trigger if exists reject_suspended_clinical_write on public.professional_report_shares;
create trigger reject_suspended_clinical_write
  before insert or update on public.professional_report_shares
  for each row
  execute function public.reject_suspended_clinical_write();

drop trigger if exists reject_suspended_clinical_write on public.patient_professional_contacts;
create trigger reject_suspended_clinical_write
  before insert or update on public.patient_professional_contacts
  for each row
  execute function public.reject_suspended_clinical_write();

drop trigger if exists reject_suspended_clinical_write on public.professional_contact_messages;
create trigger reject_suspended_clinical_write
  before insert or update on public.professional_contact_messages
  for each row
  execute function public.reject_suspended_clinical_write();

create or replace function public.protect_clinical_profile_columns()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
declare
  jwt_role text;
begin
  jwt_role := nullif(auth.role(), '');

  if current_user = 'service_role' and jwt_role = 'service_role' then
    return new;
  end if;

  if tg_op = 'INSERT' then
    if coalesce(new.clinical_mode_enabled, false) is true
      or new.daily_carb_goal_g is not null then
      raise exception 'clinical profile columns are suspended'
        using errcode = '42501';
    end if;
    return new;
  end if;

  if new.daily_carb_goal_g is distinct from old.daily_carb_goal_g then
    raise exception 'clinical profile columns are suspended'
      using errcode = '42501';
  end if;

  if coalesce(new.clinical_mode_enabled, false) is true
    and coalesce(old.clinical_mode_enabled, false) is distinct from true then
    raise exception 'clinical profile columns are suspended'
      using errcode = '42501';
  end if;

  return new;
end;
$$;

revoke all on function public.protect_clinical_profile_columns()
  from public, anon, authenticated, service_role;

drop trigger if exists protect_clinical_profile_columns on public.user_profiles;
create trigger protect_clinical_profile_columns
  before insert or update on public.user_profiles
  for each row
  execute function public.protect_clinical_profile_columns();

drop policy if exists "Users insert own intake entries" on public.intake_entries;
drop policy if exists "Users update own intake entries" on public.intake_entries;
drop policy if exists "Professionals read shares sent to them"
  on public.professional_report_shares;
drop policy if exists "Patients insert own professional contacts"
  on public.patient_professional_contacts;
drop policy if exists "Patients update own professional contacts"
  on public.patient_professional_contacts;
drop policy if exists "Professionals insert own contact messages"
  on public.professional_contact_messages;

revoke all on table public.intake_entries from public, anon, authenticated, service_role;
grant select, delete on table public.intake_entries to authenticated, service_role;

revoke all on table public.professional_report_shares
  from public, anon, authenticated, service_role;
grant select, delete on table public.professional_report_shares
  to authenticated, service_role;

revoke all on table public.patient_professional_contacts
  from public, anon, authenticated, service_role;
grant select, delete on table public.patient_professional_contacts
  to authenticated, service_role;

revoke all on table public.professional_contact_messages
  from public, anon, authenticated, service_role;
grant select on table public.professional_contact_messages to authenticated;
grant select, delete on table public.professional_contact_messages to service_role;
-- LOCK STATEMENTS END

commit;
