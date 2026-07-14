create type public.meal_slot as enum ('desayuno', 'comida', 'cena', 'snack');

create table public.intake_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  food_id text not null references public.foods (id),
  meal_slot public.meal_slot not null,
  logged_at timestamptz not null default now(),
  local_date date not null,
  portion_multiplier numeric not null default 1 check (portion_multiplier > 0),
  carbs_g numeric not null,
  rations numeric not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index intake_entries_user_local_date_idx
  on public.intake_entries (user_id, local_date);

alter table public.intake_entries enable row level security;

create policy "Users read own intake entries"
  on public.intake_entries for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users insert own intake entries"
  on public.intake_entries for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Users update own intake entries"
  on public.intake_entries for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Users delete own intake entries"
  on public.intake_entries for delete
  to authenticated
  using ((select auth.uid()) = user_id);

grant select, insert, update, delete on public.intake_entries to authenticated;
