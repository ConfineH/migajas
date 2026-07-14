-- Harden admin metrics RPC: service_role only (Supabase advisor 0028)
REVOKE ALL ON FUNCTION public.get_org_dashboard_stats() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.get_org_dashboard_stats() FROM anon;
REVOKE ALL ON FUNCTION public.get_org_dashboard_stats() FROM authenticated;
GRANT EXECUTE ON FUNCTION public.get_org_dashboard_stats() TO service_role;
