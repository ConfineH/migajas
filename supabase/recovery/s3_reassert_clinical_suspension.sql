-- Re-assert S3. This is not an undo. It does not restore INSERT, UPDATE,
-- professional read access, or the removed contact policy. It does not
-- change rows. Run the migration file first on a database that does not
-- already have these objects; this file repeats the same statements and
-- can be run again after the migration.

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
