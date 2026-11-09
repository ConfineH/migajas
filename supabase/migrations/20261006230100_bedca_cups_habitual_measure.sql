-- BEDCA density for cups that had been forced to a round ration, plus household measure.
alter table public.foods add column if not exists habitual_measure jsonb;

update public.foods as f
set carbs_g = v.carbs_g,
    notes = v.notes,
    habitual_measure = v.habitual_measure,
    updated_at = now()
from (values
('sandia', 6.8, 'BEDCA2 f_id 2247 Sandía: 4,5 g HC/100 g (carbohidratos). 1 taza (150 g) = 6,8 g HC. Fibra 0,5 g/100 g, no se suma. Murillo 3ª ed. redondea 200 g = 1 ración (5 g/100 g).', '{"label":"Tajada grande","grams":200}'::jsonb),
('melon', 9, 'BEDCA2 f_id 2234 Melón: 6 g HC/100 g (carbohidratos). 1 taza (150 g) = 9 g HC. Fibra 1 g/100 g, no se suma. Murillo 3ª ed. redondea 200 g = 1 ración (5 g/100 g).', '{"label":"Tajada mediana","grams":200}'::jsonb),
('zanahoria', 4, 'BEDCA no publica zanahoria hervida. Murillo 3ª ed.: 200 g = 10 g HC (5 g/100 g). 80 g = 4 g HC. No se usa la densidad de la cruda.', '{"label":"Unidad mediana","grams":70}'::jsonb),
('calabaza', 4.2, 'BEDCA f_id 1183 Calabaza, hervida: 2,1 g HC/100 g (carbohidratos). 1 taza (200 g) = 4,2 g HC. Fibra 0,5 g/100 g, no se suma. Murillo 3ª ed. redondea 200 g = 1 ración; por encima del redondeo, manda BEDCA.', null::jsonb),
('es-judias-verdes', 3.2, 'BEDCA2 f_id 2397 Judía verde, hervida: 3,94 g HC/100 g (carbohidratos). 1 taza (80 g) = 3,2 g HC. Fibra 2,25 g/100 g, no se suma. Murillo 3ª ed. coincide: plato grande 250 g = 1 ración.', '{"label":"Plato grande","grams":250}'::jsonb),
('es-brocoli', 1, 'BEDCA2 f_id 2372 Brécol, hervido: 1,1 g HC/100 g (carbohidratos). 1 taza (90 g) ≈ 1 g HC. Fibra 0,65 g/100 g, no se suma. Murillo 3ª ed. redondea el plato grande (300 g) a 1 ración (3,3 g/100 g); por encima del redondeo, manda BEDCA.', '{"label":"Plato grande","grams":300}'::jsonb),
('es-hummus', 4.5, 'BEDCA no publica hummus. Murillo 3ª ed.: 100 g = 10 g HC. 3 cucharadas (45 g) = 4,5 g HC.', null::jsonb),
('es-albaricoque', 10, 'BEDCA2 f_id 2218 Albaricoque: 9,5 g HC/100 g (carbohidratos). 3 unidades (105 g) = 10 g HC. Fibra 2,1 g/100 g, no se suma. Murillo 3ª ed. redondea 150 g = 1 ración (6,7 g/100 g); por encima del redondeo, manda BEDCA.', '{"label":"Unidad mediana","grams":50}'::jsonb),
('es-zanahoria', 8.4, 'BEDCA2 f_id 2424 Zanahoria, cruda: 7 g HC/100 g (carbohidratos). 1 taza (120 g) = 8,4 g HC. Fibra 2,6 g/100 g, no se suma. Murillo 3ª ed. redondea 150 g = 1 ración (6,7 g/100 g).', '{"label":"Unidad mediana","grams":70}'::jsonb),
('pan-blanco', 10, 'Murillo 3ª ed. (Fundación para la Salud / CIBERDEM) + BEDCA. ES: 10 g HC = 1 ración. HC totales. Pan blanco: 20 g = 1 ración.', '{"label":"Barra de cuarto","grams":180}'::jsonb),
('arroz-cocido', 10, 'Murillo 3ª ed. (Fundación para la Salud / CIBERDEM) + BEDCA. ES: 10 g HC = 1 ración. HC totales. Arroz blanco hervido: 38 g = 1 ración.', '{"label":"Plato mediano","grams":160}'::jsonb),
('pasta-cocida', 10, 'Murillo 3ª ed. (Fundación para la Salud / CIBERDEM) + BEDCA. ES: 10 g HC = 1 ración. HC totales. Pasta alimenticia hervida: 45 g = 1 ración.', '{"label":"Plato mediano","grams":180}'::jsonb),
('patata-cocida', 10, 'Murillo 3ª ed. (Fundación para la Salud / CIBERDEM) + BEDCA. ES: 10 g HC = 1 ración. HC totales. Patata hervida: 65 g = 1 ración.', '{"label":"Plato mediano","grams":200}'::jsonb),
('boniato', 10, 'Murillo 3ª ed. (Fundación para la Salud / CIBERDEM) + BEDCA. ES: 10 g HC = 1 ración. HC totales. Boniato: 50 g = 1 ración.', '{"label":"Mediano","grams":160}'::jsonb),
('lentejas-cocidas', 20, 'Murillo 3ª ed. (Fundación para la Salud / CIBERDEM) + BEDCA. ES: 10 g HC = 1 ración. HC totales. Lentejas hervidas: 50 g = 1 ración → 100 g = 2 raciones. No usar el intercambio ADA de 15 g en España.', '{"label":"Plato mediano","grams":200}'::jsonb),
('garbanzos-cocidos', 18, 'Murillo 3ª ed. (Fundación para la Salud / CIBERDEM) + BEDCA. ES: 10 g HC = 1 ración. HC totales. Garbanzo hervido: 55 g = 1 ración → 100 g ≈ 1,8 raciones.', '{"label":"Plato mediano","grams":200}'::jsonb),
('alubias-cocidas', 18, 'Murillo 3ª ed. (Fundación para la Salud / CIBERDEM) + BEDCA. ES: 10 g HC = 1 ración. HC totales. Judías blancas hervidas: 55 g = 1 ración → 100 g ≈ 1,8 raciones.', '{"label":"Plato mediano","grams":200}'::jsonb),
('es-alubias', 18, 'Murillo 3ª ed. (Fundación para la Salud / CIBERDEM) + BEDCA. ES: 10 g HC = 1 ración. HC totales. Judías blancas hervidas: 55 g = 1 ración → 100 g ≈ 1,8 raciones.', '{"label":"Plato mediano","grams":200}'::jsonb),
('leche', 13, 'Murillo 3ª ed. (Fundación para la Salud / CIBERDEM) + BEDCA. ES: 10 g HC = 1 ración. HC totales. Leche: 200 ml = 1 ración → 250 ml ≈ 1,3 raciones.', '{"label":"Vaso","grams":200}'::jsonb),
('manzana', 15, 'Murillo 3ª ed. (Fundación para la Salud / CIBERDEM) + BEDCA. ES: 10 g HC = 1 ración. HC totales. Manzana: 100 g = 1 ración → 150 g = 1,5 raciones. Parte comestible.', '{"label":"Pieza mediana","grams":200}'::jsonb),
('arroz-cocido-150g', 39, 'Murillo 3ª ed. (Fundación para la Salud / CIBERDEM) + BEDCA. ES: 10 g HC = 1 ración. HC totales. Arroz hervido 26,3 g HC/100 g → 150 g ≈ 3,9 raciones.', '{"label":"Plato mediano","grams":160}'::jsonb),
('pasta-cocida-140g', 31, 'Murillo 3ª ed. (Fundación para la Salud / CIBERDEM) + BEDCA. ES: 10 g HC = 1 ración. HC totales. Pasta hervida 22,2 g HC/100 g → 140 g ≈ 3,1 raciones.', '{"label":"Plato mediano","grams":180}'::jsonb),
('arroz-integral-cocido-150g', 38, 'Murillo 3ª ed. (Fundación para la Salud / CIBERDEM) + BEDCA. ES: 10 g HC = 1 ración. HC totales. Arroz integral hervido: 40 g = 1 ración → 150 g ≈ 3,8 raciones.', '{"label":"Plato mediano","grams":160}'::jsonb),
('patata-cocida-150g', 23, 'Murillo 3ª ed. (Fundación para la Salud / CIBERDEM) + BEDCA. ES: 10 g HC = 1 ración. HC totales. Patata hervida 15,4 g HC/100 g → 150 g ≈ 2,3 raciones.', '{"label":"Plato mediano","grams":200}'::jsonb),
('boniato-asado-130g', 26, 'Murillo 3ª ed. (Fundación para la Salud / CIBERDEM) + BEDCA. ES: 10 g HC = 1 ración. HC totales. Boniato 20 g HC/100 g → 130 g ≈ 2,6 raciones.', '{"label":"Mediano","grams":160}'::jsonb),
('lentejas-cocidas-200g', 40, 'Murillo 3ª ed. (Fundación para la Salud / CIBERDEM) + BEDCA. ES: 10 g HC = 1 ración. HC totales. Lentejas hervidas 20 g HC/100 g → 200 g = 4 raciones.', '{"label":"Guarnición","grams":100}'::jsonb)
) as v(id, carbs_g, notes, habitual_measure)
where f.id = v.id;
