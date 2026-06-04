// Brain Core — Capa de lenguaje visible.
// Traduce campos internos a etiquetas humanas en español.
// Se usa cuando el motor expone datos al usuario.

export const VISIBLE_LABELS: Record<string, string> = {
  why_now: "Por qué aplica a tu caso",
  specific_action: "Primer paso recomendado",
  impact_score: "Impacto estimado",
  effort_score: "Esfuerzo estimado",
  metric: "Qué deberías medir",
  connected_mission: "Misión relacionada",
  certainty_score: "Confianza del análisis",
  evidence_from_brain: "Por qué aplica a tu caso",
  business_brain: "Tu contexto",
  business_fingerprint: "Tu contexto",
  bottleneck_detector: "Señal detectada",
  quality_gate: "Calidad",
  context_graph: "Tu contexto",
  node: "Elemento",
  edge: "Conexión",
  score: "Prioridad",
  fallback: "Recomendación general",
  prompt: "Instrucción",
  business_id: "Negocio",
  owner_id: "Usuario",
  primary_business_type: "Tipo de actividad",
  current_focus: "Foco actual",
  confirmed: "Confirmado",
  inferred: "Inferido",
  possible: "Posible",
  doubtful: "Por validar",
  discarded: "Descartado",
  pending: "Por validar",
};

export function visibleLabel(key: string): string {
  return VISIBLE_LABELS[key] ?? key;
}

// Lista negra de tokens que NUNCA deben aparecer en texto visible.
const FORBIDDEN_TOKENS = [
  "why_now", "specific_action", "impact_score", "effort_score",
  "connected_mission", "certainty_score", "evidence_from_brain",
  "business_brain", "business_fingerprint", "bottleneck_detector",
  "quality_gate", "context_graph", "concept_hash", "intent_signature",
  "root_problem_signature", "mvc_completion", "business_type",
  "owner_id", "business_id", "signal_id", "fallback",
  "system_prompt", "assistant_error", "debug", "undefined", "null",
];

export function containsForbiddenTokens(text: string): boolean {
  if (!text) return false;
  const lower = text.toLowerCase();
  return FORBIDDEN_TOKENS.some(t => lower.includes(t));
}
