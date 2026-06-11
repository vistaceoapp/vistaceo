
# Plan: Personalización total del sistema post-setup

Objetivo: que cualquier negocio que termine el setup vea un **Inicio + Brain + Radar + Misiones + Analíticas + Predicciones** que se sientan hechos a medida del **sector + país + tamaño + nombre** desde el segundo 1 — sin estados vacíos ni copys genéricos.

## Diagnóstico actual (del QA con `Café Aurora Palermo`)

- Brain arranca en **0 signals / 0% confianza** → Salud queda en rojo crítico sin razón.
- Radar muestra **"Analizando…" indefinido** si la edge function tarda o falla; KPIs en 0.
- Chat saludaba `"Hola, Café"` (truncaba nombre del negocio en vez de usar el usuario) — **ya corregido**.
- Dashboard Inicio usa el mismo layout para todos los sectores: no hay "wow" de personalización.
- Misiones / Predicciones / Analíticas muestran ceros y candados Pro, pero sin ningún gancho previo que justifique el upgrade.

## Cambios

### 1. Brain — semilla automática por sector (al crear negocio)

- Nuevo edge function `seed-business-brain` que se dispara al completar setup.
- Inserta **8–12 signals iniciales** desde `business_type_configs` para el `category` elegido (ej. cafetería AR: ticket promedio típico, % delivery, dayparts pico, mix de productos, KPIs de referencia).
- Marca `source = 'sector_seed'` para diferenciarlas de signals reales del usuario.
- Recalcula `confidence_score` automáticamente vía trigger existente → arranca en ~25–35%.
- Hook `useBusinessLifecycle` invoca la función una sola vez (idempotente por `business_id`).

### 2. Radar — fallback de oportunidades base + estado claro

- En `radar-generate` edge function: si tras 25s no hay output del motor v14, devolver **3 oportunidades base** del Mega Sector Engine (ya existe el catálogo de 180+ sectores) marcadas `source: 'sector_baseline'`.
- UI Radar: si `status === 'analyzing'` por > 45s, mostrar las baselines con badge "Base sectorial — refinando con datos reales".
- Nunca dejar la pantalla en "Analizando…" perpetuo.

### 3. Dashboard Inicio — hero personalizado por sector

- Nuevo componente `SectorHeroCard` reemplaza el bloque `Buenos días {nombre}` genérico.
- Lee `business.category` + `country` + hora local + `daypart` actual.
- Renderiza:
  - Saludo contextual ("Buenos días, equipo de Café Aurora — turno de la mañana en Palermo").
  - 1 KPI sectorial relevante al daypart (ej. "Hora pico de cafetería: 8–10am").
  - 1 acción concreta sugerida según hora + sector.
- Variantes visuales por familia de sector (gastronomía / retail / servicios / digital) con gradientes y patrones sutiles distintos — manteniendo el design system minimalista premium.

### 4. Chat CEO — system prompt enriquecido

- `chat-stream` edge function: inyectar en el system prompt el **resumen estructurado del negocio** (categoría, país, ticket, dayparts, top 3 signals, foco actual) ya extraído del Brain.
- Sugerencias iniciales (`ChatSuggestedQuestions`) ya son contextuales — verificar que usen el nuevo seed.

### 5. Migración usuarios existentes

- Migración SQL: para cada `business` con `setup_completed=true` y `total_signals=0`, encolar `seed-business-brain` (vía `pg_net` o flag `needs_seed=true` que el frontend lee al cargar).
- Nadie pierde datos reales; sólo se suman baselines marcadas.

### 6. Guard rails

- Respetar **Data Persistence Guard**: las baselines tienen `source` distinto y nunca pisan signals reales.
- Respetar **Health Semantic System**: 6 niveles, sin verde para health.
- 100% español, sin anglicismos, marca VISTACEO mayúscula.
- Sin claims inventados: si no hay datos, decirlo ("Estimado sectorial, refinamos con tus datos reales").

## Archivos a tocar

```text
supabase/functions/seed-business-brain/index.ts          NUEVO
supabase/functions/radar-generate/index.ts               EDIT (timeout + baseline fallback)
supabase/migrations/<ts>_brain_seed_backfill.sql         NUEVO
src/components/dashboard/SectorHeroCard.tsx              NUEVO
src/pages/app/InicioPage.tsx                             EDIT (montar SectorHeroCard)
src/hooks/use-business-lifecycle.ts                      EDIT (trigger seed una vez)
src/pages/app/RadarPage.tsx                              EDIT (mostrar baselines tras 45s)
src/lib/sector-baselines.ts                              NUEVO (catálogo seed por sector)
```

## QA al cerrar

1. Crear negocio nuevo (sector distinto: ej. boutique MX) → confirmar Brain >20%, Radar con 3+ oportunidades, Inicio con hero sectorial distinto.
2. Reusar `Café Aurora Palermo` → re-correr seed por backfill y confirmar diferencias visibles.
3. Comparar lado a lado 2 negocios de sectores distintos → el dashboard tiene que verse claramente diferente.

## Fuera de alcance (lo digo explícito)

- Rediseño completo del sidebar / navegación.
- Cambios al sistema de pago / Pro tiers.
- Tocar `Auth` o `Setup` (ya validados en QA previo).
- Reescribir el motor Radar v14 o el Cognitive OS v5 — sólo añadimos fallback + seed.

¿Apruebo y arranco por el orden 1 → 2 → 3 → 4 → 5?
