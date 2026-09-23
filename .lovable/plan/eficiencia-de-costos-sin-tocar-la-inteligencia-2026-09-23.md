# Eficiencia de costos sin tocar la inteligencia

Regla base de todo el plan: **ningún modelo se degrada, ningún prompt pierde contexto, ninguna instrucción se recorta.** Todo el ahorro viene de no pagar dos veces por lo mismo y de no generar lo que nadie pidió.

## Qué encontré

- Solo 25 resultados guardados en la memoria de reutilización, y únicamente de misiones. Planes de oportunidad, predicciones, resumen del panel, sugerencias de chat y resumen diario **se vuelven a generar cada vez**, aunque el negocio no haya cambiado nada.
- El análisis de mercado del Radar se hace **por negocio**, aunque dos negocios compartan rubro y país: se paga la misma lectura de noticias muchas veces.
- Las revisiones automáticas del blog recorren **las 197 notas** cada 15 días, incluso las que no cambiaron desde la última revisión limpia.
- Cada nota nueva genera **2 imágenes** desde cero; las imágenes son hoy el gasto más caro por nota (unas 6 veces el costo del texto).
- No hay candado contra pedidos duplicados: dos clics seguidos = dos generaciones pagadas.

## Cambios propuestos (en orden de ahorro)

### 1. Reutilización real de resultados (ahorro grande, riesgo cero)
Extender el sistema de memoria que ya existe para misiones a: planes de oportunidad, predicciones, resumen del panel, resumen diario, sugerencias de chat y el análisis de la portada. La clave sigue siendo la firma del cerebro del negocio: si cambió algo relevante, se regenera igual que hoy; si no cambió nada, se devuelve el mismo resultado ya validado. La calidad es literalmente idéntica porque es la misma salida.

### 2. Análisis de mercado compartido por rubro + país (ahorro grande)
La lectura de noticias y tendencias del Radar pasa a hacerse una vez por rubro y país, con vigencia de 24 horas. La **personalización por negocio se mantiene intacta**: sigue habiendo una pasada propia que cruza ese material con el cerebro, el tono y el contexto del negocio. Cambia de dónde sale la materia prima, no la inteligencia aplicada.

### 3. Saltear trabajo sobre contenido que no cambió (ahorro medio)
Las revisiones automáticas del blog guardan una huella del contenido revisado. Si la nota no cambió desde la última revisión aprobada, se saltea. Las notas nuevas o modificadas se revisan exactamente igual que hoy.

### 4. Economía de imágenes del blog (ahorro medio)
Mantener la imagen principal generada con la misma calidad, y para la segunda imagen reutilizar primero la biblioteca de imágenes ya generadas cuando encaja con el tema; generar nueva solo si no hay nada adecuado. Además, cortar la regeneración masiva de imágenes: solo se regenera lo roto o faltante.

### 5. Candado anti-duplicados (ahorro chico, molestia cero)
Bloqueo breve por negocio + tipo de pedido: si ya hay una generación en curso, el segundo pedido espera ese resultado en vez de pagar otra. Elimina el doble cobro por doble clic o por recarga de página.

### 6. Generación bajo demanda en cuentas gratis (ahorro medio)
Los artefactos más caros (predicciones y planes de oportunidad) se generan cuando el usuario los abre, no de forma anticipada, en cuentas gratuitas. Las cuentas Pro no cambian: siguen con todo pregenerado y listo.

## Lo que NO se toca

- Modelos: el chat, las misiones, las oportunidades y las predicciones siguen con los mismos modelos y la misma profundidad.
- Prompts, anclas de contexto, filtros de calidad y controles antifuga: sin cambios.
- Cadencia del blog (1 nota cada 2 días) e indexación 6 veces por día: sin cambios.
- Nada de recortar longitud de respuestas ni límites de tokens.

## Detalle técnico

- Generalizar `_shared/ai-generate-with-cache.ts` (hoy solo `mission` / `radar_mission`) a los tipos `opportunity`, `prediction`, `analytics`, `daily_summary`, `chat_suggestion`; ampliar el enum de `artifact_type` en `ai_artifacts_cache` y agregar `expires_at` opcional para artefactos con vigencia.
- Nueva tabla `market_analysis_cache` (rubro, país, payload, `expires_at` 24 h) consumida por `analyze-patterns` antes del tramo RSS/LLM; la pasada de personalización por negocio queda igual.
- `content_hash` en `blog_content_registry` para que `blog-health-scan`, `blog-content-autoheal` y `obsessive-editor` saltéen notas sin cambios.
- `generate-blog-post`: reutilizar imágenes de `blog_content_registry` por similitud de tema para la imagen secundaria; `bulk-image-refresh` limitado a imágenes rotas/faltantes.
- Candado de concurrencia por `(business_id, artifact_type, artifact_key)` con TTL corto en la tabla de caché.
- Instrumentación: registrar `cache_hit` vs `generated` para poder medir el ahorro real en `/admin`.

## Entrega por etapas

1. Etapa 1: puntos 1 y 5 (reutilización + candado).
2. Etapa 2: punto 2 (mercado compartido) y punto 3 (saltear sin cambios).
3. Etapa 3: puntos 4 y 6 (imágenes y bajo demanda) + panel de ahorro en /admin.
