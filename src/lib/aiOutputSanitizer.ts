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
  /\bQ_[A-Z]{2,}_\d{2,}\b/g,                    // Q_BIO_104
  /\b[a-z]+_[a-z]+_\d{3}\b/g,                    // b2b_arq_finance_001
  /\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b/g, // UUIDs
  /\(Q_[^)]+\)/g,                                 // (Q_BIO_104)
  /\([A-Z_]{3,}\d*\)/g,                           // (CATEGORY_CODE)
  /`[a-z_]+`/g,                                    // `snake_case` backtick-wrapped
  /\bconcept_hash\b/g,
  /\bintent_signature\b/g,
  /\broot_problem_signature\b/g,
  /\bquality_gate\b/g,
  /\bmvc_completion\b/g,
  /\bbusiness_type\b/g,
  /\bowner_id\b/g,
  /\bbusiness_id\b/g,
  /\bauth\.uid\(\)/g,
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

export function sanitizeAIOutput(text: string | null | undefined): string {
  if (!text || typeof text !== 'string') return '';
  
  let result = text;
  
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
