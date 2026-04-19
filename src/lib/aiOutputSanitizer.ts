/**
 * AI OUTPUT POST-PROCESSOR — P0 ZERO LEAKAGE (Capa 6)
 * 
 * Filters AI-generated content to remove internal codes, 
 * raw keys, English fragments, and technical metadata.
 * 
 * Usage: Call sanitizeAIOutput(text) on ALL AI-generated content
 * before sending to the client.
 */

// Patterns to strip from AI output
const AI_LEAK_PATTERNS = [
  /\bQ_[A-Z]{2,}_\d{2,}\b/g,                    // Q_BIO_104, Q_MD_005
  /\b[a-z]+_[a-z]+_\d{3}\b/g,                    // b2b_arq_finance_001
  /\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b/g, // UUIDs
  /\(Q_[^)]+\)/g,                                 // (Q_BIO_104)
  /\([A-Z_]{3,}\d*\)/g,                           // (CATEGORY_CODE)
  /`[a-z_]+`/g,                                    // `snake_case` backtick-wrapped
  /\bopt_[a-z_]+(?:_(?:high|low|mid|none))?\b/gi,  // opt_margin_high, opt_revenue_low
  /\bno_(?:proof|record|data|match)\b/gi,           // no_proof, no_record
  /\bconcept_hash\b/g,
  /\bintent_signature\b/g,
  /\broot_problem_signature\b/g,
  /\bquality_gate\b/g,
  /\bmvc_completion\b/g,
  /\bbusiness_type\b/g,
  /\bowner_id\b/g,
  /\bbusiness_id\b/g,
  /\bauth\.uid\(\)/g,
  /\bCODE_BLOCK[_\s]*\d+\b/gi,                     // CODE_BLOCK_0
  /\bsignal_id\b/g,
  /\btrain_new\b/g,
  /\bmanual_agenda\b/g,
];

// Technical English words that should be translated
const TECH_ENGLISH_MAP: Record<string, string> = {
  "undefined": "",
  "null": "",
  "NaN": "",
  "true": "sí",
  "false": "no",
  "error": "error",
  "loading": "cargando",
  "pending": "pendiente",
  "success": "éxito",
  "failed": "falló",
  "retry": "reintentar",
};

// Business type internal codes → labels en español (evita "fast_casual" leakeado por la IA)
const BUSINESS_TYPE_LABELS: Record<string, string> = {
  fast_casual: "negocio de comida rápida casual",
  fine_dining: "restaurante de alta gama",
  casual_dining: "restaurante casual",
  food_truck: "food truck",
  dark_kitchen: "cocina oculta",
  ghost_kitchen: "cocina oculta",
  cafe: "cafetería",
  bar: "bar",
  bakery: "panadería",
  ice_cream: "heladería",
  catering: "catering",
  hotel: "hotel",
  retail: "comercio",
  ecommerce: "tienda online",
  beauty: "negocio de belleza",
  fitness: "gimnasio",
  real_estate: "inmobiliaria",
  consulting: "consultora",
  agency: "agencia",
  freelance: "negocio independiente",
  construction: "constructora",
  professional: "estudio profesional",
  restaurant: "restaurante",
};

export function sanitizeAIOutput(text: string | null | undefined): string {
  if (!text || typeof text !== 'string') return '';
  
  let result = text;

  // Replace internal business type codes with Spanish labels (case-insensitive, word-boundary)
  for (const [code, label] of Object.entries(BUSINESS_TYPE_LABELS)) {
    const re = new RegExp(`\\b${code}\\b`, 'gi');
    result = result.replace(re, label);
  }
  
  // Remove code patterns
  for (const pattern of AI_LEAK_PATTERNS) {
    pattern.lastIndex = 0;
    result = result.replace(pattern, '');
  }
  
  // Remove "Q_BIO_104: value" style signal strings
  result = result.replace(/Q_[A-Z_]+\d*:\s*[a-z_]+/gi, '');
  
  // Remove empty parentheses left over
  result = result.replace(/\(\s*\)/g, '');
  
  // Remove orphan colons from cleaned signals (e.g., ": ")
  result = result.replace(/^\s*:\s*/gm, '');
  result = result.replace(/\s+:\s*$/gm, '');
  
  // Remove double spaces
  result = result.replace(/\s{2,}/g, ' ');
  
  // Remove lines that are just whitespace
  result = result.replace(/^\s+$/gm, '');
  
  // Remove multiple blank lines
  result = result.replace(/\n{3,}/g, '\n\n');

  result = result.trim();

  // Fix common Spanish writing issues
  result = fixSpanishWriting(result);

  return result;
}

/**
 * Fix common writing issues in Spanish AI output:
 * - Capitalize first letter of each sentence/line
 * - Remove leading punctuation/bullets/dashes
 * - Fix spacing around punctuation
 * - Ensure final punctuation when appropriate
 */
function capitalizeFirst(s: string): string {
  if (!s) return s;
  // Skip leading whitespace, quotes, parentheses, emojis-like characters
  const match = s.match(/^([\s"'¿¡(\[«]*)(\p{L})(.*)$/u);
  if (!match) return s;
  const [, prefix, first, rest] = match;
  return prefix + first.toLocaleUpperCase('es-ES') + rest;
}

export function fixSpanishWriting(text: string): string {
  if (!text) return text;
  let result = text;

  // Strip leading bullets/dashes/numbering used by the AI as prefix
  result = result.replace(/^[\s]*[-•·–—*]+\s*/g, '');
  result = result.replace(/^\s*\d+[\.\)]\s+/g, '');

  // Fix spacing: no space before , . ; : ! ?  — single space after
  result = result.replace(/\s+([,.;:!?])/g, '$1');
  result = result.replace(/([,.;:])(?=\S)/g, '$1 ');

  // Collapse repeated spaces (again, after the above)
  result = result.replace(/[ \t]{2,}/g, ' ');

  // Capitalize the first letter of the whole text
  result = capitalizeFirst(result);

  // Capitalize after sentence-ending punctuation
  result = result.replace(/([.!?]\s+)(\p{Ll})/gu, (_m, p, c) => p + c.toLocaleUpperCase('es-ES'));

  // Capitalize first letter of every line (titles often arrive multi-line)
  result = result
    .split('\n')
    .map(line => capitalizeFirst(line))
    .join('\n');

  return result.trim();
}

/**
 * Sanitize an array of strings (signals, basedOn, etc.)
 * Filters out items that are purely internal codes.
 */
export function sanitizeSignals(signals: string[] | null | undefined): string[] {
  if (!signals || !Array.isArray(signals)) return [];
  return signals
    .map(s => sanitizeAIOutput(s))
    .filter(s => s.length > 3); // remove empty/near-empty results
}
