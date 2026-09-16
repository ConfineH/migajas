create index if not exists professional_report_shares_patient_created_idx
  on public.professional_report_shares (patient_user_id, created_at desc);

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
      select jsonb_agg(to_jsonb(t) order by t.last_sent_at desc)
      from (
        select
          s.professional_user_id,
          p.professional_share_code as share_code,
          p.professional_role as role,
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
          max(s.created_at) as last_sent_at,
          count(*)::int as share_count
        from public.professional_report_shares s
        join public.user_profiles p on p.user_id = s.professional_user_id
        join auth.users u on u.id = p.user_id
        where s.patient_user_id = auth.uid()
        group by
          s.professional_user_id,
          p.professional_share_code,
          p.professional_role,
          u.raw_user_meta_data
      ) t
    ),
    '[]'::jsonb
  );
end;
$$;

revoke all on function public.list_patient_share_recipients() from public;
grant execute on function public.list_patient_share_recipients() to authenticated;
