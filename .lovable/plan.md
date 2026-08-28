# Chat: adjuntos solo Pro, documentos que sí se leen, y puente hacia Misiones/Radar

## Qué pasó en el caso que mostraste (verificado en el código)

En `ChatPage.tsx` el chat envía al modelo **solo el nombre** del archivo adjunto: para imágenes manda la imagen (`dataUrl`), pero para documentos manda `dataUrl: undefined`. Y en la función `vistaceo-chat` solo se inyectan adjuntos de tipo imagen.

Resultado: cuando el usuario subió `ESCUDO ROJO POR CAMBIO DE IMAGEN.xlsx` y pidió "me la puedes armar por favor", el sistema nunca vio una sola celda del archivo. Respondió con teoría genérica sobre tablas resumen porque era literalmente lo único que podía hacer. No es un problema de prompt: el contenido nunca viajó.

## 1. Adjuntar archivos pasa a ser exclusivo de Pro

- En Free el clip de adjuntos se muestra, pero al tocarlo aparece un aviso corto y elegante: adjuntar fotos y documentos es parte de Pro, con botón directo a mejorar el plan. Nada de esconder la función: se ve, se entiende el valor, y ese es el gancho.
- Bloqueo también del lado del servidor: si la cuenta no es Pro, la función descarta los adjuntos y responde sin ellos (nadie lo saltea desde el navegador).

## 2. Cuando sí es Pro, el documento se lee de verdad

- **Excel (.xlsx/.xls) y CSV**: se leen en el navegador y se convierten a texto tabular (hojas, encabezados y filas, con tope de tamaño) que viaja como contexto real de la pregunta. Con eso, "armame la tabla resumen" devuelve la tabla armada con los números del archivo del usuario.
- **PDF**: viaja como documento al modelo, que ya sabe leerlo.
- **Word (.docx) y texto plano**: se extrae el texto y viaja como contexto.
- Si un archivo no se puede leer (formato raro, archivo vacío, demasiado grande), el chat lo dice en una línea y sigue con lo que sí puede hacer. Nunca responde como si lo hubiera leído.
- El documento leído queda como contexto del turno y de los turnos siguientes de esa conversación, así se puede seguir preguntando sobre el mismo archivo.

## 3. Free: menos cantidad, pero que impacte

La idea es que en Free se pueda hacer poco, y que ese poco sea impecable.

- Se mantiene el tope de vida de Free (3 chats, 1 misión, 2 oportunidades, 2 I+D) y se le suma: sin adjuntos.
- Esas 3 respuestas de chat pasan a ser las mejores del sistema: presupuesto de tokens y modelo de análisis completos, sin recortes, con el bloque de entorno (competencia cercana, señales del rubro, datos propios). La primera respuesta que ve una persona nueva tiene que ser la que la convence.
- Cuando se agotan los chats, en vez de un cartel seco, se muestra qué quedó abierto de la conversación y qué desbloquea Pro.

## 4. La gente entra al chat y no vuelve: hacer que el chat empuje

Como el chat es la puerta de entrada real, se conecta hacia el resto en vez de esperar que el usuario descubra los módulos:

- Debajo de una respuesta con recomendaciones accionables aparecen hasta dos acciones directas: **Convertir en misión** (crea la misión con el paso a paso a partir de esa respuesta) y **Ver en Radar** cuando la respuesta se apoya en una señal del sector.
- Al abrir el chat sin conversación previa, en lugar de una pantalla vacía se muestran tres preguntas sugeridas armadas con los datos reales del negocio, más un acceso corto a la misión activa si la hay.
- Cada conversión desde el chat respeta los topes del plan Free ya existentes.

## Detalles técnicos

- `src/components/chat/ChatInput.tsx`: bloqueo de adjuntos por plan y aviso de Pro.
- `src/pages/app/ChatPage.tsx`: extracción de contenido de documentos antes de enviar, envío del texto extraído, persistencia del documento en el contexto de la conversación, acciones bajo la respuesta.
- Librería de lectura de planillas en el cliente (SheetJS) y de `.docx`; PDF viaja como bloque de documento al modelo.
- `supabase/functions/vistaceo-chat/index.ts`: aceptar adjuntos de documento (texto extraído y PDF), validar plan Pro del lado del servidor, inyectar el contenido junto a la pregunta actual.
- Sin cambios de esquema de base de datos.

## Validación

1. Subir un `.xlsx` real como Pro y pedir "armame la tabla resumen": la respuesta tiene que citar valores del archivo.
2. Repetir con cuenta Free: el adjunto no se envía y aparece el aviso de Pro.
3. Confirmar que después de subir el archivo se puede repreguntar sobre él sin volver a subirlo.
4. Verificar que "Convertir en misión" desde una respuesta crea la misión y respeta el tope Free.
