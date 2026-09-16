create or replace function public.lookup_professional_by_share_code(share_code text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  role_id text;
  display text;
begin
  if auth.uid() is null then
    raise exception 'No autenticado';
  end if;

  select p.professional_role,
         nullif(
           trim(
             coalesce(
               u.raw_user_meta_data ->> 'full_name',
               u.raw_user_meta_data ->> 'name',
               ''
             )
           ),
           ''
         )
    into role_id, display
  from public.user_profiles p
  join auth.users u on u.id = p.user_id
  where p.professional_share_code = share_code
    and p.is_professional
  limit 1;

  if role_id is null then
    return null;
  end if;

  return jsonb_build_object(
    'role', role_id,
    'display_name', display
  );
end;
$$;

revoke all on function public.lookup_professional_by_share_code(text) from public;
grant execute on function public.lookup_professional_by_share_code(text) to authenticated;

drop policy if exists "Patients delete own report shares" on public.professional_report_shares;

create policy "Patients delete own report shares"
  on public.professional_report_shares for delete
  to authenticated
  using ((select auth.uid()) = patient_user_id);

grant delete on public.professional_report_shares to authenticated;
