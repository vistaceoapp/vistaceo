# Plan — Inteligencia + Personalización 100000%

Objetivo: elevar a nivel executive el nivel de personalización y coherencia en **todos** los generadores (oportunidades, chat, radar, predicciones, análisis, emails), y arreglar bugs de setup (CLARIFY que no recalcula, businessType incorrecto, 0% precisión).

## Fase 1 — Hyper-Personalization Gate en generadores ✅ (en curso)

- [x] `analyze-patterns` (oportunidades): insertar solo si la oportunidad ancla ≥2 variables reales del brain (sector, ciudad, cliente, oferta, canal, fricción, nombre negocio). Si no, se descarta.
- [ ] `generate-predictions`: aplicar mismo gate al output antes de persistir.
- [ ] `vistaceo-chat`: aplicar gate a respuestas del asistente antes de emitirlas (con regeneración).
- [ ] `weekly-insight-scan` / radar: mismo gate.
- [ ] `send-transactional-email` / templates de re-engagement: aplicar `emailQualityGate` + hyper anchors.

## Fase 2 — CLARIFY que recalcula setup ✅

- [x] Nuevo edge fn `setup-reinterpret` que consume la respuesta CLARIFY + businessTypeId/areaId actuales, llama a Gemini y devuelve `{ areaId, businessTypeId, subSector, confidence, invalidatesPrior }`.
- [x] Persiste histórico en `businesses.settings.reinterpretations` (últimos 10).
- [x] Hook en `SetupStepQuestionnaire.handleCustomSubmit`: dispara reinterpret cuando `trimmed.length >= 20` (fire-and-forget).

## Fase 3 — Setups atascados (0% precisión, businessType incorrecto) ✅ (base)

- [x] Nuevo edge fn `admin-reset-setup`: valida rol admin, limpia `businesses.setup_completed/precision_score/settings.setup_reset_at` y `business_setup_progress` (setup_data, current_step='type', precision=0).
- [x] Botón "Resetear setup" en cada card de `AdminSetupAnswersPage` con confirmación.
- [ ] Detector cliente-side: si `precisión = 0%` + sin respuestas + >5 min → autoreset o CTA "no me representa".

## Fase 4 — Loop Chat→Brain→Generadores hyperconectado

- [ ] Cada mensaje del chat con hechos nuevos (LearnedFact) debe invalidar cache de oportunidades relacionadas (`concept_hash` que tocan la misma área).
- [ ] Trigger DB: cuando `signals` gana un `confirmed_fact` de alta confianza, marcar oportunidades stale del mismo área.
- [ ] Regenerar oportunidad afectada con el nuevo contexto en el próximo scan.

## Fase 5 — Emails ultra-personalizados ✅ (base)

- [x] `send-transactional-email` aplica `emailQualityCheck` antes de encolar. Bloquea envíos genéricos/spammy para templates de reactivación/recovery (detección por nombre). Los transaccionales puros no requieren anchors.
- [x] Log en `email_send_log` con `status='failed'` + `error_message` cuando el gate bloquea.
- [ ] Extender a todos los generadores server-side (reactivation, silent, incomplete setup) para pasar `templateData` con businessName, sector, city.
