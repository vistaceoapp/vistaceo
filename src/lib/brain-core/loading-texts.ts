// Brain Core — Textos de carga inteligentes.
// Reemplazan "loading...", "generating...", "AI thinking..." en cualquier
// estado de espera dentro del producto. No cambian UX/UI, solo el texto.

export const DASHBOARD_LOADING_TEXTS = [
  "Analizando tu modelo de negocio",
  "Conectando oferta, cliente y canal",
  "Detectando la prioridad inicial",
  "Validando oportunidades reales",
  "Preparando tu primera misión",
  "Personalizando tu dashboard",
];

export const CHAT_LOADING_TEXTS = [
  "Cruzando señales del brain",
  "Buscando la respuesta más útil para tu caso",
  "Validando calidad antes de mostrar",
];

export const MISSION_LOADING_TEXTS = [
  "Analizando el cuello de botella",
  "Diseñando los primeros pasos",
  "Conectando la misión con tu objetivo",
];

export function pickLoadingText(pool: string[], tick: number): string {
  if (pool.length === 0) return "";
  return pool[Math.abs(tick) % pool.length];
}
