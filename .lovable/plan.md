# Reparación P0: Setup infalible, post-setup real, misiones completas, cero códigos internos

## Causas raíz encontradas (confirmadas en el código)

1. **Pasos pobres ("Analizar el problema en detalle")**: `RadarPage.tsx` (línea ~542) inserta misiones con 4 pasos genéricos hardcodeados al convertir una oportunidad, sin llamar nunca a `generate-mission-plan`. La misión de la captura nació así.
2. **`[Setup_answer] {...}` y `Q_AI_004` visibles**: `analyze-patterns` y `generate-opportunity-plan` inyectan señales crudas (`[${signal_type}] ${JSON.stringify(content)}`) en el prompt; el modelo las copia en `evidence.signals` y la descripción. El frontend (`OpportunityDetailEnhanced`, `MissionDetailEnhanced`) las renderiza casi sin traducir.
3. **Pantalla final vacía**: tras el toast "¡Tu negocio está listo!" se navega a `/setup-complete`, donde el contenido depende de un `setTimeout` + animaciones; si algo falla queda solo el fondo con confeti. Además no espera ni verifica que el dashboard/misión inicial estén listos.
4. **Setup**: los batches de fondo ya existen, pero falta gate de calidad por pregunta, aclaraciones de conceptos, emoticones sutiles y robustez de avance.

## PARTE 1 — Setup infalible (`SetupStepQuestionnaire.tsx`, `generate-questionnaire`)

- **SetupQuestionGate** (compartido front + edge): rechaza preguntas sin opciones, opciones >2 líneas, >6 opciones, dobles preguntas, demasiado técnicas, sin `targetBrainField`/`healthDimension`/`intentKey`/`affectedModules`. Pregunta rechazada → se reemplaza por una del fallback premium curado (ya existe el pivote, se amplía).
- Prompt de `generate-questionnaire`: opciones cortas y humanas, emoticones sutiles cuando ayuden (⚡ 🕒 📅 ⏳), campo `conceptHelp` obligatorio si la pregunta usa conceptos difíciles (ticket promedio, margen, conversión, etc.) + diccionario local de aclaraciones como respaldo.
- UI: render de `conceptHelp` como nota breve bajo la pregunta; "No sé / Quiero aclarar algo" se mantiene horizontal, sin autoavance, guardando `wasUnknown`/`wasClarification` (verificar que ya cumple y reforzar).
- Avance garantizado: si un batch de fondo falla, se completa con fallback curado silenciosamente; nunca spinner infinito; botón continuar siempre habilitado si hay pregunta renderizada. CTA con `safe-area-inset-bottom` y scroll-into-view del input al abrir teclado (mobile).
- Guardado progresivo por respuesta (localStorage + signals al finalizar, como hoy, pero verificado).

## PARTE 2 — Post-setup sin pantalla vacía (`SetupPage.tsx`, `SetupCompletePage.tsx`)

- `SetupCompletePage`: el contenido se renderiza de inmediato (sin depender de timeouts/animaciones para existir); las animaciones quedan como progressive enhancement. Estado de preparación visible: "Preparando tu dashboard… ✓ Salud inicial ✓ Radar ✓ Primera misión".
- Orquestador `prepareInitialWorkspace(businessId)`: dispara en paralelo y tolera fallos individuales de `analyze-health-score`, `seed-initial-insights`, `dashboard-prepare`; cada fallo emite `fallback_used` y deja estado inicial seguro (la app ya tiene fallbacks, se conectan al flujo).
- Timeout duro (~12s): se redirige a `/app` igual y el resto sigue en background. Nunca cuelga.
- Dashboard con estado inicial garantizado aunque todo el seed falle (fallback contextual por tipo de negocio).

## PARTE 3 — Misiones realmente accionables

- **Eliminar los pasos hardcodeados** de `RadarPage.convertToMission`: ahora siempre llama a `generate-opportunity-plan`/`generate-mission-plan`; la misión se crea con loading y pasos completos. Si la IA falla 2 veces → misión curada premium por tipo de negocio (banco de fallbacks por sector).
- **MissionQualityGate** (edge `_shared` + uso en `generate-mission-plan`, `generate-opportunity-plan` y al convertir): bloquea títulos/resúmenes genéricos, pasos de una línea, lista negra ("Analizar el problema…", "Definir plan de acción", etc. sin desarrollo), pasos sin cómo/ejemplo/métrica/criterio de listo, evidencia cruda, `Q_AI`, `Setup_answer`, JSON. Si falla → regenerar → fallback curado; emite `quality_gate_failed` + `needs_repair`.
- Esquema de paso obligatorio: título, qué hacer, cómo, por qué importa, ejemplo aplicado al negocio, tiempo, dificultad, métrica, error común, criterio de listo. `MissionStepCard`/`MissionStepsView` ya renderizan estructura rica; se garantiza que siempre llegue completa.

## PARTE 4 — Cero códigos internos visibles

- Nuevo `src/lib/humanize-evidence.ts`: `humanizeEvidence(evidence, contextPack)` traduce `Q_AI_xxx` → "según tu respuesta sobre…", `[setup_answer] {…}` → "por lo que respondiste en el diagnóstico (operación/equipo)", dimensiones y campos snake_case → etiquetas humanas. Si no puede traducir → frase genérica segura ("Esta recomendación se basa en tus respuestas del diagnóstico inicial…"), nunca el objeto crudo.
- Aplicarlo en: `OpportunityDetailEnhanced` (Por qué aplica / Disparador), `MissionDetailEnhanced`, `MissionSummaryView`, dashboard insights, predictions, radar.
- **Cortar el leak en origen**: en `analyze-patterns`, `generate-opportunity-plan`, `generate-mission-plan`, `dashboard-prepare`, `uceo-chat`: las señales se pasan al prompt ya humanizadas (questionText + respuesta en texto), nunca `[signal_type] JSON`. Instrucción explícita de prohibición de códigos + sanitización de `evidence.signals` antes de guardar.
- Reforzar `aiOutputSanitizer` (front y edge) con patrones `Q_AI_\d+`, `\[?Setup_answer\]?`, objetos JSON inline, snake_case interno.

## PARTE 5 — Migración de contenido legacy

- Ampliar `migrateLegacyBusinessesToNewIntelligence()` (`src/lib/migrate-legacy-businesses.ts` + edge function de apoyo) con `dryRun`/`apply`:
  - Dry run: lista misiones con pasos pobres/códigos visibles, oportunidades con evidencia cruda, sin tocar datos.
  - Apply: archiva misiones que no pasan el gate, marca `needs_repair`, regenera misión recomendada y pasos, preserva siempre datos reales del usuario (respuestas, mensajes, acciones completadas).
  - Se ejecuta apply solo tras revisar el dry run (lo corro y te muestro el resultado antes).

## PARTE 6 — Tests y QA

- Tests (vitest + tests de edge functions): SetupQuestionGate, MissionQualityGate (bloquea genéricos, Q_AI, Setup_answer), humanizeEvidence (todos los casos del pedido), fallback de batches, wasUnknown/wasClarification, migración detecta misión pobre.
- QA en preview con viewport mobile (390px): flujo completo Consultora Río Tercero — setup completo hasta 14/30 y avance, fin de setup sin pantalla vacía, dashboard generado, misión con pasos completos, sin Q_AI/Setup_answer/JSON, completar paso funciona.
- Sin cambios de layout, navegación, colores ni identidad visual.

## Archivos principales a tocar

`SetupStepQuestionnaire.tsx`, `SetupPage.tsx`, `SetupCompletePage.tsx`, `RadarPage.tsx` (convertToMission), `OpportunityDetailEnhanced.tsx`, `MissionDetailEnhanced.tsx`, `MissionSummaryView.tsx`, nuevo `src/lib/humanize-evidence.ts`, `aiOutputSanitizer` (front/edge), `migrate-legacy-businesses.ts` + edge functions: `generate-questionnaire`, `generate-mission-plan`, `generate-opportunity-plan`, `analyze-patterns`, `seed-initial-insights`, `dashboard-prepare`, `uceo-chat` + `_shared/mission-quality-gate.ts` y `_shared/setup-question-gate.ts` nuevos.