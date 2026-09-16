alter table public.patient_professional_contacts
  drop column if exists cadence_days;

alter table public.patient_professional_contacts
  add column if not exists repeat_mode text
  check (
    repeat_mode is null
    or repeat_mode in ('next_month', 'monthly')
  );

alter table public.patient_professional_contacts
  add column if not exists repeat_due_at timestamptz;

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

  update public.patient_professional_contacts
     set repeat_mode = case
           when repeat_mode = 'next_month' then null
           else repeat_mode
         end,
         repeat_due_at = case
           when repeat_mode = 'monthly' then now() + interval '1 month'
           else null
         end,
         updated_at = now()
   where patient_user_id = auth.uid()
     and professional_user_id = professional;

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
          coalesce(shares.share_count, 0)::int as share_count,
          c.repeat_mode,
          c.repeat_due_at
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
