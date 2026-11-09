-- Match the fiber phrase the catalog already parses from notes.
update public.foods
set notes = replace(notes, 'Fibra ', ''),
    updated_at = now()
where id in (
  'sandia',
  'melon',
  'calabaza',
  'es-judias-verdes',
  'es-brocoli',
  'es-albaricoque',
  'es-zanahoria'
)
and notes like '%Fibra %g/100 g%';

update public.foods set notes = replace(notes, '0,5 g/100 g', '0,5 g fibra/100 g'), updated_at = now()
where id in ('sandia', 'calabaza') and notes like '%0,5 g/100 g%' and notes not like '%g fibra/100 g%';

update public.foods set notes = replace(notes, '1 g/100 g', '1 g fibra/100 g'), updated_at = now()
where id = 'melon' and notes like '%1 g/100 g%' and notes not like '%g fibra/100 g%';

update public.foods set notes = replace(notes, '2,25 g/100 g', '2,25 g fibra/100 g'), updated_at = now()
where id = 'es-judias-verdes' and notes not like '%g fibra/100 g%';

update public.foods set notes = replace(notes, '0,65 g/100 g', '0,65 g fibra/100 g'), updated_at = now()
where id = 'es-brocoli' and notes not like '%g fibra/100 g%';

update public.foods set notes = replace(notes, '2,1 g/100 g', '2,1 g fibra/100 g'), updated_at = now()
where id = 'es-albaricoque' and notes not like '%g fibra/100 g%';

update public.foods set notes = replace(notes, '2,6 g/100 g', '2,6 g fibra/100 g'), updated_at = now()
where id = 'es-zanahoria' and notes not like '%g fibra/100 g%';
