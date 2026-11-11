-- Harden admin metrics RPC: service_role only (Supabase advisor 0028)
-- The function is created later, in 20260715160000_commercial_admin_rpc.sql.
-- When it already exists, the same revoke still runs.
do $lock_admin_rpc$
begin
  if to_regprocedure('public.get_org_dashboard_stats()') is not null then
    revoke all on function public.get_org_dashboard_stats() from public;
    revoke all on function public.get_org_dashboard_stats() from anon;
    revoke all on function public.get_org_dashboard_stats() from authenticated;
    grant execute on function public.get_org_dashboard_stats() to service_role;
  end if;
end
$lock_admin_rpc$;
