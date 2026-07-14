create or replace function public.get_org_dashboard_stats()
returns json
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_total_users bigint;
  v_active_30d bigint;
  v_avg_levels numeric;
  v_funnel json;
begin
  select count(*)::bigint
  into v_total_users
  from auth.users;

  select count(*)::bigint
  into v_active_30d
  from (
    select user_id
    from public.learning_events
    where created_at >= now() - interval '30 days'
    union
    select user_id
    from public.intake_entries
    where logged_at >= now() - interval '30 days'
  ) active_users;

  select coalesce(avg(levels_passed), 0)
  into v_avg_levels
  from (
    select (
      select count(*)::numeric
      from jsonb_array_elements(coalesce(uls.progress -> 'completions', '[]'::jsonb)) elem
      where coalesce((elem ->> 'passed')::boolean, false)
    ) as levels_passed
    from public.user_learning_state uls
  ) levels;

  select json_build_object(
    'lesson_starters',
    (
      select count(distinct user_id)::bigint
      from public.learning_events
      where event_type = 'lesson_completed'
    ),
    'nivel1_passed',
    (
      select count(distinct user_id)::bigint
      from public.learning_events
      where event_type = 'exam_passed'
        and payload ->> 'levelId' = 'nivel-1'
    ),
    'free_mode_unlocked',
    (
      select count(distinct user_id)::bigint
      from public.learning_events
      where event_type = 'free_mode_unlocked'
    )
  )
  into v_funnel;

  return json_build_object(
    'total_users', coalesce(v_total_users, 0),
    'active_30d', coalesce(v_active_30d, 0),
    'avg_levels_passed', round(coalesce(v_avg_levels, 0), 2),
    'funnel', v_funnel
  );
end;
$$;

revoke all on function public.get_org_dashboard_stats() from public;
revoke all on function public.get_org_dashboard_stats() from authenticated;
grant execute on function public.get_org_dashboard_stats() to service_role;
