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
  /\bEASY_\d+_[A-Z_]+(?:\s*:\s*[a-z_]+)?/gi,    // EASY_17_FOLLOWUP, EASY_17_FOLLOWUP: sometimes
  /\beasy[_\s]\d+[_\s][a-z_]+(?:\s+[a-z_]+)?/gi, // easy_13_peak / "Easy 13 peak intuition"
  /\b[a-z]+_[a-z]+_\d{3}\b/g,                    // b2b_arq_finance_001
  /\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b/g, // UUIDs
  /\(Q_[^)]+\)/g,                                 // (Q_BIO_104)
  /\(EASY_[^)]+\)/gi,                             // (EASY_17_FOLLOWUP: sometimes)
  /\([A-Z_]{3,}\d*\)/g,                           // (CATEGORY_CODE)
  /`[a-z_]+`/g,                                    // `snake_case` backtick-wrapped
  /['"][a-z]+_[a-z_]+['"]/g,                       // 'first_clients', "draft_brand", etc.
  /\b(?:first_clients|draft|first_sale|brand_draft|landing_draft|mvp|prelaunch_buzz|test_market|early_adopters|growth_loop|funnel_top)\b/gi,
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

// ===== RED LIST GLOBAL (P0) — contenido prohibido visible =====
// Si aparece cualquiera de estos tokens, el contenido se descarta.
export const RED_LIST_FORBIDDEN = [
  '[object Object]',
  'undefined',
  'null',
  'NaN',
  'factual_memory',
  'business_brain',
  'evidence_from_brain',
  'market_signal',
  'connected_mission',
  'impact_score',
  'effort_score',
  'why_now',
  'specific_action',
  'certainty_score',
  'CEO_AUDIO_SCRIPT',
  'BRAIN_JSON',
  'METADATA',
  'Failed to send a request to the Edge Function',
  'Edge Function error',
  'FunctionsHttpError',
  'FunctionsRelayError',
  'FunctionsFetchError',
  'gateway error',
  '**Origen**',
  '**Fuente**',
  'Q_AI_',
] as const;

const RED_LIST_REGEXES = [
  /\bQ_AI_\d+/gi,
  /https?:\/\/news\.google\.com\/rss[^\s)\]]*/gi,
  /\bhttps?:\/\/\S{120,}/gi,           // URLs ridículamente largas
  /\{[\s\S]{40,}\}/g,                   // JSON crudo visible
  /<[A-Z_]{3,}>[\s\S]*?<\/[A-Z_]{3,}>/g, // bloques XML internos
];

export type SanitizeMode = 'prose' | 'structured' | 'label' | 'admin';
export interface SanitizeOptions { mode?: SanitizeMode }

/** True si el texto contiene cualquier token de la Red List. */
export function containsForbidden(text: string | null | undefined): boolean {
  if (!text) return false;
  const lower = String(text);
  for (const token of RED_LIST_FORBIDDEN) {
    if (lower.includes(token)) return true;
  }
  for (const re of RED_LIST_REGEXES) {
    re.lastIndex = 0;
    if (re.test(lower)) return true;
  }
  return false;
}

export function sanitizeAIOutput(
  text: string | null | undefined,
  options: SanitizeOptions = {}
): string {
  const mode: SanitizeMode = options.mode ?? 'prose';
  if (!text || typeof text !== 'string') return '';
  
  let result = text;

  // ===== CAPA 0: STRIP INTERNAL XML/TAG BLOCKS (P0 ZERO LEAKAGE) =====
  // Remove complete blocks first (greedy-safe, non-greedy match)
  const INTERNAL_BLOCKS = [
    'CEO_AUDIO_SCRIPT', 'AVATAR_CUES', 'LEARNING_EXTRACT', 'USER_REPLY',
    'BRAIN_JSON', 'STATE_JSON', 'CONFIG_JSON', 'SYSTEM_PROMPT',
    'INTERNAL', 'METADATA', 'DEBUG', 'TOOL_CALL', 'TOOL_RESULT',
  ];
  for (const block of INTERNAL_BLOCKS) {
    // Complete block: <TAG>...</TAG>
    result = result.replace(new RegExp(`<${block}[^>]*>[\\s\\S]*?<\\/${block}>`, 'gi'), '');
    // Unclosed/orphan opening tag onwards (truncated stream)
    result = result.replace(new RegExp(`<${block}[^>]*>[\\s\\S]*$`, 'gi'), '');
    // Stray closing tags
    result = result.replace(new RegExp(`<\\/${block}>`, 'gi'), '');
    // Stray opening tags
    result = result.replace(new RegExp(`<${block}[^>]*>`, 'gi'), '');
  }
  // Remove any remaining JSON-looking blobs that follow internal markers
  // e.g. raw `{ "facts_to_add": [...] }` left over after tag removal
  result = result.replace(/\{\s*"(facts_to_add|decisions|risks|missions_suggested|mood|pace|gestures|interruptions_allowed|moments|attachment_id|message_id|scope|definition_of_done|due_hint)"[\s\S]*?\}\s*\}?/gi, '');

  // Replace internal business type codes with Spanish labels (case-insensitive, word-boundary)
  for (const [code, label] of Object.entries(BUSINESS_TYPE_LABELS)) {
    const re = new RegExp(`\\b${code}\\b`, 'gi');
    result = result.replace(re, label);
  }

  // Inline tag translation (innovation, market_signal, quick win, benchmark, etc.)
  const INLINE_TAG_MAP: Record<string, string> = {
    market_signal: "señal de mercado",
    market_signals: "señales de mercado",
    case_study: "caso de estudio",
    case_studies: "casos de estudio",
    quick_win: "logro rápido",
    "quick win": "logro rápido",
    innovation: "innovación",
    innovations: "innovaciones",
    benchmark: "comparativa",
    benchmarks: "comparativas",
    insight: "hallazgo",
    insights: "hallazgos",
    trend: "tendencia",
    trends: "tendencias",
    growth_loop: "ciclo de crecimiento",
    funnel_top: "parte alta del embudo",
  };
  for (const [code, label] of Object.entries(INLINE_TAG_MAP)) {
    const re = new RegExp(`\\b${code.replace(/ /g, "[ _]")}\\b`, 'gi');
    result = result.replace(re, label);
  }

  
  // Remove code patterns
  for (const pattern of AI_LEAK_PATTERNS) {
    pattern.lastIndex = 0;
    result = result.replace(pattern, '');
  }
  
  // Remove "Q_BIO_104: value" style signal strings
  result = result.replace(/Q_[A-Z_]+\d*:\s*[a-z_]+/gi, '');
  result = result.replace(/EASY[_\s]\d+[_\s][A-Z_]+\s*:?\s*[a-z_]*/gi, '');
  
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

  // Anti-truncación visual: si quedó cortado a mitad, cerrar elegante
  result = closeDanglingSentence(result);

  // ===== CAPA FINAL: descartar si el resultado es solo un token leakeado =====
  if (isLeakedLabel(result)) return '';

  return result;
}

/** Cierra oraciones colgadas (sin punto final) con elipsis elegante. */
function closeDanglingSentence(text: string): string {
  if (!text) return text;
  const t = text.trimEnd();
  if (!t) return t;
  // Si ya termina en signo de cierre, ok
  if (/[.!?…:"'»\)\]]$/.test(t)) return t;
  // Si la última "palabra" es muy corta o termina en conjunción, cerrar con elipsis
  const lastWord = t.split(/\s+/).pop() || "";
  const danglers = /^(y|o|u|e|de|en|con|por|para|el|la|los|las|un|una|que|del|al|si|pero|ni|sin|sobre|entre|hacia|tras|según)$/i;
  if (danglers.test(lastWord)) {
    return t.replace(new RegExp(`\\s*${lastWord}\\s*$`, "i"), "…");
  }
  return t + "…";
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
 * Words/tokens that should NEVER appear standalone in user-facing UI.
 * Used to drop leaked labels coming from option ids or AI placeholders.
 */
const LEAKED_STANDALONE_TOKENS = new Set([
  'manual', 'none', 'null', 'undefined', 'nan', 'n/a', 'na', 'tbd',
  'draft', 'pending', 'loading', 'error', 'unknown', 'other', 'otros',
  'true', 'false', 'yes', 'no', 'sí', 'si',
  'placeholder', 'todo', 'fixme', 'lorem', 'ipsum',
  'first_clients', 'first_sale', 'brand_draft', 'landing_draft', 'mvp',
  'opt_high', 'opt_low', 'opt_mid', 'opt_none',
]);

/** True if a sanitized string is just a leaked internal token (no real content). */
export function isLeakedLabel(text: string | null | undefined): boolean {
  if (!text) return true;
  const norm = String(text).trim().toLowerCase().replace(/[\s._-]+/g, '');
  if (!norm) return true;
  if (norm.length < 3) return true;
  if (LEAKED_STANDALONE_TOKENS.has(norm)) return true;
  // Pure snake_case id with no spaces (likely a leaked enum)
  if (/^[a-z]+(_[a-z0-9]+)+$/.test(text.trim()) && !/\s/.test(text.trim())) return true;
  return false;
}

/**
 * Sanitize an array of strings (signals, basedOn, weaknesses, etc.)
 * Filters out items that are purely internal codes or leaked labels.
 */
export function sanitizeSignals(signals: string[] | null | undefined): string[] {
  if (!signals || !Array.isArray(signals)) return [];
  return signals
    .map(s => sanitizeAIOutput(s))
    .filter(s => s.length > 3 && !isLeakedLabel(s));
}

