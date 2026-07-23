# Despliegue — Migajas

## Requisitos

- Cuenta [Vercel](https://vercel.com)
- Proyecto [Supabase](https://supabase.com) (recomendado: región **eu-west-1**)
- Node.js 20+ para desarrollo local y scripts

## 1. Supabase

1. Crear proyecto en `eu-west-1`.
2. En **SQL Editor**, aplicar migraciones en orden desde `supabase/migrations/`.
3. O con CLI local: `supabase link` y `supabase db push`.
4. Generar seed de contenido:
   ```bash
   npm run db:seed
   ```
   Aplicar en remoto (requiere `.env.supabase` con `SUPABASE_ACCESS_TOKEN`):
   ```bash
   npm run db:seed:remote
   ```
   O aplicar el SQL de `supabase/migrations/20260713160000_seed_content.sql` en SQL Editor.
5. Comprobar entorno y smoke automatizado:
   ```bash
   npm run ops:check
   npm run ops:smoke
   ```
6. Configurar **Auth** → URLs del sitio y política de contraseñas (ver `scripts/configure-auth-urls.mjs`):
   - `password_hibp_enabled: true` (HaveIBeenPwned; requiere plan Pro+)
   - `password_min_length: 10`

## 2. Variables de entorno

En Vercel y `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...          # solo servidor — admin + métricas
NEXT_PUBLIC_SITE_URL=https://tu-dominio.com
ADMIN_EMAILS=admin@clinica.com          # editores de contenido
CLINICAL_MODE_ENABLED=true              # false para desactivar diario/export
CRON_SECRET=...                         # secreto para cron de retención (vercel.json)
INTAKE_RETENTION_DAYS=365               # opcional; purge semanal de diario antiguo
```

`vercel.json` programa `GET /api/cron/purge-intake` los domingos a las 03:00 UTC. Sin `CRON_SECRET` el endpoint responde 401.

## 3. Vercel

1. Importar repositorio.
2. Framework: Next.js (detección automática).
3. Añadir variables de entorno.
4. Deploy.

## 4. Smoke test

Automatizado: `npm run ops:smoke` (deploy + admin RPC + diario/export).

Checklist manual opcional:

- [ ] Home carga
- [ ] Onboarding completa (ES o RD)
- [ ] Login funciona (`/login`)
- [ ] Curso `/learn` accesible (RD: casabe/viandas en descripciones)
- [ ] Admin `/admin` solo con `ADMIN_EMAILS`
- [ ] Catálogo tras aprobar nivel 1
- [ ] Diario `/diario` tras nivel 3 + seguimiento personal activo
- [ ] Export CSV/PDF desde diario

## 5. Actualizaciones post-licencia

1. Recibir nueva versión del código (tag Git).
2. Aplicar solo migraciones nuevas en `supabase/migrations/`.
3. Regenerar/aplicar seed si cambió contenido.
4. Redeploy en Vercel.

## Alternativa self-host (Fase 2)

No incluida en Fase 1. Contactar al licenciante si el comprador exige infraestructura propia.
