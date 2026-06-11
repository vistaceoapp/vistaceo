// Unified Edge Function response helpers.
// Guarantees: CORS, JSON body, sanitized visible text, no stack-traces leaked,
// always-present `quality` and `fallbackUsed` markers for telemetry.

import { sanitizeAIOutput, containsForbidden } from './ai-output-sanitizer.ts';

export const corsHeaders: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE',
};

export interface EdgeSuccess<T> {
  success: true;
  data: T;
  visibleText?: string;
  brainUpdates?: Record<string, unknown>;
  eventsToEmit?: Array<{ eventType: string; payload?: Record<string, unknown>; modulesToRecalculate?: string[] }>;
  modulesToRecalculate?: string[];
  quality: { passed: boolean; reasons?: string[] };
  fallbackUsed: boolean;
}

export interface EdgeFailure {
  success: false;
  error: string;
  quality: { passed: false; reasons: string[] };
  fallbackUsed: boolean;
  visibleText?: string;
}

export function jsonResponse(body: unknown, init: ResponseInit = {}): Response {
  return new Response(JSON.stringify(body), {
    ...init,
    headers: { ...corsHeaders, 'Content-Type': 'application/json', ...(init.headers ?? {}) },
  });
}

export function okResponse<T>(payload: Omit<EdgeSuccess<T>, 'success'>): Response {
  // Last-mile sanitization: never leak Red List in visibleText.
  let visibleText = payload.visibleText;
  if (visibleText) {
    visibleText = sanitizeAIOutput(visibleText, { mode: 'prose' });
    if (containsForbidden(visibleText)) visibleText = '';
  }
  return jsonResponse({ success: true, ...payload, visibleText });
}

export function failResponse(
  internalError: unknown,
  opts: { module?: string; fallbackText?: string; reasons?: string[] } = {},
): Response {
  // Internal error is logged server-side ONLY.
  console.error(`[edge-fail${opts.module ? `:${opts.module}` : ''}]`, internalError);
  const safe: EdgeFailure = {
    success: false,
    error: 'temporary_unavailable',
    quality: { passed: false, reasons: opts.reasons ?? ['edge_function_failed'] },
    fallbackUsed: true,
    visibleText: opts.fallbackText
      ? sanitizeAIOutput(opts.fallbackText, { mode: 'prose' })
      : 'No pude completar el análisis ahora. Volvé a intentarlo en unos minutos.',
  };
  return jsonResponse(safe, { status: 200 });
}

export function handlePreflight(req: Request): Response | null {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  return null;
}
