# Plan — Inteligencia + Personalización 100000%

Objetivo: elevar a nivel executive el nivel de personalización y coherencia en **todos** los generadores (oportunidades, chat, radar, predicciones, análisis, emails), y arreglar bugs de setup (CLARIFY que no recalcula, businessType incorrecto, 0% precisión).

## Fase 1 — Hyper-Personalization Gate en generadores ✅ (en curso)

- [x] `analyze-patterns` (oportunidades): insertar solo si la oportunidad ancla ≥2 variables reales del brain (sector, ciudad, cliente, oferta, canal, fricción, nombre negocio). Si no, se descarta.
- [ ] `generate-predictions`: aplicar mismo gate al output antes de persistir.
- [ ] `vistaceo-chat`: aplicar gate a respuestas del asistente antes de emitirlas (con regeneración).
- [ ] `weekly-insight-scan` / radar: mismo gate.
- [ ] `send-transactional-email` / templates de re-engagement: aplicar `emailQualityGate` + hyper anchors.

## Fase 2 — CLARIFY que recalcula setup

Cuando el usuario responde `__CLARIFY__` con texto libre (ej: "trabajo en empresa exportadora, no hago consultoría"):
- [ ] Nuevo edge fn `setup-reinterpret` que consume la respuesta cruda + businessTypeId actual y decide si:
  - Cambiar `businessTypeId` / `sub_sector` / `area`
  - Descartar preguntas irrelevantes ya respondidas
  - Reordenar el resto del cuestionario
- [ ] Hook en `SetupStepQuestionnaire` para invocar `setup-reinterpret` tras cada CLARIFY con >20 chars.
- [ ] Persistir "reinterpretación" en `businesses.business_profile.reinterpretations` para auditoría.

## Fase 3 — Setups atascados (0% precisión, businessType incorrecto)

Ej: Joseph PE, businessTypeLabel="Taller de Escritura Creativa" pero businessName vacío, paso 1-2, 0 respuestas.
- [ ] Detector: si `precisión = 0%` **y** `businessName` vacío **y** `questionIndex = 0` en >5 min → limpiar businessTypeId y forzar re-selección.
- [ ] En `SetupStepType`: mostrar botón "no me representa" que dispara `setup-reinterpret` con las pistas recolectadas.
- [ ] Admin: agregar acción "reset setup" en `AdminSetupAnswersPage`.

## Fase 4 — Loop Chat→Brain→Generadores hyperconectado

- [ ] Cada mensaje del chat con hechos nuevos (LearnedFact) debe invalidar cache de oportunidades relacionadas (`concept_hash` que tocan la misma área).
- [ ] Trigger DB: cuando `signals` gana un `confirmed_fact` de alta confianza, marcar oportunidades stale del mismo área.
- [ ] Regenerar oportunidad afectada con el nuevo contexto en el próximo scan.

## Fase 5 — Emails ultra-personalizados

- [ ] Todos los templates `_shared/transactional-email-templates/*` que reciban `templateData` deben pasar por `emailQualityGate` antes de enviar.
- [ ] Bloquear envíos si el gate reporta gancho genérico o placeholder no reemplazado.
