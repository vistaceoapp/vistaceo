# Plan: Motor IA Universal "Cero Hardcode" para VISTACEO

Cada misión, oportunidad, predicción y análisis se genera con IA combinando todas las variables del brain del negocio. Nada de pasos genéricos, ni texto copiado entre usuarios, ni listas estáticas en backend.

---

## 1. Principios irrenunciables

1. **Cero contenido estático visible al usuario.** Pasos como "Analizar el problema", triggers genéricos, plantillas copiadas, baselines estáticos por sector — todo se elimina del runtime de usuario.
2. **Prompts dinámicos por negocio.** El prompt se ensambla en runtime desde el brain (sector, país, etapa, salud, señales, foco, competidores, fotos, integraciones).
3. **Cache por negocio.** Cada artefacto se genera 1 vez, se guarda con su `brain_signature` (hash de variables clave) y se reutiliza hasta que el signature cambie.
4. **Regeneración bajo demanda + auto.** Se regenera cuando: (a) cambia el signature, (b) el usuario lo pide, (c) entra nueva señal relevante.
5. **Reintento premium.** Flash falla o no pasa el gate → reintento con Gemini 2.5 Pro / GPT-5. Mientras tanto estado "generando" (skeleton), nunca contenido genérico.
6. **Migración perezosa.** Usuarios viejos no se tocan. Solo cuando un usuario viejo vuelve a loguearse, se marca su contenido como `legacy=true` y se regenera al abrir cada item.

---

## 2. Arquitectura (3 capas)

```text
┌─────────────────────────────────────────────────────────────┐
│  CAPA 1 — BRAIN CONTEXT BUILDER  (src/lib/brain-context/)   │
│  Lee business + brain + signals + insights + país + sector  │
│  Devuelve un BrainContext tipado + brain_signature (hash)   │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  CAPA 2 — DYNAMIC PROMPT ASSEMBLER (_shared/prompt-forge)   │
│  Por tipo de artefacto (mission/opportunity/prediction/...) │
│  ensambla system + user prompt usando BrainContext.         │
│  Sin texto fijo — todo se rellena desde variables.          │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  CAPA 3 — AI GENERATOR + QUALITY GATE + CACHE               │
│  Llama modelo → valida con gate → guarda con signature.     │
│  Si falla: reintento premium. Si vuelve a fallar: bloquea.  │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. BrainContext (la fuente única de verdad)

Se construye una sola vez por request y se pasa a todos los generadores.

Campos:
- `business`: tipo, sub-tipo, sector, sub-sector, país, ciudad, etapa, edad, tamaño, modelo de ingresos
- `brain`: confianza, dimensiones de salud (6 niveles), foco activo, gaps abiertos
- `signals`: últimas N humanizadas (vía `humanizeEvidence`)
- `insights`: respuestas del cuestionario humanizadas (sin `Q_AI_`, sin `[Setup_answer]`)
- `competitors`: principales detectados + mapa competitivo
- `integrations`: qué tiene conectado (Google, Meta, LinkedIn)
- `tone`: tuteo/voseo según país
- `signature`: SHA-256 estable de las variables clave → invalida cache

---

## 4. PromptForge dinámico (por tipo de artefacto)

Una función por artefacto, todas en `supabase/functions/_shared/prompt-forge/`:

- `forgeMissionPrompt(ctx, seed)` — seed = oportunidad/señal disparadora
- `forgeOpportunityPrompt(ctx, trigger)`
- `forgePredictionPrompt(ctx, horizon)`
- `forgeAnalyticsPrompt(ctx, dimension)`
- `forgeRadarMissionPrompt(ctx, radarInsight)`

Reglas internas:
- Nada de strings hardcodeados de pasos. El prompt pide estructura (qué, cómo, por qué, ejemplo, métrica, criterio de cumplimiento, tiempo estimado) y el modelo genera todo.
- Tono y vocabulario se inyectan desde `ctx.tone` + `ctx.country`.
- Sector se inyecta desde `ctx.business.sector` con el mega-sector engine ya existente.

---

## 5. Quality Gate universal (`_shared/quality-gate.ts`)

Un solo módulo, configurable por tipo:

- Rechaza títulos/pasos genéricos vía regex (la lista que ya existe en `generate-mission-plan`)
- Rechaza descripciones < N chars
- Rechaza filtraciones (`Q_AI_`, `[Setup_answer]`, JSON crudo, `[object Object]`)
- Rechaza si no menciona variables del negocio (país, sector o nombre)
- Si falla → reintento con modelo premium → si vuelve a fallar → devuelve `null` (la UI muestra "generando…" + botón "reintentar")

---

## 6. Cache + invalidación por signature

Nueva tabla `ai_artifacts_cache`:

```text
business_id | artifact_type | artifact_id | brain_signature 
| payload jsonb | model_used | generated_at | version
```

Lectura: si `brain_signature` actual == almacenado → reusar.  
Escritura: tras pasar gate.  
Invalidación: cron que recalcula signature y marca stale los desfasados; el usuario ve botón "actualizar".

Esto reemplaza el cache localStorage actual de misiones, que es per-device.

---

## 7. Migración perezosa de usuarios viejos

- Trigger en login: si `last_seen_at < now() - 24h` y el negocio tiene artefactos sin `brain_signature` → marcar `legacy=true` en sus misiones/oportunidades/predicciones.
- En la UI, al abrir un item `legacy=true` → se dispara regeneración con el nuevo motor y se reemplaza.
- Nada se borra automáticamente (respeta el Data Persistence Guard).
- Usuarios que nunca vuelven → su contenido viejo queda intacto y nunca paga costo de regeneración.

---

## 8. Edge functions afectadas

Refactor (no reescritura) para que todas consuman BrainContext + PromptForge + QualityGate:

- `generate-mission-plan`
- `generate-opportunity-plan`
- `generate-predictions`
- `analyze-patterns`
- `analyze-health-score`
- `dashboard-prepare`
- `seed-initial-insights`
- `brain-playbook`
- `uceo-chat` (sólo el armado del contexto, no el stream)

Frontend afectado:
- `RadarPage.convertToMission` → llama edge `generate-mission-plan` con seed del radar (eliminar `initial-mission-steps.ts` del runtime visible).
- `MissionDetailEnhanced`, `OpportunityDetailEnhanced` → leen del cache; si stale o legacy, muestran skeleton + regeneran.

---

## 9. Detalles técnicos

- **Modelos**: Flash Lite por default (cache hit es lo común). Miss → Flash. Gate falla → Pro/GPT-5 (premium retry).
- **Signature**: `sha256(sector|subsector|country|stage|health_dims|focus|top10_signal_ids)`. Cambios menores no invalidan; cambios estructurales sí.
- **Tabla nueva** `ai_artifacts_cache` con RLS por `business_id`, GRANT a `authenticated` + `service_role`.
- **Backward compat**: el motor nuevo convive con el viejo. Flag `USE_AI_FORGE=true` por negocio (default true para nuevos, false para viejos hasta que vuelvan).
- **Observabilidad**: log de cada generación en `ai_artifacts_cache` con `model_used`, `tokens`, `gate_passed`, `retry_count`.

---

## 10. Entregables por fase

**Fase A — Cimientos (sin tocar UX)**
1. `src/lib/brain-context/` builder + tipos + signature.
2. `_shared/brain-context.ts` (espejo Deno).
3. `_shared/prompt-forge/` con las 5 forges.
4. `_shared/quality-gate.ts` universal + premium retry.
5. Tabla `ai_artifacts_cache` + RLS + GRANT.

**Fase B — Refactor de generadores**
6. `generate-mission-plan` → consume forge + gate + cache.
7. `generate-opportunity-plan` → idem.
8. `generate-predictions` → idem.
9. `analyze-patterns` → idem.

**Fase C — Frontend**
10. `RadarPage.convertToMission` deja de inyectar pasos; pide a la edge.
11. `MissionDetailEnhanced` / `OpportunityDetailEnhanced` leen cache + skeleton + botón "regenerar".
12. Hook `useAIArtifact(type, id)` que centraliza fetch + stale check.

**Fase D — Migración perezosa**
13. Detección de re-login + marcado `legacy=true`.
14. Auto-regeneración al abrir item legacy.

**Fase E — Limpieza**
15. Eliminar de runtime: `initial-mission-steps.ts`, hardcodes de pasos en `RadarPage`, baselines estáticos visibles.
16. Documentar en memoria del proyecto.

---

## 11. Lo que NO se toca

- Brain Event Sourcing, Cognitive OS v5, Radar Engine (siguen igual; solo cambia cómo se generan los artefactos).
- Pagos, auth, blog.
- Contenido legacy de usuarios que no vuelven.
- Diseño visual.

---

¿Avanzamos con Fase A o querés ajustar algo (modelo default, qué variables entran al signature, frecuencia del cron de invalidación)?
