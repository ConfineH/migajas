-- Licensees registry for B2B commercial operations (service_role only)
create table public.licensees (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  territory text not null check (territory in ('es', 'do')),
  contract_date date,
  support_tier text not null default 'basic' check (
    support_tier in ('basic', 'standard', 'premium')
  ),
  contact_email text,
  notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.licensees enable row level security;

grant all on public.licensees to service_role;

-- Extended org dashboard stats (aggregates only, no PII)
create or replace function public.get_org_dashboard_stats()
returns json
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_total_users bigint;
  v_active_7d bigint;
  v_active_30d bigint;
  v_avg_levels numeric;
  v_funnel json;
  v_regions json;
  v_clinical json;
  v_diary_active_30d bigint;
  v_retention json;
  v_consents json;
begin
  select count(*)::bigint
  into v_total_users
  from auth.users;

  select count(*)::bigint
  into v_active_7d
  from (
    select user_id
    from public.learning_events
    where created_at >= now() - interval '7 days'
    union
    select user_id
    from public.intake_entries
    where logged_at >= now() - interval '7 days'
  ) active_users;

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
    'nivel2_passed',
    (
      select count(distinct user_id)::bigint
      from public.learning_events
      where event_type = 'exam_passed'
        and payload ->> 'levelId' = 'nivel-2'
    ),
    'nivel3_passed',
    (
      select count(distinct user_id)::bigint
      from public.learning_events
      where event_type = 'exam_passed'
        and payload ->> 'levelId' = 'nivel-3'
    ),
    'nivel4_passed',
    (
      select count(distinct user_id)::bigint
      from public.learning_events
      where event_type = 'exam_passed'
        and payload ->> 'levelId' = 'nivel-4'
    ),
    'nivel5_passed',
    (
      select count(distinct user_id)::bigint
      from public.learning_events
      where event_type = 'exam_passed'
        and payload ->> 'levelId' = 'nivel-5'
    ),
    'free_mode_unlocked',
    (
      select count(distinct user_id)::bigint
      from public.learning_events
      where event_type = 'free_mode_unlocked'
    )
  )
  into v_funnel;

  select json_build_object(
    'es',
    coalesce((
      select count(*)::bigint
      from public.user_profiles
      where region_id = 'es'
    ), 0),
    'do',
    coalesce((
      select count(*)::bigint
      from public.user_profiles
      where region_id = 'do'
    ), 0),
    'unknown',
    coalesce((
      select count(*)::bigint
      from auth.users u
      where not exists (
        select 1
        from public.user_profiles p
        where p.user_id = u.id
      )
    ), 0)
  )
  into v_regions;

  select json_build_object(
    'profiles_count',
    coalesce((select count(*)::bigint from public.user_profiles), 0),
    'enabled_count',
    coalesce((
      select count(*)::bigint
      from public.user_profiles
      where clinical_mode_enabled
    ), 0),
    'enabled_pct',
    round(
      100.0 * coalesce((
        select count(*)::bigint
        from public.user_profiles
        where clinical_mode_enabled
      ), 0)
      / greatest((select count(*)::bigint from public.user_profiles), 1),
      1
    )
  )
  into v_clinical;

  select count(distinct user_id)::bigint
  into v_diary_active_30d
  from public.intake_entries
  where logged_at >= now() - interval '30 days';

  select json_build_object(
    'retention_7d_pct',
    round(
      100.0 * (
        select count(distinct active.user_id)
        from auth.users cohort
        inner join (
          select user_id
          from public.learning_events
          where created_at >= now() - interval '7 days'
          union
          select user_id
          from public.intake_entries
          where logged_at >= now() - interval '7 days'
        ) active on active.user_id = cohort.id
        where cohort.created_at <= now() - interval '7 days'
      )
      / greatest((
        select count(*)::bigint
        from auth.users
        where created_at <= now() - interval '7 days'
      ), 1),
      1
    ),
    'retention_30d_pct',
    round(
      100.0 * (
        select count(distinct active.user_id)
        from auth.users cohort
        inner join (
          select user_id
          from public.learning_events
          where created_at >= now() - interval '30 days'
          union
          select user_id
          from public.intake_entries
          where logged_at >= now() - interval '30 days'
        ) active on active.user_id = cohort.id
        where cohort.created_at <= now() - interval '30 days'
      )
      / greatest((
        select count(*)::bigint
        from auth.users
        where created_at <= now() - interval '30 days'
      ), 1),
      1
    )
  )
  into v_retention;

  select json_build_object(
    'by_type',
    coalesce((
      select json_agg(
        json_build_object(
          'consent_type', consent_type,
          'active_grants', active_grants,
          'revoked', revoked
        )
        order by consent_type
      )
      from (
        select
          consent_type,
          count(*) filter (where revoked_at is null)::bigint as active_grants,
          count(*) filter (where revoked_at is not null)::bigint as revoked
        from public.user_consents
        group by consent_type
      ) grouped
    ), '[]'::json),
    'by_version',
    coalesce((
      select json_agg(
        json_build_object(
          'consent_type', consent_type,
          'legal_version', legal_version,
          'active_grants', active_grants
        )
        order by consent_type, legal_version
      )
      from (
        select
          consent_type,
          legal_version,
          count(*)::bigint as active_grants
        from public.user_consents
        where revoked_at is null
        group by consent_type, legal_version
      ) grouped
    ), '[]'::json)
  )
  into v_consents;

  return json_build_object(
    'total_users', coalesce(v_total_users, 0),
    'active_7d', coalesce(v_active_7d, 0),
    'active_30d', coalesce(v_active_30d, 0),
    'avg_levels_passed', round(coalesce(v_avg_levels, 0), 2),
    'funnel', v_funnel,
    'regions', v_regions,
    'clinical', v_clinical,
    'diary_active_30d', coalesce(v_diary_active_30d, 0),
    'retention', v_retention,
    'consents', v_consents
  );
end;
$$;

revoke all on function public.get_org_dashboard_stats() from public;
revoke all on function public.get_org_dashboard_stats() from authenticated;
grant execute on function public.get_org_dashboard_stats() to service_role;
