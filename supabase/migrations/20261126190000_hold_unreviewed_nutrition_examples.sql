-- Holds lesson copy whose gram figures do not match the catalog.
-- Does not change foods, attempts, profiles, intake, shares, or contacts.
-- Exercise prompts live in the app bundle, not in these tables.
-- Do not apply until this content change is explicitly authorized.

update public.lessons as lesson
set
  steps = (
    select jsonb_agg(
      case step->>'id'
        when 'l1-lesson-2-s4' then (step - 'foodId') || jsonb_build_object(
          'title', 'Ejemplo con una etiqueta hipotética',
          'body', 'Etiqueta hipotética, no la ficha de un alimento: 125 g × 5 g HC/100 g = 6,25 g HC ≈ 0,6 raciones. El peso del envase no es el número de raciones.'
        )
        else step
      end
      order by ord
    )
    from jsonb_array_elements(lesson.steps) with ordinality as item(step, ord)
  ),
  updated_at = now()
where lesson.id = 'l1-lesson-2';

update public.lessons as lesson
set
  steps = (
    select jsonb_agg(
      case step->>'id'
        when 'l1-lesson-5-s3' then step || jsonb_build_object(
          'body', '1 vaso de leche (200 ml) = ~10 g HC (1 ración). El yogur natural se cuenta con la porción de su ficha; una etiqueta hipotética de 5 g por 100 g no es esa ficha. Los lácteos azucarados tienen más.'
        )
        else step
      end
      order by ord
    )
    from jsonb_array_elements(lesson.steps) with ordinality as item(step, ord)
  ),
  updated_at = now()
where lesson.id = 'l1-lesson-5';

update public.lessons as lesson
set
  steps = (
    select jsonb_agg(
      case step->>'id'
        when 'l2-lesson-2-s1a' then (step - 'foodId') || jsonb_build_object(
          'title', 'Patata asada',
          'body', 'La cifra de la patata asada está en revisión y no se enseña como un valor validado. Al horno pierde agua y el hidrato se concentra.'
        )
        when 'l2-lesson-2-s3' then (step - 'foodId') || jsonb_build_object(
          'title', 'Puré instantáneo',
          'body', 'El puré de sobre puede llevar leche en polvo y almidones. La cifra de hidratos de esta ficha está en revisión y no se usa en la lección ni en el examen. No cuenta como verdura libre.'
        )
        else step
      end
      order by ord
    )
    from jsonb_array_elements(lesson.steps) with ordinality as item(step, ord)
  ),
  updated_at = now()
where lesson.id = 'l2-lesson-2';

update public.lessons as lesson
set
  steps = (
    select jsonb_agg(
      case
        when step->>'id' = 'l2-lesson-3-s1' then (step - 'foodId') || jsonb_build_object(
          'title', 'Lentejas cocidas',
          'body', 'La cifra de un plato de lentejas cocidas está en revisión y no se usa en la lección ni en el examen. Las lentejas cocidas sí cuentan como carbohidratos.'
        )
        when step->>'id' = 'l2-lesson-3-s2' then (step - 'foodId') || jsonb_build_object(
          'title', 'Garbanzos y alubias',
          'body', 'Las cifras de garbanzos y alubias cocidos están en revisión y no se usan en la lección ni en el examen. Cuentan como carbohidratos.'
        )
        when step->>'id' = 'l2-lesson-3-practice' then step || jsonb_build_object(
          'exerciseId', 'ex-l2-3-label-rations'
        )
        else step
      end
      order by ord
    )
    from jsonb_array_elements(lesson.steps) with ordinality as item(step, ord)
  ),
  updated_at = now()
where lesson.id = 'l2-lesson-3';

do $$
declare
  held int;
begin
  select count(*) into held
  from public.lessons lesson
  cross join lateral jsonb_array_elements(lesson.steps) as step
  where (lesson.id, step->>'id') in (
    ('l1-lesson-2', 'l1-lesson-2-s4'),
    ('l2-lesson-2', 'l2-lesson-2-s3'),
    ('l2-lesson-3', 'l2-lesson-3-s1'),
    ('l2-lesson-3', 'l2-lesson-3-s2')
  )
  and step ? 'foodId';

  if held <> 0 then
    raise exception 'nutrition hold left a catalog card on a withdrawn example';
  end if;

  if exists (select 1 from public.lessons where id = 'l2-lesson-2')
    and not exists (
      select 1
      from public.lessons lesson
      cross join lateral jsonb_array_elements(lesson.steps) as step
      where lesson.id = 'l2-lesson-2'
        and step->>'id' = 'l2-lesson-2-s1a'
        and not (step ? 'foodId')
    ) then
    raise exception 'roasted potato example was not withdrawn';
  end if;
end $$;

update public.level_exams as exam
set
  pool_exercise_ids = (
    select coalesce(jsonb_agg(
      case value
        when 'ex-l2-3-legumes-counting' then to_jsonb('ex-l2-3-label-rations'::text)
        when 'n2-ex6' then to_jsonb('n2-ex6-legume-identify'::text)
        when 'n2-ex7' then to_jsonb('n2-ex7-label-rations'::text)
        when 'n2-ex9' then to_jsonb('n2-ex9-label-rations'::text)
        else to_jsonb(value)
      end
      order by ord
    ), '[]'::jsonb)
    from jsonb_array_elements_text(exam.pool_exercise_ids) with ordinality as item(value, ord)
  ),
  exercise_ids = (
    select coalesce(jsonb_agg(
      case value
        when 'ex-l2-3-legumes-counting' then to_jsonb('ex-l2-3-label-rations'::text)
        when 'n2-ex6' then to_jsonb('n2-ex6-legume-identify'::text)
        when 'n2-ex7' then to_jsonb('n2-ex7-label-rations'::text)
        when 'n2-ex9' then to_jsonb('n2-ex9-label-rations'::text)
        else to_jsonb(value)
      end
      order by ord
    ), '[]'::jsonb)
    from jsonb_array_elements_text(exam.exercise_ids) with ordinality as item(value, ord)
  ),
  updated_at = now()
where exam.level_id = 'nivel-2';
