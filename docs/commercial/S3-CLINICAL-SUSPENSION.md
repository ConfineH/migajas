# S3 — suspensión de la superficie clínica

Esta nota acompaña la migración `20261125120000_suspend_clinical_surface.sql`. No aplica el SQL en producción y no fusiona la PR.

El primer piloto es el curso, el catálogo, la guía y el progreso. El diario, la meta de carbohidratos, la generación de informes y la lectura profesional de copias ya enviadas quedan fuera de ese piloto. Ocultar un botón no sustituye el permiso en la base de datos.

## Qué se cierra

- Nuevas filas y cambios en `intake_entries`.
- Nuevas copias en `professional_report_shares` y nuevos contactos profesionales, también si alguien vuelve a conceder `INSERT`.
- La política que permitía a un profesional leer el snapshot de un informe.
- Mensajes nuevos en `professional_contact_messages`.
- Cambiar `daily_carb_goal_g`, activar `clinical_mode_enabled` o crear un perfil que ya nazca con meta o con seguimiento personal.
- En la aplicación: altas de diario, cambios de porción, exportación CSV/PDF clínica, envío y búsqueda de profesionales, alta de seguimiento y el formulario de contacto.

## Qué se conserva

- Las filas que ya existen. La migración no hace `INSERT`, `UPDATE` ni `DELETE` de datos.
- La persona titular puede leer su diario, borrar una entrada del mismo día y borrar las copias que ella envió.
- La exportación de datos personales sigue en `GET /api/account/export`. Eso descarga lo ya guardado. No genera un informe clínico.
- `GET /api/clinical/export` genera un CSV o un PDF nuevo a partir del diario. Esa generación queda suspendida.
- Desactivar el seguimiento y retirar el consentimiento siguen permitidos.
- Cambiar la región y crear un perfil educativo sin meta siguen permitidos.
- El borrado de cuenta usa `service_role` y conserva `DELETE` en diario, copias, contactos y mensajes.
- La tarea de retención sigue pudiendo borrar ingestas antiguas con `service_role`.
- Un profesional puede seguir leyendo los mensajes que ya envió. No puede crear otro.

## Cuentas que ya existen

Hay perfiles con seguimiento personal, con el indicador profesional, con ingesta y con una copia de informe. Esta nota no identifica esas cuentas. La copia y el contacto asociados son de la misma cuenta en ambos extremos. Eso no demuestra que no hubiera otros accesos.

Antes de escribir a alguien, Jose tiene que confirmar la titularidad. El texto útil, una vez confirmada, es: las copias no se han borrado; la lectura profesional de esas copias se suspende; quien las envió puede seguir viéndolas, exportar sus datos y borrarlas; no se pueden crear registros ni informes nuevos.

## Orden

S2 es la primera intervención de producción y cierra el alta de informes y contactos por privilegio y por la política corregida. S3 puede aplicarse antes o después: el trigger rechaza la escritura aunque la función de compartir siguiera siendo ejecutable. No sustituye a S2. No aplicar ninguna de las dos hasta una autorización expresa.

La aplicación de esta PR debe desplegarse después del SQL, o a la vez solo si el SQL ya está validado. Si el SQL entra antes, la aplicación antigua recibe el rechazo de la base de datos. Si la aplicación entra antes, las rutas ya responden 403 y la base de datos todavía aceptaría una llamada directa. El orden que falla cerrado es SQL primero, catálogo después, aplicación al final.

## Reversión

No hay un script que vuelva a abrir el diario ni la lectura profesional. Volver a dar `INSERT` no reabre la escritura: el trigger sigue rechazándola. La recuperación prevista es `supabase/recovery/s3_reassert_clinical_suspension.sql`, que repite el cierre y no toca filas.

Reabrir el piloto clínico sería una migración nueva, con una política escrita de nuevo y revisada. No se restaura la política antigua de contactos. No se restaura la lectura profesional como parte de una reversión de emergencia.

## Residuos

Los privilegios por defecto del esquema `public` pueden volver a conceder `ALL` en una tabla futura. Esta migración no cambia esos privilegios. Un `GRANT` posterior sobre estas tablas no basta para escribir, porque el trigger no tiene exención para el diario, las copias, los contactos ni los mensajes. La exención de la meta clínica exige a la vez el rol de base `service_role` y el rol del JWT `service_role`.
