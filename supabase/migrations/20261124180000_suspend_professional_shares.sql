-- S2. Suspend new professional shares and close the contact insert tautology.
--
-- The insert policy on patient_professional_contacts compared
-- professional_report_shares columns with themselves. Any visible share made
-- EXISTS true, so a patient could name a different professional and a
-- professional who could see an incoming share could satisfy the check.
--
-- This file replaces that policy with one bound to the patient, the
-- professional, and an existing share between that pair. It also blocks
-- reassignment of the two user ids. INSERT and UPDATE are then revoked, and
-- share_report_with_professional / lookup_professional_by_share_code lose
-- EXECUTE for PUBLIC and for the explicit public roles. The corrected policy
-- stays in place so a later reopening does not restore the tautology.
--
-- After this migration:
--   patient_professional_contacts and professional_report_shares
--     anon, PUBLIC: no privileges
--     authenticated: SELECT, DELETE
--     service_role: SELECT, DELETE
--   share_report_with_professional, lookup_professional_by_share_code
--     PUBLIC, anon, authenticated, service_role: no EXECUTE
--   list_patient_share_recipients
--     authenticated: EXECUTE
--     PUBLIC, anon, service_role: no EXECUTE
--
-- Existing share and contact rows are not inserted, updated, or deleted.
-- Schema-wide default privileges are left as they are. They can still grant
-- broad rights on tables created later; they do not put INSERT, UPDATE,
-- TRUNCATE, or the suspended EXECUTE grants back on these objects.
-- Re-applying the statements below closes a grant that was restored by hand.
-- It does not grant INSERT, UPDATE, or EXECUTE on the suspended functions.
--
-- This file is one transaction. Do not wrap it in another. SET LOCAL applies
-- only until the single COMMIT at the end. The function body uses BEGIN/END
-- and does not commit.

begin;

-- LOCK STATEMENTS BEGIN
set local lock_timeout = '10s';
set local statement_timeout = '30s';

drop policy if exists "Patients insert own professional contacts"
  on public.patient_professional_contacts;

create policy "Patients insert own professional contacts"
  on public.patient_professional_contacts
  for insert
  to authenticated
  with check (
    (select auth.uid()) = patient_professional_contacts.patient_user_id
    and exists (
      select 1
      from public.professional_report_shares as share
      where share.patient_user_id = patient_professional_contacts.patient_user_id
        and share.professional_user_id = patient_professional_contacts.professional_user_id
        and share.patient_user_id = (select auth.uid())
    )
  );

create or replace function public.prevent_patient_professional_contact_reassignment()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if new.patient_user_id is distinct from old.patient_user_id
    or new.professional_user_id is distinct from old.professional_user_id then
    raise exception 'The patient and professional of a contact cannot be changed'
      using errcode = '23514';
  end if;
  return new;
end;
$$;

revoke all on function public.prevent_patient_professional_contact_reassignment()
  from public, anon, authenticated, service_role;

drop trigger if exists prevent_patient_professional_contact_reassignment
  on public.patient_professional_contacts;

create trigger prevent_patient_professional_contact_reassignment
  before update on public.patient_professional_contacts
  for each row
  execute function public.prevent_patient_professional_contact_reassignment();

revoke all on table public.patient_professional_contacts
  from public, anon, authenticated, service_role;
revoke all on table public.professional_report_shares
  from public, anon, authenticated, service_role;

grant select, delete on table public.patient_professional_contacts to authenticated;
grant select, delete on table public.professional_report_shares to authenticated;
grant select, delete on table public.patient_professional_contacts to service_role;
grant select, delete on table public.professional_report_shares to service_role;

revoke all on function public.share_report_with_professional(text, date, date, jsonb)
  from public, anon, authenticated, service_role;
revoke all on function public.lookup_professional_by_share_code(text)
  from public, anon, authenticated, service_role;
revoke all on function public.list_patient_share_recipients()
  from public, anon, service_role;
grant execute on function public.list_patient_share_recipients() to authenticated;
-- LOCK STATEMENTS END

commit;
