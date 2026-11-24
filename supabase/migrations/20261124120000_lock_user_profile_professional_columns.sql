-- S1. Block self-declared professional columns on public.user_profiles.
--
-- Privileges read from the production catalog on 24 Nov 2026. That session
-- only ran SELECT against the catalog. It did not change data.
--   anon, authenticated, service_role: ALL, including TRUNCATE.
--   Source of that ALL: default privileges on schema public (arwdDxtm).
--   Historical migrations only add GRANT SELECT, INSERT, UPDATE to authenticated.
--
-- After this migration:
--   anon: no privileges on user_profiles
--   authenticated: SELECT, INSERT, UPDATE
--   service_role: unchanged
--   PUBLIC: no privileges on user_profiles
--
-- Exemption inside the trigger, both sides required and exact:
--   current_user = 'service_role' AND auth.role() = 'service_role'
-- auth.role() reads the JWT role (request.jwt.claim.role, otherwise
-- request.jwt.claims ->> 'role'). current_user is the database role of the
-- statement. A null or blank JWT role is not an exemption. postgres is not
-- an exemption. A service_role JWT while current_user is another role is
-- not an exemption. The function is SECURITY INVOKER so current_user stays
-- the caller; SECURITY DEFINER would replace it with the owner.
--
-- Depends on Supabase auth.role() remaining executable by the roles that
-- write their own profile. This file does not insert, update, or delete rows.
--
-- Deploy this migration and the app route as separate changes. Either order
-- fails closed. Preferred order: this migration first, then the app. Until
-- the app is deployed, POST /api/professional/activate still attempts the
-- write and the trigger rejects it.
--
-- Do not recover by dropping this trigger or by restoring GRANT ALL.
-- To put the lock back after a later regression, run
-- supabase/recovery/s1_reassert_user_profile_professional_lock.sql
-- which repeats the statements between the markers and does not rewrite rows.

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
