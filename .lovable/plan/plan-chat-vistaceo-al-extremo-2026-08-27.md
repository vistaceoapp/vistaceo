# Plan: Chat VISTACEO al extremo

## Objetivo
Transformar el chat para que nunca cruce mensajes, siempre responda exactamente la última pregunta, y se sienta como hablar con el experto número uno del negocio y sector del usuario. Conectarlo con misiones, radar y oportunidades.

## Hallazgos iniciales
1. **Riesgo de cruce en `ChatPage.tsx`**: `messagesForAI` usa el cierre de `messages` en vez de leer el estado actual; `setMessages(prev => [...prev.slice(0,-1), ...])` asume que el último mensaje es siempre el temporal.
2. **Respuesta genérica / desviada**: el system prompt pide responder el último mensaje, pero el contexto inyectado es enorme (BRAIN_JSON, STATE_JSON, deep recall, preferencias, anclajes) y puede confundir al modelo.
3. **No hay streaming**: la llamada es síncrona (`stream: false`), el usuario espera sin feedback de tokens.
4. **Conexión con acciones**: las misiones sugeridas existen pero son opcionales y no siempre se generan.

## Cambios propuestos

### 1. Estado del chat a prueba de carreras
- Usar una cola de turnos en el frontend: encolar cada mensaje del usuario y procesar uno a la vez.
- Generar IDs estables (`crypto.randomUUID`) para cada turno y asociar la respuesta al turno correcto.
- Nunca usar `messages` del cierre para armar el payload; usar el estado funcional más reciente.

### 2. Backend: responder SIEMPRE al último mensaje
- Añadir validación estructurada del body con Zod.
- Antes de llamar al modelo, extraer el último mensaje del usuario y pasarlo como instrucción explícita separada del historial.
- Limitar el historial a los últimos 10 turnos y resumir turns antiguos si hay más de 10.
- Reforzar el system prompt: "Tu respuesta visible debe ser una respuesta directa y completa al ÚLTIMO mensaje del usuario. No des contexto previo salvo que ayude a responder ESTE mensaje."

### 3. Contexto del negocio sin saturar al modelo
- Crear `buildChatContextSummary`: solo los 8-12 datos más relevantes del negocio para la pregunta actual.
- Usar el último mensaje para rankear qué datos son relevantes (ej: si pregunta de ventas, priorizar funnel; si pregunta de equipos, priorizar staff).
- Eliminar JSON crudo del prompt; usar bullets en español.

### 4. Streaming de respuestas
- Cambiar el edge function a `stream: true` y devolver SSE.
- Adaptar el frontend para renderizar tokens progresivamente con `DefaultChatTransport` / `useChat` del AI SDK, o con fetch manual si el refactor es menor.

### 5. Conexión chat → misiones / radar / oportunidades
- En cada respuesta, el modelo debe evaluar si la conversación reveló una acción concreta. Si es así, devolver `missions_suggested` con título, descripción, prioridad y pasos.
- En el frontend, mostrar la tarjeta de misión sugerida de forma prominente y permitir activarla con un click.
- Si el usuario describe una tendencia o competidor, disparar señal para radar.

### 6. Métricas y guardas
- Loguear en `chat_messages` el `turn_id` y el `parent_turn_id` para poder auditar cruces.
- Añadir un health check en el edge function: si la respuesta parseada no contiene palabras clave del último mensaje, reintentar una vez.

## Archivos a tocar
- `src/pages/app/ChatPage.tsx`
- `supabase/functions/vistaceo-chat/index.ts`
- `src/components/chat/ChatMessage.tsx` (render de streaming)
- `src/lib/context-pack-builder.ts` (resumen chat-friendly)
- Posible nuevo: `supabase/functions/_shared/brain-core/chat-context-summary.ts`

## Costo estimado
- Build: 4-6 créditos (refactor grande de frontend + edge function).
- AI testing: 1-2 créditos de gateway para validar respuestas.

## Validación
1. Enviar 3 mensajes seguidos rápido y verificar que cada respuesta corresponde a su pregunta.
2. Preguntar algo específico del negocio y verificar que la respuesta menciona datos reales del brain.
3. Pedir "hacé una misión para eso" y verificar que se crea la misión.
4. Verificar que no hay fugas de JSON ni códigos internos.
