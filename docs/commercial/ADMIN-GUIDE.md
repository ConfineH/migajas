# Guía de administración — Migajas

## Acceso admin

1. Añadir emails en `ADMIN_EMAILS` (separados por coma).
2. Iniciar sesión con esa cuenta.
3. Abrir `/admin`.

## Gestión de contenido

| Sección | Ruta | Qué editar |
|---------|------|------------|
| Alimentos | `/admin/foods` | Porción, gramos, HC, categoría |
| Lecciones | `/admin/lessons` | Título, resumen, pasos JSON |
| Exámenes | `/admin/exams` | Pool de ejercicios, preguntas por intento |

Los cambios se guardan en Supabase cuando `SUPABASE_SERVICE_ROLE_KEY` está configurada.

## Métricas de organización

En `/admin` verás **solo números agregados**:

- Usuarios registrados
- Activos últimos 30 días
- Media de niveles aprobados
- Embudo: lecciones iniciadas → nivel 1 aprobado → modo libre

**No puedes** ver emails, perfiles individuales ni diarios de ingesta de pacientes (diseño v1).

## Ampliar catálogo de alimentos

1. Editar `src/lib/data/foods.json` o usar script `scripts/expand-foods-catalog.mjs`.
2. Ejecutar `npm run db:seed` y aplicar migración generada.
3. Verificar en `/catalog` y `/guia` por región.

## Modo clínico

- Los usuarios deben aprobar **nivel 3** y activar modo clínico en Configuración.
- `CLINICAL_MODE_ENABLED=false` desactiva diario y export sin afectar el curso.

## Límites de soporte típico

- Despliegue inicial y variables de entorno
- Dudas de edición de contenido
- Bugs de la aplicación entregada

No incluido: redacción legal, validación nutricional de nuevos alimentos, integraciones hospitalarias.
