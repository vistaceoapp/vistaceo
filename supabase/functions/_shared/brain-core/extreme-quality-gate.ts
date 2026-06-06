// Brain Core — Quality Gate Extremo (Parte 3 §7).
// Valida cualquier salida visible (chat, misión, oportunidad, pregunta, radar)
// contra una checklist estricta. Devuelve { ok, reasons[] } para decidir si
// se muestra o se regenera.

const GENERIC_PHRASES = [
  /mejorar tu presencia digital/i,
  /aumentar (tus )?ventas/i,
  /captar más clientes/i,
  /optimizar (tus )?procesos/i,
  /ofrecer un buen servicio/i,
  /diferenciarte de la competencia/i,
  /ser constante/i,
  /aportar valor/i,
  /la clave es/i,
  /es importante que/i,
  /recuerda que/i,
  /en el mundo digital actual/i,
  /potencia tu negocio/i,
  /crece exponencialmente/i,
  /estrategia integral/i,
  /soluciones innovadoras/i,
  /transformacion digital/i,
  /presencia online/i,
];

const TECH_LEAKS = [
  /\b(why_now|specific_action|impact_score|effort_score|connected_mission|certainty_score|evidence_from_brain|business_brain|business_fingerprint|bottleneck_detector|quality_gate|context_graph|concept_hash|intent_signature|mvc_completion|signal_id|system_prompt|fallback|prompt)\b/i,
  /\b(gemini|openai|gpt[-_]?\d|claude|llm)\b/i,
  /\b(loading|generating|analyzing|debug|undefined|null)\b/i,
  /assistant error|prompt failed|try again/i,
  /^\s*[\{\[]/, // empieza con JSON
];

const FORBIDDEN_LABELS = [
  /\bnode\b/i, /\bedge\b/i, /\bscore\b/i,
];

export interface QualityCheckInput {
  text: string;
  hasBrainEvidence?: boolean; // hay datos reales del negocio en el contexto
  hasConcreteAction?: boolean; // la salida propone un paso concreto
}

export interface QualityCheckResult {
  ok: boolean;
  reasons: string[];
}

export function extremeQualityCheck(input: QualityCheckInput): QualityCheckResult {
  const reasons: string[] = [];
  const t = (input.text ?? "").trim();

  if (t.length < 12) reasons.push("salida vacía o demasiado corta");

  for (const re of TECH_LEAKS) if (re.test(t)) reasons.push("contiene lenguaje técnico visible");
  for (const re of GENERIC_PHRASES) if (re.test(t)) reasons.push("frase genérica detectada");
  for (const re of FORBIDDEN_LABELS) if (re.test(t)) reasons.push("etiqueta interna visible");

  if (/\*\*/.test(t)) reasons.push("markdown crudo (**)");
  if (/^[ \t]*[*\-]\s+\S/m.test(t) && (t.match(/^[ \t]*[*\-]\s+/gm) || []).length >= 4) {
    reasons.push("lista larga sin priorización");
  }

  // Inglés residual sospechoso
  if (/\b(growth|market signal|business intelligence|AI[- ]?powered|insights)\b/i.test(t)) {
    reasons.push("inglés innecesario");
  }

  if (input.hasBrainEvidence === false) reasons.push("sin evidencia del brain");
  if (input.hasConcreteAction === false) reasons.push("sin acción concreta");

  return { ok: reasons.length === 0, reasons: Array.from(new Set(reasons)) };
}
