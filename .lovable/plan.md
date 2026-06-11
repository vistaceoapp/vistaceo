# Fix integral: setup completo, tono humano, radar y misiones inmersivas

Atacamos 4 problemas reales que detectaste en el negocio "Abogado prueba":

1. Setup "completo" devuelve 18 de 30 preguntas
2. Hay que esperar a que carguen todas para arrancar
3. Dashboard habla en métricas frías ("30/100", "Crítico") en vez de lenguaje humano
4. Radar y Misiones se quedan cortos: poca info, sin despliegue inmersivo, sin pasos completos

---

## 1. Setup completo: 30/30 preguntas garantizadas + carga progresiva

**Problema técnico:** `generate-questionnaire` pide a Gemini 65-75 preguntas en un solo shot. El modelo trunca por `maxOutputTokens` y devuelve 18-25. No hay reintentos ni completado.

**Cambios:**
- `supabase/functions/generate-questionnaire/index.ts`
  - Modo `complete` pasa a generar en **batches de 10** preguntas (3 batches paralelos para llegar a 30 rápido).
  - Subir `maxOutputTokens` por batch.
  - Validar cantidad recibida y, si falta, llamar un batch extra de completado pidiendo solo "N preguntas restantes en las dimensiones X, Y".
  - Garantía dura: nunca devolver menos de lo pedido. Si el modelo falla 2 veces, completar con plantillas hyper-personalizadas del sector.
- `src/components/setup/SetupStepQuestionnaire.tsx` / `src/lib/setupV7.ts`
  - **Streaming progresivo real:** mostrar las primeras 10 preguntas apenas llega el primer batch, permitir responder mientras los siguientes 2 batches cargan en background.
  - Indicador sutil "Cargando más preguntas…" en el footer, no bloqueante.
  - Si el usuario termina las primeras 10 antes de que llegue el siguiente batch, mostrar skeleton 1.5s máx.

## 2. Dashboard con voz humana (no métricas crudas)

**Problema:** "30/100", "40 Crítico", "Abogado prueba: el problema hoy es reputación (30/100)". Eso es un report, no un asistente.

**Cambios en `src/components/app/DashboardHero.tsx` + `supabase/functions/dashboard-prepare/index.ts`:**
- Mapear scores numéricos a frases humanas (ya existe `business-health-semantic-system-v5-es` en memoria — usarla):
  - 0-30 → "reputación muy baja" / "necesita atención urgente"
  - 31-50 → "reputación floja"
  - 51-70 → "reputación correcta, hay margen"
  - 71-85 → "reputación sólida"
  - 86-100 → "reputación excelente"
- Eliminar el número crudo del hero. Mantenerlo solo en analytics si el usuario abre detalle.
- Mensaje hero reescrito por IA con tono cálido + emojis sutiles (1 por mensaje, no decoración):
  - "Buenas tardes, Abogado prueba 👋 Hoy tu reputación está floja y es lo que más te frena. Si la trabajamos esta semana, vas a sentir un salto real en confianza de clientes."
- Quitar la palabra "Crítico" como badge. Reemplazar por "Prioridad de la semana" en tono neutro.

## 3. Radar de oportunidades inmersivo

**Problema:** Se ven tarjetas chicas, al abrir una oportunidad la info es pobre.

**Cambios:**
- `supabase/functions/radar-deep-dive/index.ts` (nuevo o ampliar existente): cuando el usuario abre una oportunidad/tendencia, llamar a Gemini 2.5 Pro con el brain completo del negocio y generar:
  - Resumen ejecutivo (2 líneas)
  - Por qué le importa a *este* negocio específico (justificación con datos del brain)
  - Tamaño de mercado / urgencia (cualitativo, no inventar números)
  - 3-5 movimientos concretos para capturarla
  - Riesgos / contraindicaciones
  - Fuentes externas reales (Gate 0 de `radar-external-source-validation-es`)
- `src/pages/app/RadarPage.tsx` + nuevo `src/components/radar/OpportunityDeepDive.tsx`:
  - Al click, abrir Sheet/Dialog full-height con secciones colapsables animadas (framer-motion)
  - Skeleton mientras carga el deep-dive
  - CTA "Convertir en misión" destacado al final
- Filtro de calidad: si una oportunidad no pasa el Gate 0 (sin fuente real) o el score < 75, no se muestra. Cero ruido.

## 4. Misiones con guía paso a paso completa

**Problema:** Misiones quedan superficiales.

**Cambios:**
- `supabase/functions/generate-mission-plan/index.ts`: forzar estructura completa, 8-12 pasos, cada paso con:
  - Título corto
  - Por qué (1 línea conectada al brain)
  - Cómo hacerlo (3-6 sub-bullets concretos)
  - Tiempo estimado
  - Resultado esperado
  - Checklist de validación
- Añadir "Resumen ejecutivo" + "Qué vas a lograr" + "Indicadores de éxito" en el header de la misión.
- `src/pages/app/MissionsPage.tsx` / `MissionDetail`:
  - Layout tipo "manual operativo": índice lateral sticky, paso activo expandido, animaciones suaves entre pasos.
  - Botón "Marcar paso completado" que escribe al brain (ya conectado).

---

## Orden de implementación

1. Setup batching + progresivo (desbloquea pruebas reales)
2. Dashboard tono humano (cambio visible inmediato)
3. Radar deep-dive
4. Misiones manual operativo

## Detalles técnicos clave

- IA: `google/gemini-2.5-pro` para deep-dives (radar + misiones), `gemini-3-flash-preview` para batches de setup (rápido).
- Todos los nuevos eventos siguen escribiendo al brain vía `brain-record-signal` (ya está el hook `use-brain-signal`).
- Sin nuevas tablas. Reutilizamos `opportunities.deep_dive_json` y `missions.plan_json` (agregamos columnas si faltan vía migración mínima).
- Respeta memoria: nada de verde para salud, 100% español, sin anglicismos, "VISTACEO" uppercase.

¿Confirmás que arranque por el orden 1→4, o querés que empiece por otro (ej: dashboard primero para verlo ya)?
