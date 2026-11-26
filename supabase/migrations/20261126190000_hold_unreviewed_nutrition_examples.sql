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
end $$;
