# Plan: Setup sin fricción + Hiper-personalización

## Diagnóstico (datos reales)

De los últimos usuarios: Melody (DO), Grecia (HN), Silvina (AR - Remax), Clary (MX) — todos abandonaron entre `setup_started` y `setup_step_viewed`. Patrón: **se van en los primeros 2-3 pasos**, antes de ver valor.

Causas detectadas en `SetupPage.tsx` + `setupV7.ts`:
1. **Pide datos antes de mostrar valor** — el usuario no sabe qué obtiene a cambio.
2. **Tipo de negocio rígido** — selector de área + tipo no entiende texto libre tipo "Remax", "consultora freelance de marketing", "vendo cursos online".
3. **Sin progreso visible de personalización** — no se siente que la IA está "aprendiendo de mí".
4. **Países/monedas desacoplados del tipo de negocio** — ya arreglamos ARS/Ecuador, pero falta que el sistema combine país + tipo + texto libre en una sola comprensión.

## Cambios (3 frentes, sin sobrecargar)

### 1. Setup "valor primero" (UX)
- **Paso 0 nuevo (`SetupValueFirst`)**: 1 sola pregunta — *"¿En una frase, qué hacés?"* (textarea libre).
  - Al enviar, llamamos a `classify-business-freetext` (edge nueva, Gemini 2.5 Flash Lite) que devuelve: `{ areaId, typeId, country (si se infiere), confidence, suggestedName, microInsight }`.
  - Mostramos inmediatamente un "micro-insight" personalizado (1 frase tipo *"Detecté que sos inmobiliaria franquiciada en AR — voy a priorizar señales de tasas, dólar y zona"*). Esto es el **wow moment**.
- **Paso 1-2 quedan**, pero pre-rellenados con lo que la IA infirió. El usuario confirma/edita, no escribe desde cero.
- **Skip inteligente**: si confidence > 0.85, ofrecer "Saltar al chat" directo (con setup mínimo).

### 2. Clasificador hiper-personalizado (motor)
- Nueva edge function `classify-business-freetext`:
  - Input: texto libre + país (auto-detectado por IP vía `use-country-detection`).
  - Prompt incluye **catálogo completo** de `setupBusinessTypes.ts` + reglas de marcas conocidas (Remax → inmobiliaria franquicia, McDonald's → gastro franquicia, etc.) + sinónimos LATAM (kiosco/abasto/almacén, ferretería/tlapalería).
  - Output estructurado JSON con `areaId`, `typeId`, `subVertical` (libre), `inferredCountry`, `currencyHint`, `confidence`, `microInsight` (≤120 chars, en español neutro).
  - Guarda señal `business_classified_freetext` en `signals` para que el cerebro la use desde el minuto 0.
- Reglas duras: nunca mezclar moneda extranjera con país (memoria que ya tenés). Si país detectado ≠ país de moneda inferida → forzar moneda local.

### 3. Ramificación dinámica de preguntas
- Tras clasificar, `getActiveSteps()` lee `subVertical` y añade 2-4 preguntas del paquete sectorial correcto (`src/lib/sectorQuestions/...`). Si no hay paquete específico, generamos preguntas con `generate-dynamic-questions` (ya existe).
- Cada respuesta va a `onboarding-ingest` (ya existe) → cerebro aprende en vivo → barra de "Precisión" sube visiblemente (feedback loop).

## Archivos

**Nuevos**
- `supabase/functions/classify-business-freetext/index.ts`
- `src/components/setup/SetupValueFirst.tsx`
- `src/components/setup/MicroInsightCard.tsx`

**Editados**
- `src/pages/SetupPage.tsx` — inyectar Paso 0, manejar skip inteligente.
- `src/lib/setupV7.ts` — soportar pre-relleno desde clasificador, paso `value_first`.
- `src/lib/setupBusinessTypes.ts` — exponer catálogo serializable para el prompt.
- `supabase/config.toml` — registrar nueva edge function (verify_jwt = false).

## Métricas de éxito
- % usuarios que pasan de `setup_started` → `setup_completed` (objetivo: 38% → 60%+).
- Tiempo medio a primer chat post-registro.
- `confidence` promedio del clasificador (objetivo > 0.8).

## Lo que NO hago (para no sobrecargar)
- No agrego más pasos.
- No toco el cuestionario completo (65-75 preguntas) — sigue siendo opcional modo "Complete".
- No toco pagos ni auth.

---

¿Avanzo con esto o querés que ajuste algo (ej: arrancar solo con Paso 0 + clasificador, dejar la ramificación dinámica para una segunda iteración)?
