create table public.foods (
  id text primary key,
  country text not null,
  category text not null,
  name text not null,
  portion_text text not null,
  grams numeric not null,
  carbs_g numeric not null,
  difficulty text not null check (difficulty in ('Baja', 'Media', 'Alta')),
  item_type text not null check (item_type in ('base', 'mixed', 'modulator')),
  notes text not null default '',
  updated_at timestamptz not null default now()
);

create table public.lessons (
  id text primary key,
  level_id text not null,
  order_index integer not null,
  title text not null,
  summary text not null,
  steps jsonb not null,
  updated_at timestamptz not null default now()
);

create table public.level_exams (
  level_id text primary key,
  title text not null,
  description text not null,
  exercise_ids jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.foods enable row level security;
alter table public.lessons enable row level security;
alter table public.level_exams enable row level security;

create policy "Public read foods"
  on public.foods for select
  to anon, authenticated
  using (true);

create policy "Public read lessons"
  on public.lessons for select
  to anon, authenticated
  using (true);

create policy "Public read level exams"
  on public.level_exams for select
  to anon, authenticated
  using (true);

grant select on public.foods to anon, authenticated;
grant select on public.lessons to anon, authenticated;
grant select on public.level_exams to anon, authenticated;

create table public.learning_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  event_type text not null,
  payload jsonb not null,
  created_at timestamptz not null default now()
);

alter table public.learning_events enable row level security;

create policy "Users insert own learning events"
  on public.learning_events for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Users read own learning events"
  on public.learning_events for select
  to authenticated
  using ((select auth.uid()) = user_id);

grant select, insert on public.learning_events to authenticated;
