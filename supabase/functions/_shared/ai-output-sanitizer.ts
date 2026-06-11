// Server-side mirror of src/lib/aiOutputSanitizer.ts.
// Self-contained (Deno-safe). Keep RED_LIST in sync with the client file.

export const RED_LIST_FORBIDDEN = [
  '[object Object]',
  'undefined',
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
  'FunctionsHttpError',
  'FunctionsRelayError',
  'FunctionsFetchError',
  'gateway error',
  '**Origen**',
  '**Fuente**',
  'Q_AI_',
  'rawUserText',
  'recent_decisions',
  'Learning_clientes',
  'Learning_operaciones',
] as const;

const RED_LIST_REGEXES = [
  /\bQ_AI_\d+/gi,
  /https?:\/\/news\.google\.com\/rss[^\s)\]]*/gi,
  /\bhttps?:\/\/\S{120,}/gi,
  /\{[\s\S]{60,}\}/g,
  /<[A-Z_]{3,}>[\s\S]*?<\/[A-Z_]{3,}>/g,
  /\*\*[A-Za-z_]+\*\*\s*:\s*\{/g,
  /```[\s\S]*?```/g,
];

const AI_LEAK_PATTERNS = [
  /\bQ_[A-Z]{2,}_\d{2,}\b/g,
  /\bEASY_\d+_[A-Z_]+/gi,
  /\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b/g,
  /\b(?:business_id|owner_id|business_type|signal_id|concept_hash|intent_signature)\b/g,
];

export type SanitizeMode = 'prose' | 'structured' | 'label' | 'admin';

export function containsForbidden(text: string | null | undefined): boolean {
  if (!text) return false;
  const s = String(text);
  for (const token of RED_LIST_FORBIDDEN) {
    if (s.includes(token)) return true;
  }
  for (const re of RED_LIST_REGEXES) {
    re.lastIndex = 0;
    if (re.test(s)) return true;
  }
  return false;
}

export function sanitizeAIOutput(
  text: string | null | undefined,
  options: { mode?: SanitizeMode } = {},
): string {
  const mode = options.mode ?? 'prose';
  if (!text || typeof text !== 'string') return '';
  let result = text;

  const INTERNAL_BLOCKS = [
    'CEO_AUDIO_SCRIPT', 'AVATAR_CUES', 'LEARNING_EXTRACT', 'USER_REPLY',
    'BRAIN_JSON', 'STATE_JSON', 'CONFIG_JSON', 'SYSTEM_PROMPT',
    'INTERNAL', 'METADATA', 'DEBUG', 'TOOL_CALL', 'TOOL_RESULT',
  ];
  for (const block of INTERNAL_BLOCKS) {
    result = result.replace(new RegExp(`<${block}[^>]*>[\\s\\S]*?<\\/${block}>`, 'gi'), '');
    result = result.replace(new RegExp(`<${block}[^>]*>[\\s\\S]*$`, 'gi'), '');
    result = result.replace(new RegExp(`<\\/?${block}[^>]*>`, 'gi'), '');
  }

  for (const p of AI_LEAK_PATTERNS) {
    p.lastIndex = 0;
    result = result.replace(p, '');
  }

  result = result.replace(/\(\s*\)/g, '').replace(/\s{2,}/g, ' ').replace(/\n{3,}/g, '\n\n').trim();

  if (mode !== 'admin' && containsForbidden(result)) return '';

  if (mode === 'label') {
    return result.replace(/[\.!?…]+$/g, '').trim();
  }
  if (mode === 'structured') {
    if (result.length < 10) return '';
    if (/^(siguiente|paso|undefined|null|\.{1,3})$/i.test(result.trim())) return '';
    return result;
  }
  return result;
}

export function sanitizeStructuredList(items: unknown): string[] {
  if (!Array.isArray(items)) return [];
  return items
    .map((s) => sanitizeAIOutput(typeof s === 'string' ? s : String(s ?? ''), { mode: 'structured' }))
    .filter((s) => s.length >= 10 && !containsForbidden(s));
}
