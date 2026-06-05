// Brain Core — Sanitizado de salida visible.
// Limpia recursivamente cualquier estructura JSON antes de exponerla al usuario:
// - Reemplaza tokens internos por etiquetas humanas o los borra.
// - Quita restos de snake_case dentro de oraciones.
// - Elimina markdown crudo (**, viñetas con * o -).
// - Trimea espacios extra.

import { VISIBLE_LABELS } from "./visible-language.ts";

const INLINE_FORBIDDEN_RE = /\b(why_now|specific_action|impact_score|effort_score|connected_mission|certainty_score|evidence_from_brain|business_brain|business_fingerprint|bottleneck_detector|quality_gate|context_graph|concept_hash|intent_signature|root_problem_signature|mvc_completion|signal_id|system_prompt|assistant_error|fallback)\b/gi;

const ENGINE_RE = /\b(gemini|openai|gpt-?\d?(\.\d)?|claude|llm)\b/gi;

const MARKDOWN_BOLD_RE = /\*\*(.+?)\*\*/g;
const BULLET_RE = /^[ \t]*[*\-•]\s+/gm;

export function sanitizeVisibleString(s: string): string {
  if (typeof s !== "string" || s.length === 0) return s;
  let out = s;
  // Reemplaza tokens internos por su etiqueta humana cuando exista
  out = out.replace(INLINE_FORBIDDEN_RE, (m) => VISIBLE_LABELS[m.toLowerCase()] ?? "");
  out = out.replace(ENGINE_RE, "");
  out = out.replace(MARKDOWN_BOLD_RE, "$1");
  out = out.replace(BULLET_RE, "• ");
  // Inglés residual común
  out = out.replace(/\b(loading|generating|analyzing|debug|market signal|growth engine|AI thinking)\b/gi, "");
  // Espacios y comas colgantes
  out = out.replace(/[ \t]{2,}/g, " ").replace(/\s+([.,;:])/g, "$1").trim();
  return out;
}

/**
 * Sanitiza recursivamente todo string dentro de un objeto/array.
 * No toca claves internas, solo VALORES string.
 */
export function sanitizeForUser<T>(value: T): T {
  if (value == null) return value;
  if (typeof value === "string") return sanitizeVisibleString(value) as unknown as T;
  if (Array.isArray(value)) {
    return value.map((v) => sanitizeForUser(v)) as unknown as T;
  }
  if (typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      out[k] = sanitizeForUser(v);
    }
    return out as unknown as T;
  }
  return value;
}
