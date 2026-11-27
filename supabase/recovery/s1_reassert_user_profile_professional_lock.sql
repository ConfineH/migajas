-- Safe re-lock for S1. This is not a rollback.
--
-- Run this only if a later change drops
-- protect_user_profile_professional_columns or grants broader privileges
-- on public.user_profiles to anon or authenticated.
--
-- It recreates the same function, trigger, and narrow grants as
-- supabase/migrations/20261124120000_lock_user_profile_professional_columns.sql.
-- It does not GRANT ALL. It does not drop the lock. It does not insert,
-- update, or delete rows. Values written while the lock was missing stay
-- as they are; repairing those rows would be a separate, explicit change.
--
-- If a legitimate region or onboarding update fails while this lock is
-- installed, ship a forward migration that keeps the same invariant
-- (professional columns unchanged, except the exact service_role pair).
-- Do not drop the trigger while that fix is written.
--
-- Reverting the application route is independent. The old route can try
-- the write again; this lock still rejects the professional columns.

-- LOCK STATEMENTS BEGIN
create or replace function public.protect_user_profile_professional_columns()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
declare
  jwt_role text;
begin
  -- nullif rejects a blank claim. A null result is not service_role.
  jwt_role := nullif(auth.role(), '');

  if current_user = 'service_role' and jwt_role = 'service_role' then
    return new;
  end if;

  if tg_op = 'INSERT' then
    if new.is_professional is distinct from false
      or new.professional_role is not null
      or new.professional_share_code is not null then
      raise exception 'professional profile columns are locked'
        using errcode = '42501';
    end if;
    return new;
  end if;

  if new.is_professional is distinct from old.is_professional
    or new.professional_role is distinct from old.professional_role
    or new.professional_share_code is distinct from old.professional_share_code then
    raise exception 'professional profile columns are locked'
      using errcode = '42501';
  end if;

  return new;
end;
$$;

revoke all on function public.protect_user_profile_professional_columns()
  from PUBLIC, anon, authenticated, service_role;

drop trigger if exists protect_user_profile_professional_columns
  on public.user_profiles;

create trigger protect_user_profile_professional_columns
  before insert or update on public.user_profiles
  for each row
  execute function public.protect_user_profile_professional_columns();

revoke all on table public.user_profiles from PUBLIC, anon, authenticated;

grant select, insert, update on table public.user_profiles to authenticated;
-- LOCK STATEMENTS END
