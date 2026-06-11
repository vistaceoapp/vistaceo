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
  | 'radar';

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
  }
}
