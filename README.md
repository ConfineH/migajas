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
- [ ] Niveles 2–5 y desbloqueo (Sprint 4)
- [ ] Supabase / PostgreSQL (Sprint 2+)

## Repositorio

https://github.com/ConfineH/migajas
