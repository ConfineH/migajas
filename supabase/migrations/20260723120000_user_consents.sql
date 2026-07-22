create table public.user_consents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  consent_type text not null check (
    consent_type in ('health_data', 'cookie_preferences', 'privacy_policy')
  ),
  legal_version text not null,
  granted_at timestamptz not null default now(),
  revoked_at timestamptz,
  metadata jsonb not null default '{}'::jsonb
);

create index user_consents_user_type_idx
  on public.user_consents (user_id, consent_type, granted_at desc);

alter table public.user_consents enable row level security;

create policy "Users read own consents"
  on public.user_consents for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users insert own consents"
  on public.user_consents for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Users update own consents"
  on public.user_consents for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

grant select, insert, update on public.user_consents to authenticated;
