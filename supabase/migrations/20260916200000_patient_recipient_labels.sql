create table if not exists public.patient_professional_contacts (
  patient_user_id uuid not null references auth.users (id) on delete cascade,
  professional_user_id uuid not null references auth.users (id) on delete cascade,
  label text not null
    check (
      label in (
        'endocrinologia',
        'nutricion',
        'medicina_familia',
        'educacion_diabetes',
        'otro'
      )
    ),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (patient_user_id, professional_user_id)
);

create index if not exists patient_professional_contacts_professional_idx
  on public.patient_professional_contacts (professional_user_id);

alter table public.patient_professional_contacts enable row level security;

drop policy if exists "Patients read own professional contacts"
  on public.patient_professional_contacts;
drop policy if exists "Patients insert own professional contacts"
  on public.patient_professional_contacts;
drop policy if exists "Patients update own professional contacts"
  on public.patient_professional_contacts;
drop policy if exists "Patients delete own professional contacts"
  on public.patient_professional_contacts;

create policy "Patients read own professional contacts"
  on public.patient_professional_contacts for select
  to authenticated
  using ((select auth.uid()) = patient_user_id);

create policy "Patients insert own professional contacts"
  on public.patient_professional_contacts for insert
  to authenticated
  with check (
    (select auth.uid()) = patient_user_id
    and exists (
      select 1
      from public.professional_report_shares s
      where s.patient_user_id = patient_user_id
        and s.professional_user_id = professional_user_id
    )
  );

create policy "Patients update own professional contacts"
  on public.patient_professional_contacts for update
  to authenticated
  using ((select auth.uid()) = patient_user_id)
  with check ((select auth.uid()) = patient_user_id);

create policy "Patients delete own professional contacts"
  on public.patient_professional_contacts for delete
  to authenticated
  using ((select auth.uid()) = patient_user_id);

grant select, insert, update, delete on public.patient_professional_contacts
  to authenticated;

insert into public.patient_professional_contacts (
  patient_user_id,
  professional_user_id,
  label
)
select
  s.patient_user_id,
  s.professional_user_id,
  coalesce(p.professional_role, 'otro')
from (
  select distinct patient_user_id, professional_user_id
  from public.professional_report_shares
) s
join public.user_profiles p on p.user_id = s.professional_user_id
on conflict (patient_user_id, professional_user_id) do nothing;

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
  default_label text;
begin
  if auth.uid() is null then
    raise exception 'No autenticado';
  end if;

  select p.user_id, coalesce(p.professional_role, 'otro')
    into professional, default_label
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

  insert into public.patient_professional_contacts (
    patient_user_id,
    professional_user_id,
    label
  ) values (
    auth.uid(),
    professional,
    default_label
  )
  on conflict (patient_user_id, professional_user_id) do nothing;

  return new_id;
end;
$$;

create or replace function public.list_patient_share_recipients()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'No autenticado';
  end if;

  return coalesce(
    (
      select jsonb_agg(to_jsonb(t) order by t.last_sent_at desc nulls last)
      from (
        select
          keys.professional_user_id,
          p.professional_share_code as share_code,
          coalesce(p.professional_role, c.label, 'otro') as role,
          coalesce(c.label, p.professional_role, 'otro') as label,
          nullif(
            trim(
              coalesce(
                u.raw_user_meta_data ->> 'full_name',
                u.raw_user_meta_data ->> 'name',
                ''
              )
            ),
            ''
          ) as display_name,
          shares.last_sent_at,
          coalesce(shares.share_count, 0)::int as share_count
        from (
          select professional_user_id
          from public.patient_professional_contacts
          where patient_user_id = auth.uid()
          union
          select professional_user_id
          from public.professional_report_shares
          where patient_user_id = auth.uid()
        ) keys
        join public.user_profiles p on p.user_id = keys.professional_user_id
        join auth.users u on u.id = p.user_id
        left join public.patient_professional_contacts c
          on c.patient_user_id = auth.uid()
         and c.professional_user_id = keys.professional_user_id
        left join (
          select
            professional_user_id,
            max(created_at) as last_sent_at,
            count(*)::int as share_count
          from public.professional_report_shares
          where patient_user_id = auth.uid()
          group by professional_user_id
        ) shares on shares.professional_user_id = keys.professional_user_id
      ) t
    ),
    '[]'::jsonb
  );
end;
$$;
