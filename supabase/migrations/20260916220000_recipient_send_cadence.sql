alter table public.patient_professional_contacts
  add column if not exists cadence_days integer
  check (cadence_days is null or cadence_days in (7, 14, 30));

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
          c.cadence_days
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
