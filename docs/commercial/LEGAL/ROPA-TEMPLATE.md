# Plantilla — Registro de actividades de tratamiento (RoPA)

**Responsable:** `[LICENSEE_NAME]`  
**Contacto / DPO:** `[CONTACT_EMAIL]`  
**Territorio:** `[TERRITORY]`  
**Fecha de revisión:** `[EFFECTIVE_DATE]`

> Plantilla operativa según art. 30 GDPR. Completar y mantener actualizado.

## 1. Tratamiento: cuenta y curso educativo

| Campo | Detalle |
|-------|---------|
| Finalidad | Prestación del servicio educativo de conteo de carbohidratos |
| Categorías de interesados | Usuarios registrados e invitados |
| Categorías de datos | Email, nombre, progreso del curso, preferencias (región, meta) |
| Categorías de destinatarios | Supabase (procesador, eu-west-1), Vercel (hosting) |
| Transferencias internacionales | No previstas si infraestructura permanece en UE |
| Plazos de supresión | Hasta solicitud de supresión o cierre de cuenta |
| Medidas de seguridad | HTTPS, RLS, autenticación, headers de seguridad |

## 2. Tratamiento: seguimiento personal (diario)

| Campo | Detalle |
|-------|---------|
| Finalidad | Auto-seguimiento voluntario de ingesta alimentaria |
| Base legal | Consentimiento explícito (art. 9.2.a GDPR) |
| Categorías de datos | **Datos de salud** — registro de alimentos y carbohidratos |
| Plazos de supresión | `[RETENTION_DAYS]` días o hasta revocación / supresión de cuenta |
| Medidas adicionales | Opt-in explícito, revocación en Configuración, export CSV/PDF |

## 3. Tratamiento: consentimientos y cookies

| Campo | Detalle |
|-------|---------|
| Finalidad | Prueba de consentimiento (cookies, privacidad, datos de salud) |
| Datos | Tipo, versión legal, fecha concesión/revocación, preferencia cookies |
| Plazos | Mientras dure la relación + plazo de prescripción legal aplicable |

## 4. Subencargados (procesadores)

| Proveedor | Servicio | Región | DPA |
|-----------|----------|--------|-----|
| Supabase | Base de datos, auth | eu-west-1 | Verificar DPA Supabase |
| Vercel | Hosting, cron | UE/US según plan | Verificar DPA Vercel |

## 5. Revisiones

Revisar este registro cuando se añadan features, nuevos proveedores o cambios en retención.
