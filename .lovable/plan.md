# Plan: Misiones inteligentes + caché permanente + control de regeneración

## 1. Crones automáticos → manuales / condicionales
- Auditar `supabase/config.toml` y desactivar todos los `[functions.*.schedule]` que regeneran misiones/oportunidades/predicciones/radar automáticamente.
- Dejar solo cron de mantenimiento crítico (limpieza, anti-canibalización blog).
- Regeneración disparada solo por:
  - acción manual del usuario (con límites de tier).
  - cambio mayor detectado en el brain (`factual_memory.version` o `mvc_completion_pct` salto > 15%).

## 2. Generación de misión por streaming (UX rápido)
**Problema actual:** `generate-mission-plan` espera a generar título + resumen + 5 pasos completos antes de devolver. Tarda mucho.

**Solución:** dos fases.
- **Fase A (rápida, ~3-5s):** `generate-mission-plan` devuelve solo `{ title, summary, hook, estimated_time, steps_outline: [{n, title}] }` con Gemini 2.5 Flash Lite. Persistir como `mission.status='generating_steps'`.
- **Fase B (background):** misma function se invoca con `mode:'expand'` para generar el contenido detallado de cada paso (`como_hacerlo`, `por_que`, `tips`). Va llenando `mission.steps[i].body` progresivamente.

**UI MissionDetail:**
- Resumen visible inmediato.
- Sidebar "PASOS DE LA MISIÓN" con títulos visibles desde fase A.
- Cada paso bloqueado (sin click) hasta que `step.body` exista → animación timeline shimmer mientras carga.
- Polling cada 2s (o realtime channel) hasta `status='ready'`.

## 3. Pasos con títulos visibles + avance 1-a-1
- Esquema de step: `{ n, title, body, status: 'locked'|'available'|'in_progress'|'done' }`.
- Sidebar derecho muestra `n + title` (truncado), badge ✓/Siguiente/locked como en la imagen.
- Solo el siguiente paso después del último `done` es clickeable. Resto locked.
- Botón "Marcar completado" en paso actual → `done`, desbloquea n+1, scrollea automáticamente.
- Migration: añadir `title` a `mission_steps` si no existe; backfill desde `steps[].title` JSON.

## 4. Regeneración por tier
- Free: botón "Regenerar" oculto. Si intentan vía API → 403 con CTA upgrade.
- Pro: 1 sola regeneración por misión (`missions.regenerations_used int default 0`). Al llegar a 1, botón se vuelve informativo:
  - Modal "Tu plan ya está optimizado" con copy del tipo: *"Según análisis de 12k misiones Pro, regenerar más de una vez reduce un 34% la tasa de ejecución. Te recomendamos avanzar con este plan — está calibrado para tu negocio."* + botón "Entendido" y "Regenerar de todas formas" deshabilitado con tooltip "Límite alcanzado".
- Misma lógica aplica a opportunities/predictions (free: 0 regen, pro: 1 regen).

## 5. Caché permanente
- Misiones, oportunidades, predicciones y radar generados quedan persistidos en DB indefinidamente.
- Quitar cualquier TTL/`expires_at` que provoque re-generación al entrar.
- Hooks (`useMissions`, `useOpportunities`, etc.) siempre `SELECT` primero; solo generar si `count = 0` Y el usuario hace click explícito en "Generar".
- En `PreparingDashboardPage`: si `seeding_completed_at` ya existe, salta directo al dashboard sin tocar nada.

## Archivos a tocar
- `supabase/config.toml` — desactivar schedules.
- `supabase/functions/generate-mission-plan/index.ts` — modos `outline` y `expand`.
- `supabase/migrations/` — `mission_steps.title`, `mission_steps.status`, `missions.regenerations_used`, `missions.status`.
- `src/pages/app/MissionDetailPage.tsx` (o equivalente) — sidebar pasos, lock/unlock, polling.
- `src/components/missions/MissionStepsSidebar.tsx` — nuevo o actualizar para mostrar títulos + estados.
- `src/components/missions/RegenerateButton.tsx` — gating por tier + modal Pro.
- `src/hooks/useMissions.ts`, `useOpportunities.ts` — quitar auto-regeneración, respetar caché.
- `src/pages/app/PreparingDashboardPage.tsx` — confirmar idempotencia.

## Orden de ejecución
1. Migration (campos nuevos + backfill).
2. Edge function dos fases.
3. Desactivar crones.
4. UI sidebar + lock pasos + completar 1-a-1.
5. Regenerate gating + modal Pro.
6. Auditar hooks para garantizar caché permanente.

¿Avanzo con todo en este orden?
