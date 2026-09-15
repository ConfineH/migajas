alter table public.user_profiles
  add column if not exists is_professional boolean not null default false,
  add column if not exists professional_role text
    check (
      professional_role is null
      or professional_role in (
        'endocrinologia',
        'nutricion',
        'medicina_familia',
        'educacion_diabetes',
        'otro'
      )
    ),
  add column if not exists professional_share_code text;

create unique index if not exists user_profiles_professional_share_code_key
  on public.user_profiles (professional_share_code)
  where professional_share_code is not null;

create table if not exists public.professional_report_shares (
  id uuid primary key default gen_random_uuid(),
  professional_user_id uuid not null references auth.users (id) on delete cascade,
  patient_user_id uuid not null references auth.users (id) on delete cascade,
  range_from date not null,
  range_to date not null,
  snapshot jsonb not null,
  created_at timestamptz not null default now()
);

create index if not exists professional_report_shares_professional_created_idx
  on public.professional_report_shares (professional_user_id, created_at desc);

alter table public.professional_report_shares enable row level security;

create policy "Patients read own report shares"
  on public.professional_report_shares for select
  to authenticated
  using ((select auth.uid()) = patient_user_id);

create policy "Professionals read shares sent to them"
  on public.professional_report_shares for select
  to authenticated
  using ((select auth.uid()) = professional_user_id);

grant select on public.professional_report_shares to authenticated;

create or replace function public.share_report_with_professional(
  share_code text,
  range_from date,
  range_to date,
  snapshot jsonb
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  professional uuid;
  new_id uuid;
begin
  if auth.uid() is null then
    raise exception 'No autenticado';
  end if;

  select p.user_id into professional
  from public.user_profiles p
  where p.professional_share_code = share_code
    and p.is_professional
  limit 1;

  if professional is null then
    raise exception 'Código de profesional no válido';
  end if;

  insert into public.professional_report_shares (
    professional_user_id,
    patient_user_id,
    range_from,
    range_to,
    snapshot
  ) values (
    professional,
    auth.uid(),
    range_from,
    range_to,
    snapshot
  )
  returning id into new_id;

  return new_id;
end;
$$;

revoke all on function public.share_report_with_professional(text, date, date, jsonb)
  from public;
grant execute on function public.share_report_with_professional(text, date, date, jsonb)
  to authenticated;

create table if not exists public.professional_contact_messages (
  id uuid primary key default gen_random_uuid(),
  professional_user_id uuid not null references auth.users (id) on delete cascade,
  subject text not null,
  body text not null,
  created_at timestamptz not null default now()
);

create index if not exists professional_contact_messages_user_created_idx
  on public.professional_contact_messages (professional_user_id, created_at desc);

alter table public.professional_contact_messages enable row level security;

create policy "Professionals insert own contact messages"
  on public.professional_contact_messages for insert
  to authenticated
  with check (
    (select auth.uid()) = professional_user_id
    and exists (
      select 1
      from public.user_profiles p
      where p.user_id = professional_user_id
        and p.is_professional
    )
  );

create policy "Professionals read own contact messages"
  on public.professional_contact_messages for select
  to authenticated
  using ((select auth.uid()) = professional_user_id);

grant select, insert on public.professional_contact_messages to authenticated;
