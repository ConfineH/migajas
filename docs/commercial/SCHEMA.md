# Esquema de datos — Migajas

## Tablas principales

### `foods`, `lessons`, `level_exams`

Contenido educativo editable desde `/admin`. `foods.country` distingue España vs República Dominicana.

### `user_learning_state`

- `user_id` → `auth.users`
- `progress` (JSONB): completions, lecciones, práctica, free mode
- `attempts` (JSONB)
- **RLS:** cada usuario solo lee/escribe su fila

### `learning_events`

Eventos pedagógicos (`lesson_completed`, `exam_passed`, `free_mode_unlocked`). Usados en analytics y métricas admin agregadas.

### `user_profiles`

- `region_id`: `es` | `do`
- `daily_carb_goal_g`: meta diaria opcional (gramos)
- `clinical_mode_enabled`: opt-in modo clínico
- **RLS:** propio usuario

### `intake_entries`

Diario de ingesta (modo clínico):

- `food_id`, `meal_slot`, `local_date`, `portion_multiplier`
- `carbs_g`, `rations` denormalizados al guardar
- **RLS:** propio usuario

## Funciones admin

### `get_org_dashboard_stats()`

- **SECURITY DEFINER**, solo `service_role`
- Devuelve agregados: usuarios totales, activos 30d, media niveles aprobados, embudo
- **No expone** emails, IDs de usuario ni ingesta individual

## Aislamiento de datos

- Auth Supabase + RLS en tablas de usuario
- Exportaciones clínicas solo vía API autenticada del propio usuario
- Admin de contenido ≠ admin de datos de salud individuales (v1)

## Migraciones

Orden cronológico en `supabase/migrations/`. No modificar migraciones ya aplicadas en producción; añadir nuevas.
