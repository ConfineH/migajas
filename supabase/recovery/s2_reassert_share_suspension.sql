-- Re-apply the S2 suspension if a grant or the old insert policy comes back.
-- Safe to run more than once. Does not insert, update, or delete rows.
-- Does not grant INSERT, UPDATE, TRUNCATE, or EXECUTE on
-- share_report_with_professional or lookup_professional_by_share_code.
-- Does not change default privileges and does not reopen sharing.

-- LOCK STATEMENTS BEGIN
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
