# Procedimiento interno — Notificación de brechas de seguridad

**Responsable:** `[LICENSEE_NAME]`  
**Contacto:** `[CONTACT_EMAIL]`  
**Versión:** 1.0 — `[EFFECTIVE_DATE]`

> Procedimiento operativo para cumplir art. 33-34 GDPR (notificación AEPD ≤72h si procede).

## 1. Detección

Fuentes de alerta:

- Logs de Supabase / Vercel
- Reportes de usuarios o equipo interno
- Dependencias con CVE crítico (npm audit, GitHub alerts)

**Acción inmediata:** Registrar incidente con fecha/hora, quién detectó, síntomas.

## 2. Contención (primeras 4 horas)

1. Evaluar si el incidente está activo (acceso no autorizado en curso).
2. Si procede: rotar claves (`SUPABASE_SERVICE_ROLE_KEY`, `CRON_SECRET`), revocar sesiones sospechosas.
3. Preservar evidencias (logs, timestamps) antes de borrar.

## 3. Evaluación de riesgo (primeras 24 horas)

Responder:

- ¿Qué datos personales o de salud se vieron afectados?
- ¿Cuántos usuarios?
- ¿Hay riesgo para derechos y libertades de las personas?

| Resultado | Acción |
|-----------|--------|
| Riesgo bajo / datos no personales | Documentar y cerrar |
| Riesgo para derechos y libertades | Notificar AEPD en ≤72h desde conocimiento |
| Riesgo alto | Notificar AEPD + usuarios afectados sin dilación indebida |

## 4. Notificación AEPD (si procede)

- Canal: [sede electrónica AEPD](https://www.aepd.es)
- Incluir: naturaleza de la brecha, categorías y volumen de datos, posibles consecuencias, medidas adoptadas
- Plazo: **72 horas** desde que se tenga constancia

## 5. Comunicación a usuarios (si riesgo alto)

- Email o aviso in-app
- Lenguaje claro: qué pasó, qué datos, qué pueden hacer (cambiar contraseña, contactar)

## 6. Cierre y lecciones aprendidas

- Actualizar RoPA si cambió el análisis de riesgo
- Registrar en historial interno de incidentes
- Revisar medidas técnicas (RLS, headers, accesos admin)

## Contactos de referencia

- AEPD: https://www.aepd.es
- Supabase status: https://status.supabase.com
- Vercel status: https://www.vercel-status.com
