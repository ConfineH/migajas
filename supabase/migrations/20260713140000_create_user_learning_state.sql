create table public.user_learning_state (
  user_id uuid not null references auth.users(id) on delete cascade,
  progress jsonb not null default '{"completions":[],"completedLessons":[],"completedPracticeSteps":[],"freeModeUnlocked":false}'::jsonb,
  attempts jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now(),
  primary key (user_id)
);

alter table public.user_learning_state enable row level security;

create policy "Users read own learning state"
  on public.user_learning_state for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users insert own learning state"
  on public.user_learning_state for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Users update own learning state"
  on public.user_learning_state for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

grant select, insert, update on public.user_learning_state to authenticated;
