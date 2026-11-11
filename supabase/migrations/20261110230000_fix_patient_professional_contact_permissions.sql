begin;

alter policy "Patients insert own professional contacts"
  on public.patient_professional_contacts
  with check (
    (select auth.uid()) = patient_professional_contacts.patient_user_id
    and exists (
      select 1
      from public.professional_report_shares as share
      where share.patient_user_id = patient_professional_contacts.patient_user_id
        and share.professional_user_id = patient_professional_contacts.professional_user_id
    )
  );

-- Contact metadata can change even after the underlying report is deleted.
-- A different patient or professional requires a separate contact.
create function public.prevent_patient_professional_contact_reassignment()
returns trigger
language plpgsql
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

revoke execute on function public.prevent_patient_professional_contact_reassignment()
  from public, anon, authenticated;

create trigger prevent_patient_professional_contact_reassignment
  before update on public.patient_professional_contacts
  for each row
  execute function public.prevent_patient_professional_contact_reassignment();

commit;
