alter table public.level_exams
  add column if not exists pool_exercise_ids jsonb,
  add column if not exists questions_per_exam integer not null default 4;

update public.level_exams
set
  pool_exercise_ids = coalesce(pool_exercise_ids, exercise_ids),
  questions_per_exam = case
    when level_id = 'nivel-5' then 5
    else coalesce(questions_per_exam, 4)
  end
where pool_exercise_ids is null or questions_per_exam is null;

alter table public.level_exams
  alter column pool_exercise_ids set not null;
