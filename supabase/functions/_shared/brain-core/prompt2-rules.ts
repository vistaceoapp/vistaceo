// Brain Core — Prompt 2 rules.
// Convierte cada salida visible (onboarding, dashboard, foco, salud, acción,
// misión, radar, predicción) en una salida específica, validada y conectada
// al brain. No es UI: son fragmentos de prompt + gates lógicos.

// ---------------------------------------------------------------------------
// 1. Onboarding / Próxima mejor pregunta — anti pregunta genérica directa
// ---------------------------------------------------------------------------

export const BANNED_DIRECT_QUESTIONS: RegExp[] = [
  /^\s*¿?\s*cu[aá]l\s+es\s+tu\s+negocio\??/i,
  /^\s*¿?\s*qu[eé]\s+vendes\??/i,
  /^\s*¿?\s*a\s+qui[eé]n\s+le\s+vendes\??/i,
  /^\s*¿?\s*cu[aá]l\s+es\s+tu\s+objetivo\??/i,
  /^\s*¿?\s*cu[aá]l\s+es\s+tu\s+canal\s+principal\??/i,
  /^\s*¿?\s*cu[aá]l\s+es\s+tu\s+mayor\s+problema\??/i,
  /^\s*¿?\s*qu[eé]\s+quieres\s+mejorar\??/i,
  /^\s*¿?\s*c[oó]mo\s+consigues\s+clientes\??/i,
  /^\s*¿?\s*qu[eé]\s+te\s+diferencia\??/i,
  /^\s*¿?\s*cu[aá]l\s+es\s+tu\s+ticket\s+promedio\??/i,
];

export function isGenericDirectQuestion(text: string): boolean {
  if (!text) return false;
  return BANNED_DIRECT_QUESTIONS.some((rx) => rx.test(text.trim()));
}

export const STRATEGIC_QUESTION_SYSTEM = `
REGLAS DE PRÓXIMA MEJOR PREGUNTA (estrictas)

PROHIBIDO formular preguntas directas como:
- "¿Cuál es tu negocio?"
- "¿Qué vendes?"
- "¿A quién le vendes?"
- "¿Cuál es tu objetivo?"
- "¿Cuál es tu canal principal?"
- "¿Cuál es tu mayor problema?"
- "¿Qué quieres mejorar?"
- "¿Cómo consigues clientes?"
- "¿Qué te diferencia?"
- "¿Cuál es tu ticket promedio?"

Si necesitás esa información, REFORMULÁ siempre como una pregunta contextual y
estratégica que justifique POR QUÉ la pregunta importa para la decisión.

Ejemplos válidos:
- En vez de "¿Qué vendes?" → "Para entender el valor real de tu actividad,
  necesito saber qué obtiene la persona cuando te compra: producto, servicio,
  solución, experiencia, transformación, ahorro de tiempo, reducción de riesgo
  u otro resultado."
- En vez de "¿A quién le vendes?" → "Para evitar recomendaciones genéricas,
  necesito distinguir quién consulta, quién decide y quién paga. ¿Suele ser
  la misma persona o participan varias?"
- En vez de "¿Cuál es tu objetivo?" → "Para priorizar bien, necesito elegir
  el tipo de avance que más impactaría ahora: más clientes, convertir mejor
  los que llegan, aumentar ticket, lograr recompra, ordenar procesos o
  liberar tiempo."
- En vez de "¿Cuál es tu mayor problema?" → "Cuando aparece una oportunidad
  de venta o contratación, ¿dónde se pierde más valor: antes de que
  pregunten, cuando consultan, al recibir precio, antes de pagar, después
  de comprar o cuando deberían volver?"

GATES OBLIGATORIOS para cada pregunta candidata (todas deben cumplirse):
1. utilidad estratégica real
2. reduce incertidumbre del brain
3. conectada al país del usuario
4. conectada a oferta / cliente / canal / fricción / objetivo cuando aplique
5. clara y fácil de responder
6. anti genérica, anti plantilla, anti rubro automático
7. no se repite si ya hay respuesta equivalente en el brain
8. tono humano, idioma del país
9. vocabulario profesional sólo si la actividad lo justifica
10. no mezcla vocabulario de países distintos
11. la respuesta puede modificar al menos uno de: brain, foco, salud, acción
    de hoy, misión recomendada, radar, predicción, chat, analíticas o
    próximas preguntas. Si no modifica nada, no se pregunta.
`.trim();

// ---------------------------------------------------------------------------
// 2. Dashboard inicial honesto (low information)
// ---------------------------------------------------------------------------

export const DASHBOARD_NARRATIVE_RULES = `
DASHBOARD INICIAL — REGLAS

Generá una primera lectura ejecutiva HONESTA. Nunca inventes datos.
Debe contener:
- mensaje principal personalizado (usa el nombre real del negocio)
- foco actual justificado (de la lista permitida)
- salud prudente (no afirmar números si no hay evidencia)
- acción de hoy concreta y rápida (<30 min)
- misión recomendada única para este caso
- radar inicial aplicado (no tendencias sueltas)
- preguntas de aprendizaje útiles que muevan el brain
- nivel de certeza explicado humanamente, sin variables internas

Si la información es baja, declarar honestamente que se está construyendo el
mapa real del negocio antes de recomendar acciones, y proponer la pregunta
que más reduce incertidumbre. Ejemplo:
"Estoy construyendo el mapa real de <Nombre>. Antes de recomendar acciones,
necesito confirmar si el crecimiento depende de más clientes, más recompra,
mejor ticket o mejor conversión. Esa diferencia cambia toda la estrategia."

Nunca mostrar campos internos (estado, certeza numérica cruda, pesos,
relaciones, IDs, JSON). Sólo lenguaje ejecutivo.
`.trim();

// ---------------------------------------------------------------------------
// 3. Foco actual — lista cerrada y justificación
// ---------------------------------------------------------------------------

export const ALLOWED_FOCUS = [
  "ventas", "conversión", "recompra", "rentabilidad", "ticket promedio",
  "reputación", "operación", "equipo", "datos", "tráfico", "autoridad",
  "diferenciación", "retención", "automatización",
  "experiencia del cliente", "oferta", "canal", "seguimiento", "confianza",
  "agenda", "recurrencia",
] as const;

export const FOCUS_JUSTIFIER_RULES = `
FOCO ACTUAL — REGLAS
El foco debe ser una decisión ejecutiva tomada de esta lista cerrada:
${ALLOWED_FOCUS.join(", ")}.

Siempre devolver:
- foco elegido
- justificación en 1-2 oraciones que conecte con la evidencia del brain
- si la certeza es baja, decir "Foco sugerido:" en vez de "Foco actual:"
  y mencionar qué falta confirmar.

Prohibido: inventar métricas, prometer resultados, usar jerga decorativa.
`.trim();

// ---------------------------------------------------------------------------
// 4. Acción de hoy
// ---------------------------------------------------------------------------

export const DAILY_ACTION_RULES = `
ACCIÓN DE HOY — REGLAS
- Realizable en menos de 30 minutos.
- Específica, no genérica (no "mejora la operación", sí "revisa los últimos
  10 contactos y marcá dónde se frenó cada uno").
- Conectada al brain: producto, canal, fricción, foco actual.
- Devuelve una micro-decisión posterior, no sólo una tarea.
- Usa vocabulario profesional sólo si la actividad lo justifica (legal,
  salud, gastronomía, ecommerce, B2B, educación, turismo, oficios).
`.trim();

// ---------------------------------------------------------------------------
// 5. Misiones hiperúnicas
// ---------------------------------------------------------------------------

export const FORBIDDEN_MISSION_TITLES: RegExp[] = [
  /mejora\s+tu\s+presencia\s+digital/i,
  /aumenta\s+tus\s+ventas/i,
  /publica\s+m[aá]s\s+contenido/i,
  /genera\s+m[aá]s\s+leads/i,
  /optimiza\s+tu\s+marketing/i,
  /automatiza\s+procesos?/i,
  /conoce\s+mejor\s+a\s+tu\s+cliente/i,
  /diferenci[aá]te\s+de\s+la\s+competencia/i,
  /aprovecha\s+la\s+ia/i,
];

export function isForbiddenMissionTitle(title: string): boolean {
  if (!title) return false;
  return FORBIDDEN_MISSION_TITLES.some((rx) => rx.test(title));
}

export const MISSION_UNIQUENESS_RULES = `
MISIONES HIPERÚNICAS — REGLAS
Toda misión debe pasar gates: unicidad, evidencia, oferta, cliente, canal,
país, vocabulario profesional adecuado, fricción identificada, objetivo,
métrica observable, esfuerzo realista, impacto, anti plantilla, conexión
con radar y salud, claridad UX y factor wow.

PROHIBIDO devolver misiones equivalentes a:
- "Mejora tu presencia digital"
- "Aumenta tus ventas"
- "Publica más contenido"
- "Genera más leads"
- "Optimiza tu marketing"
- "Automatiza procesos"
- "Conoce mejor a tu cliente"
- "Diferénciate de la competencia"
- "Aprovecha la IA"

Ejemplos correctos:
- Café: "Detecta si el crecimiento depende de recompra o de nuevos clientes
  esta semana."
- Estudio jurídico: "Ordena el paso entre consulta inicial y decisión de
  avanzar con el caso."
- Ecommerce: "Ubica la fuga principal entre visita, carrito, checkout y
  recompra."
- Clínica estética: "Convertí dudas frecuentes sobre confianza, precio y
  resultados en una secuencia de reserva más clara."
- B2B / consultora: "Mapeá dónde se frena más una oportunidad: reunión,
  propuesta, precio, aprobación o seguimiento."
`.trim();

// ---------------------------------------------------------------------------
// 6. Radar aplicado
// ---------------------------------------------------------------------------

export const APPLIED_RADAR_RULES = `
RADAR APLICADO — REGLAS
El radar no trae tendencias sueltas. Cada ítem debe responder:
1. qué señal se detectó
2. por qué importa para ESTE caso (nombre, país, actividad real)
3. qué oportunidad abre
4. qué hacer primero
5. qué observar a partir de ahora
6. qué misión conecta con esta señal

Si no podés justificar los 6 puntos con evidencia mínima del brain o del
contexto local, NO emitas el ítem.
`.trim();

// ---------------------------------------------------------------------------
// 7. Predicciones prudentes
// ---------------------------------------------------------------------------

export const PRUDENT_PREDICTIONS_RULES = `
PREDICCIONES PRUDENTES — REGLAS
- Usá escenarios condicionales ("Si … entonces …"), no promesas.
- PROHIBIDO inventar porcentajes. Sólo usar números si el usuario los cargó
  o si el cálculo es explicable a partir del brain.
- Cada predicción debe sugerir una observación o ajuste posterior, no
  cerrarse en sí misma.

Ejemplos válidos:
- "Si la mayoría de ventas viene de clientes nuevos, existe riesgo de
  depender demasiado de captación constante."
- "Si muchos clientes compran una vez y no vuelven, la oportunidad puede
  estar en una misión de recompra."
- "Si el problema aparece después del precio, probablemente no falten
  clientes: falta mejorar percepción de valor o seguimiento."
- "Si en un estudio jurídico muchas consultas se frenan al hablar de
  honorarios, la oportunidad no necesariamente está en más consultas, sino
  en explicar mejor valor, alcance y próximos pasos."
`.trim();

// ---------------------------------------------------------------------------
// 8. Helper unificado para inyectar todas las reglas según el módulo
// ---------------------------------------------------------------------------

export type Prompt2Module =
  | "question"
  | "dashboard"
  | "focus"
  | "action"
  | "mission"
  | "radar"
  | "prediction"
  | "health";

export function prompt2Rules(mod: Prompt2Module): string {
  switch (mod) {
    case "question":   return STRATEGIC_QUESTION_SYSTEM;
    case "dashboard":  return DASHBOARD_NARRATIVE_RULES;
    case "focus":      return FOCUS_JUSTIFIER_RULES;
    case "action":     return DAILY_ACTION_RULES;
    case "mission":    return MISSION_UNIQUENESS_RULES;
    case "radar":      return APPLIED_RADAR_RULES;
    case "prediction": return PRUDENT_PREDICTIONS_RULES;
    case "health":     return DASHBOARD_NARRATIVE_RULES;
  }
}
