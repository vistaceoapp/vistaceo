/**
 * QA Output Evaluator
 *
 * Analiza salida visible o payload de un módulo y devuelve un veredicto
 * pass | warn | fail con issues, score (0-10) y recomendaciones.
 *
 * No muta UI. No persiste. Es una herramienta de inspección.
 */

export type QAVerdict = 'pass' | 'warn' | 'fail';

export type QAModule =
  | 'dashboard'
  | 'chat'
  | 'radar'
  | 'missions'
  | 'analytics'
  | 'predictions'
  | 'setup'
  | 'admin'
  | 'generic';

export interface QAIssue {
  code: string;
  severity: 'info' | 'warn' | 'fail';
  message: string;
  sample?: string;
}

export interface QAEvaluation {
  verdict: QAVerdict;
  score: number; // 0-10
  issues: QAIssue[];
  recommendations: string[];
  dimensions: {
    personalization: number;
    action: number;
    evidence: number;
    clarity: number;
    safety: number;
    brain_connection: number;
  };
}

const RAW_LEAK_PATTERNS: Array<{ re: RegExp; code: string; msg: string }> = [
  { re: /\[object Object\]/, code: 'leak_object_object', msg: '[object Object] visible' },
  { re: /\bundefined\b/, code: 'leak_undefined', msg: 'literal "undefined" visible' },
  { re: /\bnull\b/, code: 'leak_null', msg: 'literal "null" visible' },
  { re: /Q_AI/i, code: 'leak_q_ai', msg: 'Token interno Q_AI visible' },
  { re: /market_signal/i, code: 'leak_market_signal', msg: 'Campo interno market_signal visible' },
  { re: /factual_memory/i, code: 'leak_factual_memory', msg: 'Campo interno factual_memory visible' },
  { re: /business_brain/i, code: 'leak_business_brain', msg: 'Campo interno business_brain visible' },
  { re: /temporary_unavailable/i, code: 'leak_temp_unavailable', msg: 'Mensaje técnico de fallback visible' },
  { re: /Edge Function (error|returned)/i, code: 'leak_edge_error', msg: 'Error técnico de Edge Function visible' },
  { re: /^https?:\/\/\S+$/m, code: 'leak_raw_url', msg: 'URL cruda sin contexto' },
  { re: /^\s*[{[]/, code: 'leak_raw_json', msg: 'JSON crudo visible' },
  { re: /<!DOCTYPE|<rss\b|<feed\b/i, code: 'leak_rss', msg: 'RSS/HTML crudo visible' },
  { re: /\*\*\s*\*\*|##\s*$|\[\s*\]\(\s*\)/m, code: 'leak_broken_md', msg: 'Markdown roto' },
];

const GENERIC_PHRASES = [
  'mejorar tu negocio',
  'aumenta tus ventas',
  'optimiza tu estrategia',
  'mejorar la experiencia',
  'genera más oportunidades',
];

function asText(payload: unknown): string {
  if (payload == null) return '';
  if (typeof payload === 'string') return payload;
  try { return JSON.stringify(payload); } catch { return String(payload); }
}

export function evaluateVisibleOutput(module: QAModule, textOrPayload: unknown): QAEvaluation {
  const text = asText(textOrPayload);
  const issues: QAIssue[] = [];
  const recs: string[] = [];

  for (const p of RAW_LEAK_PATTERNS) {
    const m = text.match(p.re);
    if (m) {
      issues.push({ code: p.code, severity: 'fail', message: p.msg, sample: m[0]?.slice(0, 120) });
    }
  }

  let generic = 0;
  for (const g of GENERIC_PHRASES) if (text.toLowerCase().includes(g)) generic += 1;
  if (generic > 0) {
    issues.push({ code: 'generic_phrasing', severity: 'warn', message: `Frases genéricas detectadas (${generic})` });
    recs.push('Reemplazar frases genéricas por acciones específicas con evidencia.');
  }

  if (text.trim().length > 0 && text.trim().length < 24) {
    issues.push({ code: 'too_short', severity: 'warn', message: 'Salida demasiado corta o cortada' });
  }

  const failCount = issues.filter(i => i.severity === 'fail').length;
  const warnCount = issues.filter(i => i.severity === 'warn').length;

  // Dimensiones heurísticas 0-10
  const base = failCount === 0 ? 8 : failCount === 1 ? 5 : 2;
  const dimensions = {
    personalization: Math.max(0, base - (generic > 0 ? 3 : 0)),
    action: module === 'missions' || module === 'radar' ? base : base - 1,
    evidence: module === 'predictions' || module === 'analytics' ? base : base - 1,
    clarity: Math.max(0, base - warnCount),
    safety: Math.max(0, 10 - failCount * 4),
    brain_connection: base,
  };

  const score = Math.round(
    (dimensions.personalization +
      dimensions.action +
      dimensions.evidence +
      dimensions.clarity +
      dimensions.safety +
      dimensions.brain_connection) / 6
  );

  const verdict: QAVerdict = failCount > 0 ? 'fail' : warnCount > 0 ? 'warn' : 'pass';

  const criticalDimsBelow4 =
    (module === 'missions' && dimensions.action < 4) ||
    (module === 'predictions' && dimensions.evidence < 4) ||
    (module === 'radar' && dimensions.action < 4);

  if (criticalDimsBelow4) {
    issues.push({
      code: 'critical_dimension_low',
      severity: 'fail',
      message: `Dimensión crítica < 4 en módulo ${module}`,
    });
  }

  return { verdict: criticalDimsBelow4 ? 'fail' : verdict, score, issues, recommendations: recs, dimensions };
}
