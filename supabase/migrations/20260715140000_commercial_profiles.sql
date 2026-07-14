create table public.user_profiles (
  user_id uuid not null references auth.users (id) on delete cascade,
  region_id text not null default 'es' check (region_id in ('es', 'do')),
  daily_carb_goal_g integer check (daily_carb_goal_g is null or daily_carb_goal_g > 0),
  clinical_mode_enabled boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id)
);

alter table public.user_profiles enable row level security;

create policy "Users read own profile"
  on public.user_profiles for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users insert own profile"
  on public.user_profiles for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Users update own profile"
  on public.user_profiles for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

grant select, insert, update on public.user_profiles to authenticated;
