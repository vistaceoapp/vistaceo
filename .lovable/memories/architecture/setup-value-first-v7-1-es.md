---
name: Setup Value-First v7.1
description: Orden de pasos del setup; identidad va PRIMERO con micro-insight wow, país se autodetecta
type: feature
---

# Setup Wizard v7.1 — Value-First Flow

## Orden de pasos (NO cambiar sin razón explícita)

`['identity', 'country', 'business', 'mode', 'questionnaire', 'create']`

- **identity (paso 0)**: textarea libre → `suggest-profiles` (Gemini 2.5 Flash) → 3 opciones con `precision_percent` + `micro_insight` (solo en la #1) → wow moment.
- **country (paso 1)**: pre-rellenado con `useCountryDetection` (IP). El usuario solo confirma.
- El resto se mantiene.

## Por qué este orden
Datos reales: 47% de registrados nunca crean negocio y 56% de los que completan setup no chatean. El cuello estaba en pedir país antes de mostrar valor.

## `suggest-profiles` enhancements (mismo edge function)
- Acepta `country_code` en el body y arma `COUNTRY_CONTEXT` con moneda + jerga local.
- **REGLA DURA**: nunca mezclar moneda extranjera con país (ej. ARS con Ecuador). El prompt lo prohíbe explícitamente.
- **BRAND_RECOGNITION**: Remax, Century 21, McDonald's, OXXO, SmartFit, etc. → mapean directo a subtype "franquicia X".
- **micro_insight**: campo OBLIGATORIO en la opción #1, máx 140 chars, combina país + tipo + ángulo accionable. Renderizado como card destacada con icono Sparkles dentro del card "Recomendado" de `SetupStepIdentityAI`.

## Archivos clave
- `src/pages/SetupPage.tsx` — STEPS order + autodetección de país
- `src/components/setup/SetupStepIdentityAI.tsx` — pasa country_code y renderiza micro_insight
- `supabase/functions/suggest-profiles/index.ts` — prompt enriquecido
