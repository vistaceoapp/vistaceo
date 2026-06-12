# Arreglo integral: setup, dashboard inicial, misiones y UX premium

## Diagnóstico (causas reales encontradas)

1. **Solo 18 preguntas en modo Completo**: el cuestionario se genera en 3 lotes (12 + 11 + 11). Los lotes en segundo plano (a) pierden todo el contexto del negocio (solo envían rubro y país, no la descripción, dolores ni objetivos → preguntas "que no tienen nada que ver"), (b) tienen un tope de tokens demasiado bajo para el formato bilingüe (se truncan y se descartan preguntas), y (c) si un lote falla, el sistema se queda con lo que hay sin reintentar → 18 en vez de 30.

2. **Dashboard con contenido genérico**: el contenido inicial se dispara DOS veces en paralelo (una desde el final del setup y otra desde la pantalla "Preparando tu dashboard"). Los registros confirman 3 ejecuciones simultáneas: una insertó los rellenos genéricos ("Activá tu presencia digital", "Las reseñas verificadas…") antes de que la IA terminara en la otra. Resultado: misión y tendencias de plantilla en vez de hiper-personalizadas.

3. **"No se pudo crear la misión"**: el plan Gratis permite 1 misión de por vida, y esa misión ya la consumió el contenido inicial. Al convertir una oportunidad, la base de datos bloquea la segunda misión, pero la UI muestra un error genérico en vez de explicar el límite y ofrecer Pro.

4. **UX del cupo agotado**: dos botones con el mismo peso visual compiten ("Desbloquear con Pro" + "Recargar +1").

5. **Splash "Preparando tu dashboard"**: el logo de arriba se ve lavado dentro del tile degradado.

## Cambios

### 1. Cuestionario Completo: 30-35 preguntas impecables, siempre
- Enviar el contexto completo del negocio (descripción libre, dolores, objetivos, keywords) también a los lotes en segundo plano.
- Generar solo en español (eliminar duplicación pt-BR cuando el idioma es es) y subir el tope de tokens → sin truncamiento.
- Verificación de cantidad: si tras unir los lotes hay menos de 30, el cliente pide automáticamente las preguntas faltantes (con las respuestas ya dadas como contexto) hasta llegar a 30-35.
- Refuerzo del prompt: opciones con emojis sobrios cuando el rubro lo permite, redacción dinámica y perfecta (ya está en el prompt; se mantiene y se valida).

### 2. Contenido inicial 100% personalizado (cero genéricos)
- Eliminar la invocación duplicada desde el final del setup: solo la pantalla "Preparando tu dashboard" dispara la generación.
- Candado de idempotencia en la función (marca "seeding en curso" en el negocio): ejecuciones concurrentes esperan o salen, nunca insertan duplicados.
- La IA tiene prioridad absoluta: reintento automático antes de tocar cualquier relleno genérico; el genérico queda solo como último recurso si la IA falla 2 veces.
- Las oportunidades/tendencias generadas pasan el gate de calidad (explicación completa de qué es, por qué aplica y qué hacer) antes de insertarse.

### 3. Convertir en misión: límite claro, no error
- Detectar el cupo antes: si el usuario Gratis ya tiene su misión, el botón "Convertir en misión" abre un diálogo premium explicando el límite (1 misión en Gratis) con CTA a Pro — nunca un toast rojo "Error".
- Si la base de datos bloquea por límite, capturar ese error específico y mostrar el mismo diálogo (no el error genérico).

### 4. UX cupo agotado (Radar)
- Una sola jerarquía: CTA principal "Desbloquear con Pro", debajo el botón de recarga como acción secundaria sutil (solo visible cuando pasaron 30 días), y "Volver al inicio" como enlace de texto.

### 5. Splash más premium
- Reemplazar el tile degradado con logo lavado por el wordmark/isotipo nítido de VISTACEO sobre fondo limpio con halo sutil, manteniendo las fases animadas y el check final.

## Detalles técnicos
- Archivos: `supabase/functions/generate-questionnaire/index.ts`, `src/components/setup/SetupStepQuestionnaire.tsx`, `supabase/functions/seed-initial-insights/index.ts`, `src/pages/SetupPage.tsx`, `src/pages/app/PreparingDashboardPage.tsx`, `src/pages/app/RadarPage.tsx`, componente de cupo agotado en `RadarPage`/`FreeLimitsIndicator`.
- El candado de idempotencia usa `businesses.settings.seeding_started_at` (sin migración nueva).
- Verificación final: prueba real de la función de cuestionario (conteo ≥30) y de seed con un negocio de prueba, más revisión visual del splash y los diálogos.
