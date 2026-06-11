/**
 * QA Session Recorder
 *
 * Registra eventos de una sesión de QA asistido para que un humano pueda
 * recorrer la app real (Inicio, Chat, Radar, Misiones, Analíticas,
 * Predicciones, Setup, Admin) y dejar evidencia técnica de qué se
 * generó, qué se vio, qué evento se emitió y qué fallback se usó.
 *
 * - No modifica UI.
 * - Se activa por flag interna (?qa=1 en URL o localStorage.qa_mode=1).
 * - Persiste en localStorage y, si hay sesión, también en brain_events
 *   con event_type = 'qa_event' a través de emitBrainEvent.
 */

import { emitBrainEvent } from './brain-event-ledger';
import { evaluateVisibleOutput, type QAEvaluation, type QAModule } from './qa-output-evaluator';

const STORAGE_KEY = 'vistaceo:qa_session';

export interface QAEventInput {
  scenario: string;
  module: QAModule;
  action: string;
  visibleOutputSample?: unknown;
  contextPackSummary?: Record<string, unknown>;
  edgeFunctionName?: string;
  qualityGateResult?: 'pass' | 'fail' | 'skipped';
  sanitizationResult?: 'clean' | 'sanitized' | 'blocked';
  brainEventId?: string;
  fallbackUsed?: boolean;
  errorCode?: string;
  repairStatus?: string;
  modulesRecalculated?: string[];
  notes?: string;
}

export interface QAEventRecord extends QAEventInput {
  qa_session_id: string;
  ts: string;
  user_id?: string | null;
  business_id?: string | null;
  evaluation?: QAEvaluation;
  pass_warn_fail: 'pass' | 'warn' | 'fail';
}

export interface QASession {
  id: string;
  label: string;
  startedAt: string;
  endedAt?: string;
  userId?: string | null;
  businessId?: string | null;
  events: QAEventRecord[];
}

function readSession(): QASession | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as QASession) : null;
  } catch {
    return null;
  }
}

function writeSession(s: QASession | null) {
  if (typeof window === 'undefined') return;
  try {
    if (s) localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
    else localStorage.removeItem(STORAGE_KEY);
  } catch { /* ignore */ }
}

export function isQAModeEnabled(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const params = new URLSearchParams(window.location.search);
    if (params.get('qa') === '1') return true;
    return localStorage.getItem('qa_mode') === '1';
  } catch {
    return false;
  }
}

export function startQASession(label: string, opts?: { userId?: string | null; businessId?: string | null }): QASession {
  const session: QASession = {
    id: crypto.randomUUID?.() ?? `qa_${Date.now()}`,
    label,
    startedAt: new Date().toISOString(),
    userId: opts?.userId ?? null,
    businessId: opts?.businessId ?? null,
    events: [],
  };
  writeSession(session);
  return session;
}

export function stopQASession(): QASession | null {
  const s = readSession();
  if (!s) return null;
  s.endedAt = new Date().toISOString();
  writeSession(s);
  return s;
}

export async function recordQAEvent(input: QAEventInput): Promise<QAEventRecord | null> {
  if (!isQAModeEnabled()) return null;
  let session = readSession();
  if (!session) session = startQASession('QA_AUTO');

  const evaluation = input.visibleOutputSample !== undefined
    ? evaluateVisibleOutput(input.module, input.visibleOutputSample)
    : undefined;

  const record: QAEventRecord = {
    ...input,
    qa_session_id: session.id,
    ts: new Date().toISOString(),
    user_id: session.userId,
    business_id: session.businessId,
    evaluation,
    pass_warn_fail: evaluation?.verdict ?? 'pass',
  };

  session.events.push(record);
  writeSession(session);

  // Espejo opcional a brain_events si tenemos businessId.
  if (session.businessId) {
    try {
      await emitBrainEvent({
        eventType: 'repair_event',
        businessId: session.businessId,
        userId: session.userId ?? undefined,
        sourceModule: 'admin',
        metadata: { qa_event: record },
      });
    } catch { /* best effort */ }
  }

  return record;
}

export interface QAReport {
  session: QASession;
  totals: {
    events: number;
    pass: number;
    warn: number;
    fail: number;
    fallbacks: number;
    qualityFails: number;
    edgeErrors: number;
  };
  byModule: Record<string, { events: number; pass: number; warn: number; fail: number }>;
  markdown: string;
}

export function exportQAReport(sessionId?: string): QAReport | null {
  const s = readSession();
  if (!s || (sessionId && s.id !== sessionId)) return null;

  const totals = { events: s.events.length, pass: 0, warn: 0, fail: 0, fallbacks: 0, qualityFails: 0, edgeErrors: 0 };
  const byModule: QAReport['byModule'] = {};

  for (const e of s.events) {
    totals[e.pass_warn_fail] += 1;
    if (e.fallbackUsed) totals.fallbacks += 1;
    if (e.qualityGateResult === 'fail') totals.qualityFails += 1;
    if (e.errorCode) totals.edgeErrors += 1;
    const m = byModule[e.module] ?? (byModule[e.module] = { events: 0, pass: 0, warn: 0, fail: 0 });
    m.events += 1;
    m[e.pass_warn_fail] += 1;
  }

  const md = [
    `# QA Report — ${s.label}`,
    ``,
    `- session_id: \`${s.id}\``,
    `- user_id: \`${s.userId ?? 'n/a'}\``,
    `- business_id: \`${s.businessId ?? 'n/a'}\``,
    `- started: ${s.startedAt}`,
    `- ended: ${s.endedAt ?? '(in progress)'}`,
    ``,
    `## Totals`,
    `- events: ${totals.events}`,
    `- pass: ${totals.pass} · warn: ${totals.warn} · fail: ${totals.fail}`,
    `- fallbacks: ${totals.fallbacks} · quality fails: ${totals.qualityFails} · edge errors: ${totals.edgeErrors}`,
    ``,
    `## By module`,
    ...Object.entries(byModule).map(([k, v]) => `- ${k}: ${v.events} (pass ${v.pass} / warn ${v.warn} / fail ${v.fail})`),
    ``,
    `## Events`,
    ...s.events.map((e, i) =>
      `### ${i + 1}. [${e.pass_warn_fail.toUpperCase()}] ${e.module} — ${e.action}\n` +
      `- scenario: ${e.scenario}\n` +
      `- edge: ${e.edgeFunctionName ?? '-'} · quality: ${e.qualityGateResult ?? '-'} · fallback: ${e.fallbackUsed ? 'yes' : 'no'}\n` +
      (e.errorCode ? `- error: \`${e.errorCode}\`\n` : '') +
      (e.evaluation ? `- score: ${e.evaluation.score}/10 · issues: ${e.evaluation.issues.map(x => x.code).join(', ') || 'none'}\n` : '') +
      (e.notes ? `- notes: ${e.notes}\n` : '')
    ),
  ].join('\n');

  return { session: s, totals, byModule, markdown: md };
}

// Conveniencia para depurar desde DevTools.
if (typeof window !== 'undefined') {
  (window as unknown as Record<string, unknown>).__vistaceoQA = {
    start: startQASession,
    stop: stopQASession,
    record: recordQAEvent,
    export: exportQAReport,
    enabled: isQAModeEnabled,
  };
}
