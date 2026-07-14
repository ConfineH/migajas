# Plantilla — Acuerdo de tratamiento de datos (DPA)

**Entre:** `[LICENSEE_NAME]` (Responsable)  
**Y:** `[LICENSOR_NAME]` (Encargado del tratamiento, si aplica soporte)  
**Territorio:** `[TERRITORY]`  
**Fecha:** `[EFFECTIVE_DATE]`

## 1. Objeto

Tratamiento de datos personales mediante la aplicación Migajas con fines educativos y, opcionalmente, auto-seguimiento de ingesta de carbohidratos.

## 2. Categorías de datos

- Identificación (email, nombre de perfil auth)
- Progreso de aprendizaje
- Perfil (región, meta diaria, modo clínico)
- **Datos de salud (opcional):** entradas de `intake_entries`

## 3. Duración y borrado

Retención máxima propuesta: `[RETENTION_DAYS]` días para ingesta, salvo obligación legal.

## 4. Subencargados

- Supabase (hosting BD, UE)
- Vercel (hosting aplicación)

## 5. Medidas de seguridad

RLS en Postgres, HTTPS, acceso admin sin PII de ingesta individual (v1).

---

*Revisión legal obligatoria antes de firma.*
