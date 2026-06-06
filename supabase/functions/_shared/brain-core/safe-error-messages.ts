// Brain Core — Mensajes seguros (Parte 3 §12).
// Nunca exponer errores crudos del backend. Devolver un mensaje cuidado que
// preserve la sensación de inteligencia y prudencia.

const SAFE_FALLBACKS = [
  "No quiero darte una respuesta genérica. Necesito confirmar un dato breve para afinar mejor la recomendación.",
  "Estoy ajustando el análisis con la información disponible. Mientras tanto, la señal más clara es la que ya cargaste sobre tu negocio: conviene apoyarse ahí antes de sumar más esfuerzo nuevo.",
  "Para evitar recomendar algo que no aplique a tu caso, necesito una precisión breve sobre el último punto que mencionaste.",
];

export function safeUserFacingError(seed?: string): string {
  const idx = seed ? Math.abs(hashSeed(seed)) % SAFE_FALLBACKS.length : 0;
  return SAFE_FALLBACKS[idx];
}

export function safeRateLimitMessage(): string {
  return "Hay mucha demanda en este momento. Probá nuevamente en unos segundos y la respuesta va a salir con normalidad.";
}

export function safeCreditMessage(): string {
  return "Tu cuenta necesita acreditar uso para continuar generando respuestas avanzadas.";
}

function hashSeed(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return h;
}
