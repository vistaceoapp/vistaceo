// Per-module quality gates run on the server BEFORE returning a response
// or inserting into the database. Cheap heuristic checks — combine with
// validateBeforeStore for full coverage.

import { containsForbidden } from './ai-output-sanitizer.ts';

export type ModuleKind =
  | 'chat'
  | 'mission'
  | 'mission_step'
  | 'opportunity'
  | 'prediction'
  | 'analytics'
  | 'dashboard'
  | 'radar'
  | 'health'
  | 'reputation'
  | 'competitor'
  | 'seed_insight'
  | 'question';

export interface GateResult {
  passed: boolean;
  reasons: string[];
}

const GENERIC_PHRASES = [
  /cu[eé]ntame 3 cosas/i,
  /^necesito m[aá]s informaci[oó]n\.?$/i,
  /^cargando/i,
  /lorem ipsum/i,
];

function baseChecks(text: string): string[] {
  const reasons: string[] = [];
  if (!text || text.trim().length < 6) reasons.push('too_short');
  if (containsForbidden(text)) reasons.push('red_list_leak');
  for (const re of GENERIC_PHRASES) if (re.test(text)) reasons.push('generic_phrase');
  return reasons;
}

export function gateChatResponse(text: string): GateResult {
  const reasons = baseChecks(text);
  if (/^\s*\{/.test(text.trim())) reasons.push('json_visible');
  if (text.length < 40) reasons.push('chat_too_short');
  return { passed: reasons.length === 0, reasons };
}

export function gateMission(payload: { title?: string; description?: string; steps?: Array<{ title?: string; description?: string }> }): GateResult {
  const reasons: string[] = [];
  reasons.push(...baseChecks(payload.title ?? ''));
  reasons.push(...baseChecks(payload.description ?? ''));
  const steps = payload.steps ?? [];
  if (steps.length < 3) reasons.push('mission_steps_too_few');
  for (const s of steps) {
    if (!s?.title || s.title.trim().length < 6) reasons.push('mission_step_empty_title');
    if (/^siguiente$|^paso$/i.test((s?.title ?? '').trim())) reasons.push('mission_step_placeholder');
    if (s?.description && s.description.trim().length < 20) reasons.push('mission_step_thin_description');
  }
  return { passed: reasons.length === 0, reasons };
}

export function gateOpportunity(payload: { title?: string; description?: string; source_url?: string }): GateResult {
  const reasons = [...baseChecks(payload.title ?? ''), ...baseChecks(payload.description ?? '')];
  if (payload.source_url && /news\.google\.com\/rss/i.test(payload.source_url)) reasons.push('rss_url_raw');
  if ((payload.description ?? '').includes('**Origen**')) reasons.push('markdown_origin_label');
  return { passed: reasons.length === 0, reasons };
}

export function gatePrediction(payload: { title?: string; baseEvidence?: string; description?: string }): GateResult {
  const reasons = [...baseChecks(payload.title ?? '')];
  const evidence = payload.baseEvidence ?? payload.description ?? '';
  if (!evidence || evidence.trim().length < 30) reasons.push('prediction_missing_evidence');
  return { passed: reasons.length === 0, reasons };
}

export function gateDashboardText(text: string): GateResult {
  const reasons = baseChecks(text);
  if (/cu[eé]ntame 3 cosas/i.test(text)) reasons.push('dashboard_generic_prompt');
  return { passed: reasons.length === 0, reasons };
}

export function gateAnalytics(payload: { interpretation?: string; metricsCount?: number }): GateResult {
  const reasons = baseChecks(payload.interpretation ?? '');
  if ((payload.metricsCount ?? 0) === 0 && /\b0\s*%/.test(payload.interpretation ?? '')) {
    reasons.push('analytics_zero_as_truth');
  }
  return { passed: reasons.length === 0, reasons };
}

// ============================================================
// PROMPT 4 — gates for the remaining hardened Edge Functions
// ============================================================

/** Generic phrases that may NOT appear as the whole insight title unless developed with evidence. */
export const GENERIC_SEED_TITLES: RegExp[] = [
  /^mejor[aá]r?\s+(las\s+)?ventas\.?$/i,
  /^public[aá]r?\s+en\s+redes(\s+sociales)?\.?$/i,
  /^consegu[ií]r?\s+m[aá]s\s+clientes\.?$/i,
  /^activ[aá]r?\s+(tu\s+)?presencia\s+digital\.?$/i,
  /^aument[aá]r?\s+(tu\s+)?presencia\s+(online|digital)\.?$/i,
  /^cre[aá]r?\s+contenido\.?$/i,
  /^mejor[aá]r?\s+(el\s+)?marketing\.?$/i,
];

/** Seed insights (first experience after setup): block undeveloped generic titles. */
export function gateSeedInsight(payload: { title?: string; description?: string }): GateResult {
  const reasons = [...baseChecks(payload.title ?? ''), ...baseChecks(payload.description ?? '')];
  const title = (payload.title ?? '').trim();
  const desc = (payload.description ?? '').trim();
  if (GENERIC_SEED_TITLES.some((re) => re.test(title)) && desc.length < 120) {
    reasons.push('generic_seed_insight');
  }
  if (desc.length < 60) reasons.push('seed_description_too_thin');
  return { passed: reasons.length === 0, reasons: Array.from(new Set(reasons)) };
}

/** Health score: never present 0 as a truth when there is no real data. */
export function gateHealthScore(payload: { score?: number | null; hasData?: boolean; rationale?: string }): GateResult {
  const reasons: string[] = [];
  if (!payload.hasData && payload.score === 0) reasons.push('zero_as_truth_without_data');
  if (!payload.rationale || payload.rationale.trim().length < 8) reasons.push('health_missing_rationale');
  if (payload.rationale && containsForbidden(payload.rationale)) reasons.push('red_list_leak');
  if (typeof payload.score === 'number' && (payload.score < 0 || payload.score > 100)) reasons.push('health_score_out_of_range');
  return { passed: reasons.length === 0, reasons };
}

/** Competitors: never invent competitors — only verifiable sources pass. */
export function gateCompetitor(payload: { name?: string; sourceType?: string }): GateResult {
  const reasons: string[] = [];
  if (!payload.name || payload.name.trim().length < 2) reasons.push('competitor_missing_name');
  if (payload.name && containsForbidden(payload.name)) reasons.push('red_list_leak');
  const src = (payload.sourceType ?? '').toLowerCase();
  if (src === 'ai_estimated' || src === 'invented' || src === '') reasons.push('competitor_invented');
  return { passed: reasons.length === 0, reasons };
}

/** Reputation: without real reviews, a positive score must be labeled as estimated/insufficient. */
export function gateReputation(payload: { reviewsCount?: number; score?: number | null; summary?: string }): GateResult {
  const reasons = baseChecks(payload.summary ?? '');
  const reviews = payload.reviewsCount ?? 0;
  if (reviews === 0 && typeof payload.score === 'number' && payload.score > 0) {
    const s = payload.summary ?? '';
    const labeled = /(informaci[oó]n proporcionada|todav[ií]a no hay datos|estimaci[oó]n|vincul[aá]|sin rese[ñn]as)/i.test(s);
    if (!labeled) reasons.push('reputation_without_real_data_unlabeled');
  }
  return { passed: reasons.length === 0, reasons: Array.from(new Set(reasons)) };
}

export function gateByModule(module: ModuleKind, payload: Record<string, unknown>): GateResult {
  switch (module) {
    case 'chat': return gateChatResponse(String(payload.text ?? ''));
    case 'mission': return gateMission(payload as never);
    case 'mission_step': return gateMission({ title: 'ok', description: 'ok', steps: [payload as never] });
    case 'opportunity': return gateOpportunity(payload as never);
    case 'prediction': return gatePrediction(payload as never);
    case 'analytics': return gateAnalytics(payload as never);
    case 'dashboard': return gateDashboardText(String(payload.text ?? ''));
    case 'radar': return gateOpportunity(payload as never);
    case 'health': return gateHealthScore(payload as never);
    case 'reputation': return gateReputation(payload as never);
    case 'competitor': return gateCompetitor(payload as never);
    case 'seed_insight': return gateSeedInsight(payload as never);
    case 'question': return gateDashboardText(String(payload.text ?? ''));
  }
}
