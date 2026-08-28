# Chat VISTACEO: cero texto cortado + inteligencia extrema

## Problema confirmado (leído en el código)

En `supabase/functions/vistaceo-chat/index.ts`:

- El presupuesto de salida es chico y fijo: `maxTokens = 220` (trivial), `800` (normal), `1100` (complejo). Una respuesta con análisis se corta a mitad de idea.
- El código **nunca lee `finish_reason`** de la respuesta del modelo. Si el modelo se quedó sin tokens, la app entrega igual el texto cortado.
- El único detector de corte (`isLowQualityReply` → `truncated_tail`) solo salta cuando la última palabra es una conjunción tipo "y", "de", "para". Si corta en medio de un sustantivo o después de una coma, pasa el filtro.
- El reintento de calidad usa el mismo `max_tokens`, así que vuelve a cortarse.

Ese es el motivo real del texto cortado; no es el prompt.

## Qué se va a hacer

### 1. Nunca más un texto cortado

- Subir el presupuesto de salida: trivial 400, normal 1400, complejo 2200. Suficiente para cerrar la idea sin volverse interminable.
- Leer `finish_reason` en cada llamada. Si viene `length`, no se muestra ese texto: se hace **una** llamada de cierre que continúa exactamente donde quedó y termina la idea (sin repetir lo ya dicho), y se concatena.
- Endurecer el detector de corte: además de conjunciones, marcar como cortado cuando el texto termina sin puntuación final, con coma, con dos puntos, con guion o con una lista numerada abierta.
- Última red: si aún así el final quedó abierto, recortar hasta la última oración completa antes de mostrarlo. Un párrafo entero y cerrado siempre es mejor que una frase colgada.

### 2. Longitud con criterio, no infinita

Regla explícita en el prompt: cerrar la idea, no estirarla. Objetivo 3 a 6 párrafos cortos en respuestas de análisis, 1 a 2 en respuestas simples. Prohibido abrir un tema nuevo cuando queda poco margen: mejor terminar bien lo que se dijo.

### 3. Inteligencia extrema: que diga "waaaw"

El chat hoy usa el negocio propio (brain, misiones, oportunidades, salud). Le falta el "alrededor". Se agrega al contexto del chat, reusando datos que ya existen en la base:

- **Entorno competitivo**: `business_competitors` (rating, cantidad de reseñas, fortalezas) para comparar al usuario contra su cuadra/zona real.
- **Señales de industria vivas**: últimas `signals` y `opportunities` del sector con su fecha, para hablar de lo que está pasando ahora y no de teoría.
- **Datos externos**: `external_data` y `metrics_timeseries` cuando existan, para citar números propios en vez de generalidades.
- **Comparación contra base sectorial**: usar `sector-baselines` para decir "tu ticket está X% abajo de lo típico en tu rubro y país", que es exactamente el tipo de conclusión que el usuario no puede sacar solo.

Y una directiva nueva de razonamiento antes de responder: cruzar al menos dos fuentes distintas (por ejemplo un dato propio + una referencia del entorno) y ofrecer **una conclusión no obvia** que el usuario probablemente no pensó, marcada como hipótesis cuando corresponda. Si no hay datos para eso, decirlo con franqueza en vez de inventar.

### 4. Modelo acorde

Pasar las consultas de análisis al modelo Gemini de última generación (más capacidad de razonamiento) y dejar el modelo liviano solo para mensajes triviales. El costo por mensaje sube poco porque la mayoría de los mensajes triviales siguen en el modelo barato.

## Detalles técnicos

Archivos a tocar:

- `supabase/functions/vistaceo-chat/index.ts`: presupuesto de tokens, lectura de `finish_reason`, llamada de continuación, selección de modelo, carga de contexto de entorno (competidores, señales, datos externos, baseline sectorial), nueva directiva de razonamiento cruzado.
- `supabase/functions/_shared/brain-core/chat-context-summary.ts`: sumar bloques de entorno competitivo, señales de industria y comparación contra baseline al resumen ejecutivo que se inyecta.
- Detector de corte y recorte a oración completa: en el mismo módulo donde ya vive `isLowQualityReply`.

Sin cambios de esquema de base de datos ni de la interfaz del chat.

## Validación

1. Pedir un análisis largo ("analizá mi negocio a fondo y decime qué no estoy viendo") y verificar que la respuesta termina en punto y con la idea cerrada.
2. Forzar una respuesta larga y confirmar en los registros que, si aparece `finish_reason: length`, se dispara la continuación y el texto final queda completo.
3. Verificar que la respuesta cita al menos un dato propio y una referencia del entorno o del rubro.
4. Confirmar que un mensaje trivial sigue respondiendo rápido y corto.

## Costo estimado

3 a 5 créditos de build, más 1 a 2 créditos de pruebas reales contra el modelo.
