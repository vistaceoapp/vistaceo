# VISTACEO Conversion Intelligence OS — Plan de implementación integral

## Principio rector
**Cero duplicación.** Ya existen: `user_lifecycle`, `business_brains`, `user_chat_preferences`, `email_send_log`, `suppressed_emails`, `send-transactional-email`, `process-email-queue`, plantillas (`user-activated`, `user-incomplete-reminder`, `user-credit-recovery`), `SetupCoachOverlay`, `AdminUserRankingPage`, `brain-core` (validation/quality gates), `lifecycle-tracking`, `recommendation_traces`, anti-anglicismo. **Todo lo nuevo se conecta encima, no reemplaza.**

## Fase 1 — Capa de datos (1 migración)

Nuevas tablas (no chocan con existentes):
- `user_conversion_profiles` (1:1 user) — scores 0-100, segmento, estrategia, canal, timing, do-not-disturb, contadores 7d.
- `conversion_agent_memory` (1:1 user) — hipótesis, interés principal, objeción, valor percibido (jsonb).
- `conversion_agent_decisions` (log) — cada decisión del agente, incluso "silencio". Auditable.
- `conversion_events` (log) — eventos finos NO cubiertos por `user_events`/`lifecycle_events` existentes (premium_gate_viewed, modal_closed, checkout_started, etc.). Si la tabla `user_events` ya existe la **extendemos**, no duplicamos.
- `conversion_impressions` — impression/click/close por placement+message.
- `conversion_messages` — biblioteca de mensajes parametrizables (no plantilla rígida; el agente compone con brain).

Reutilizadas tal cual: `business_brains`, `user_chat_preferences`, `email_send_log`, `email_unsubscribe_tokens`, `suppressed_emails`, `subscriptions`, `recommendation_traces`.

Todas con RLS + GRANTs por contrato. Service-role para edge functions.

## Fase 2 — Motor (edge functions, sin duplicar emails)

Nuevas edge functions:
- `conversion-track-event` — endpoint único de tracking. Inserta en `conversion_events`, dispara recálculo si es evento clave.
- `conversion-compute-scores` — calcula los 10 scores + `pro_readiness_score` + `conversion_probability` con la fórmula del spec.
- `conversion-run-agent` — corre el agente individual: carga brain + memoria + scores + behavior + plan, decide `{strategy, channel, placement, timing, cta, message_seed}` o `silence`. Pasa por **quality gate de `brain-core`** existente (no creamos uno nuevo).
- `conversion-next-best-action` — lectura para frontend (no expone scores ni probabilidad).
- `conversion-daily-orchestrator` (cron diario) — recorre free users activos, recalcula scores, ejecuta agente, encola emails permitidos.

**Emails — anti-duplicación estricta:**
- NO creamos nuevas funciones de envío. Todo va por `send-transactional-email` ya existente.
- Agregamos 4 plantillas nuevas en `_shared/transactional-email-templates/`: `conv-first-value`, `conv-premium-context`, `conv-checkout-recovery`, `conv-reactivation-no-sell`. Cada una usa `sanitizeBusinessName` ya existente.
- **Guard de dedupe**: antes de encolar, consultamos `email_send_log` + `conversion_agent_decisions` para chequear: (a) consentimiento, (b) `suppressed_emails`, (c) frecuencia (≤1 cada 48 h, ≤3 conversion/semana), (d) ningún `user-incomplete-reminder` o `user-credit-recovery` enviado en las últimas 48 h con el mismo intent. Si choca, el agente cambia a canal `app` o `silence`.
- `idempotency_key = conv-{user_id}-{intent}-{date}` para imposibilitar duplicados.

## Fase 3 — Frontend (mínimo invasivo, sin tocar UX base)

- `src/contexts/ConversionAgentContext.tsx` — carga `next-best-action` post-login + tras eventos clave. Cache en memoria.
- `src/components/conversion/SmartConversionCard.tsx` — render condicional en Dashboard (slot ya existente del dashboard widget system, hidden by default si no hay acción).
- `src/components/conversion/SmartPremiumGate.tsx` — sustituye `PremiumGate` actual cuando hay contexto; fallback al genérico si no hay datos.
- `src/components/conversion/PersonalizedProHero.tsx` — montado dentro de la página Pro existente (`/upgrade`). Si no hay interés claro, muestra el hero actual.
- `src/components/conversion/CheckoutRecoveryBanner.tsx` — montado solo en Dashboard si `checkout_abandoned` + ventana prudente.
- `src/lib/conversion-tracker.ts` — hook `useConversionTrack(event, meta)` que pega a `conversion-track-event`. Reutiliza el `signup-tracking` y `lifecycle-tracking` actuales (no los reemplaza).

Reutilizamos `SetupCoachOverlay`, `BrainLearningCard`, `chunk-reload-guard` sin cambios.

## Fase 4 — Admin

Nueva ruta: `/admin/conversion-os` con tabs:
1. **Cohortes & scores** — tabla de usuarios con scores, segmento, estrategia, NBA, NBO.
2. **Decisiones del agente** — feed de `conversion_agent_decisions` (incluye silencios y razón).
3. **Mensajes & gates** — impresiones, CTR, conversión por placement.
4. **Salud anti-molestia** — usuarios resistentes, tasa de cierre, DND activos.

Se monta **dentro de `AdminLayout` existente**. Reutiliza `AdminAuthGuard` y `user_roles` existentes.

## Fase 5 — Guards (reutiliza lo existente)

- **Quality Gate**: usa `brain-core/extreme-quality-gate.ts` + `validateForUser` ya existentes.
- **Anti-anglicismo**: ya implementado en `brain-core/visible-language.ts`.
- **Aislamiento por user/business**: ya implementado en `isolation-guard.ts`.
- **Sanitize business name**: ya implementado en `_hooks.ts`.
- **Compliance email**: ya implementado en `send-transactional-email` (suppression + unsubscribe).

Solo agregamos: `conversion-guards.ts` (shared) con `antiAnnoyanceGuard()` y `frequencyGuard()` específicos de conversion.

## Fase 6 — QA

- Test SQL en `supabase/tests/conversion-os.sql` con 6 perfiles sintéticos (nuevo, free activo, alta intención, checkout abandonado, churn, pagado) validando que el agente decide la estrategia esperada y NO genera duplicados.

## Alcance de este turno (créditos limitados)

Voy a ejecutar Fases 1 + 2 (datos + motor + plantillas) en una sola migración + edge functions, dejando Fase 3 (frontend) y Fase 4 (admin) para turnos siguientes. Esto pone la inteligencia viva primero y permite ver decisiones en logs antes de exponer UI. Confirmás y arranco.
