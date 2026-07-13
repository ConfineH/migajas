# Migajas

App educativa web para aprender a contar carbohidratos por niveles, empezando por España.

**Unidad base:** 10 g de carbohidratos = 1 ración

## Stack

- Next.js 16 + TypeScript + Tailwind CSS
- Vitest (TDD en carpeta `test/`)
- SDD (Spec-Driven Development) con `openspec/`

## Desarrollo

```bash
npm install
npm run dev      # http://localhost:3000
npm test         # tests unitarios
npm run build    # build de producción
```

## Estructura

```
src/
  app/           # páginas (home, onboarding, catálogo)
  components/    # UI reutilizable
  lib/
    domain/      # lógica de negocio (raciones, alimentos)
    data/        # seed de alimentos españoles
test/
  domain/        # tests TDD del dominio
openspec/        # artefactos SDD
```

## MVP (Fase 1)

- [x] Home con CTA principal
- [x] Onboarding (España, modo invitado, intro a raciones)
- [x] Catálogo con búsqueda y filtro por categoría
- [x] Motor de raciones (10g = 1 ración)
- [x] Ejercicios interactivos con feedback (Sprint 3)
- [x] Registro de intentos (cookies)
- [x] Niveles 1–5 con desbloqueo progresivo (Sprint 4)
- [x] Pantalla de progreso y repaso de errores
- [x] Curso guiado: lecciones + práctica + examen (pivot pedagógico)
- [x] Lecciones guiadas niveles 1–5
- [x] Inicio de sesión con Google (Supabase Auth)
- [x] Sincronizar progreso con cuenta (post-login)
- [x] Contenido en Supabase (alimentos, lecciones, exámenes)
- [x] Analytics con user_id en Supabase
- [ ] Dashboard de analytics (Sprint 6)
- [ ] Admin UI para editar contenido

## Repositorio

https://github.com/ConfineH/migajas
