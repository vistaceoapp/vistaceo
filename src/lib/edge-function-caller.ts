/**
 * Centralized Edge Function caller for VISTACEO.
 *
 * Guarantees:
 *  - ContextPack is built once per call (when a module is provided).
 *  - HTTP 200 with `success: false` is treated as a failure, not a normal response.
 *  - Retries (configurable) before falling back to a contextual premium message.
 *  - Brain events are emitted on failure (`edge_function_failed`, `fallback_used`).
 *  - The caller never throws raw stack traces or "Edge Function error" text to the UI.
 */
import { supabase } from '@/integrations/supabase/client';
import { buildContextPack, type ContextPackModule, type ContextPack } from '@/lib/context-pack-builder';
import { emitBrainEvent } from '@/lib/brain-event-ledger';
import { containsForbidden } from '@/lib/aiOutputSanitizer';

export interface SafeEdgeOptions {
  module?: ContextPackModule;
  businessId?: string;
  withContextPack?: boolean;
  retries?: number; // default 1 — total attempts = retries + 1
  timeoutMs?: number; // default 45_000
  outputContract?: string;
  fallbackText?: string;
  /** TTL de caché en memoria para respuestas exitosas. 0 = sin caché (default). */
  cacheTtlMs?: number;
  /** Clave de caché/deduplicación explícita (por defecto se deriva del payload). */
  cacheKey?: string;
  /** Ignorar la caché y forzar una llamada nueva (igual refresca la caché). */
  bypassCache?: boolean;
  /** Coalescer llamadas idénticas en vuelo. Default: true. */
  dedupe?: boolean;

}

export interface SafeEdgeResult<T = unknown> {
  success: boolean;
  data: T | null;
  visibleText?: string;
  quality: { passed: boolean; reasons?: string[] };
  fallbackUsed: boolean;
  errorCode?: string;
}

const DEFAULT_FALLBACK = 'No pude completar el análisis ahora. Con lo que ya sé puedo seguir avanzando, esta sección se recalibra automáticamente en segundo plano.';

function withTimeout<T>(p: Promise<T>, ms: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error('timeout')), ms);
    p.then((v) => { clearTimeout(t); resolve(v); }, (e) => { clearTimeout(t); reject(e); });
  });
}

// ---------------------------------------------------------------------------
// Caché en memoria + deduplicación de llamadas en vuelo.
// Objetivo: bajar la latencia percibida sin cambiar ninguna lógica de negocio.
// ---------------------------------------------------------------------------

interface CacheEntry { at: number; ttl: number; value: SafeEdgeResult<unknown> }

const responseCache = new Map<string, CacheEntry>();
const inFlight = new Map<string, Promise<SafeEdgeResult<unknown>>>();
const CACHE_MAX = 120;

function stableKey(fn: string, payload: Record<string, unknown>, options: SafeEdgeOptions): string {
  if (options.cacheKey) return `${fn}:${options.cacheKey}`;
  let body = '';
  try {
    body = JSON.stringify(payload, Object.keys(payload).sort());
  } catch {
    body = String(Date.now());
  }
  return `${fn}:${options.businessId ?? '-'}:${options.module ?? '-'}:${body}`;
}

function readCache<T>(key: string): SafeEdgeResult<T> | null {
  const hit = responseCache.get(key);
  if (!hit) return null;
  if (Date.now() - hit.at > hit.ttl) { responseCache.delete(key); return null; }
  return hit.value as SafeEdgeResult<T>;
}

function writeCache(key: string, ttl: number, value: SafeEdgeResult<unknown>) {
  if (ttl <= 0) return;
  if (responseCache.size >= CACHE_MAX) {
    const oldest = responseCache.keys().next().value;
    if (oldest) responseCache.delete(oldest);
  }
  responseCache.set(key, { at: Date.now(), ttl, value });
}

/** Invalida la caché de respuestas (todo, o solo las claves que contengan `match`). */
export function invalidateEdgeCache(match?: string) {
  if (!match) { responseCache.clear(); return; }
  for (const k of [...responseCache.keys()]) if (k.includes(match)) responseCache.delete(k);
}

// ContextPack memo: evita reconstruir el mismo pack en ráfagas de llamadas.
const packCache = new Map<string, { at: number; pack: ContextPack }>();
const PACK_TTL = 20_000;

async function getContextPack(module: ContextPackModule, businessId: string): Promise<ContextPack | null> {
  const key = `${module}:${businessId}`;
  const hit = packCache.get(key);
  if (hit && Date.now() - hit.at < PACK_TTL) return hit.pack;
  try {
    const pack = await buildContextPack(module, businessId);
    packCache.set(key, { at: Date.now(), pack });
    return pack;
  } catch (e) {
    console.warn('[edge-caller] buildContextPack failed:', e);
    return null;
  }
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Backoff exponencial con jitter, acotado a 4s. */
function backoffDelay(attempt: number) {
  return Math.min(4_000, 400 * 2 ** attempt) * (0.75 + Math.random() * 0.5);
}

/** Errores que no vale la pena reintentar (fallan igual y suman latencia). */
function isTerminal(err: unknown): boolean {
  const msg = String((err as { message?: string })?.message ?? err ?? '').toLowerCase();
  return /missing_fields|unauthor|forbidden|not_found|invalid|400|401|403|404|422/.test(msg);
}

export async function callEdgeFunctionWithSafety<T = unknown>(
  functionName: string,
  payload: Record<string, unknown> = {},
  options: SafeEdgeOptions = {},
): Promise<SafeEdgeResult<T>> {
  const ttl = options.cacheTtlMs ?? 0;
  const dedupe = options.dedupe ?? true;
  const key = stableKey(functionName, payload, options);

  if (ttl > 0 && !options.bypassCache) {
    const cached = readCache<T>(key);
    if (cached) return cached;
  }

  if (dedupe) {
    const running = inFlight.get(key);
    if (running) return running as Promise<SafeEdgeResult<T>>;
  }

  const task = executeEdgeCall<T>(functionName, payload, options)
    .then((res) => {
      if (res.success) writeCache(key, ttl, res as SafeEdgeResult<unknown>);
      return res;
    })
    .finally(() => { inFlight.delete(key); });

  if (dedupe) inFlight.set(key, task as Promise<SafeEdgeResult<unknown>>);
  return task;
}

async function executeEdgeCall<T = unknown>(
  functionName: string,
  payload: Record<string, unknown> = {},
  options: SafeEdgeOptions = {},
): Promise<SafeEdgeResult<T>> {
  const retries = Math.max(0, options.retries ?? 1);
  const timeoutMs = options.timeoutMs ?? 45_000;
  const wantsPack = options.withContextPack ?? Boolean(options.module && options.businessId);

  let contextPack: ContextPack | null = null;
  if (wantsPack && options.module && options.businessId) {
    contextPack = await getContextPack(options.module, options.businessId);
  }


  const baseBody: Record<string, unknown> = {
    ...payload,
    ...(options.businessId ? { businessId: options.businessId } : {}),
    ...(options.module ? { module: options.module } : {}),
    ...(contextPack ? { contextPack } : {}),
    ...(options.outputContract ? { outputContract: options.outputContract } : {}),
  };

  let lastError: unknown = null;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      // On retry, send a reduced ContextPack (drop heavy arrays) so payload is leaner.
      const body = attempt > 0 && contextPack
        ? {
            ...baseBody,
            contextPack: {
              ...contextPack,
              recentEvents: [],
              topOpportunities: contextPack.topOpportunities?.slice(0, 2),
              activeMissions: contextPack.activeMissions?.slice(0, 2),
            },
          }
        : baseBody;

      const { data, error } = await withTimeout(
        supabase.functions.invoke<T & { success?: boolean; quality?: { passed?: boolean; reasons?: string[] }; fallbackUsed?: boolean; visibleText?: string; error?: string }>(functionName, { body }),
        timeoutMs,
      );

      if (error) { lastError = error; continue; }

      const d = data as Record<string, unknown> | null;
      const successFlag = d && 'success' in d ? Boolean(d.success) : true;
      const fallback = Boolean(d?.fallbackUsed);
      const quality = (d?.quality ?? { passed: successFlag && !fallback }) as { passed: boolean; reasons?: string[] };
      let visible = (d?.visibleText as string | undefined) ?? undefined;
      if (visible && containsForbidden(visible)) visible = options.fallbackText ?? DEFAULT_FALLBACK;

      if (!successFlag || fallback) {
        // Treat HTTP-200 success:false as a failure — keep trying.
        lastError = d?.error ?? 'success_false';
        if (attempt < retries) continue;

        // Final attempt failed -> emit events + return safe fallback.
        if (options.businessId) {
          await emitBrainEvent({
            eventType: 'edge_function_failed',
            businessId: options.businessId,
            sourceModule: 'system', metadata: { functionName, reasons: quality.reasons ?? [String(lastError)] },
          }).catch(() => {});
          await emitBrainEvent({
            eventType: 'fallback_used',
            businessId: options.businessId,
            sourceModule: 'system', metadata: { functionName, module: options.module },
          }).catch(() => {});
        }
        return {
          success: false,
          data: (d as T) ?? null,
          visibleText: visible ?? options.fallbackText ?? DEFAULT_FALLBACK,
          quality,
          fallbackUsed: true,
          errorCode: String(lastError),
        };
      }

      return {
        success: true,
        data: (data as T) ?? null,
        visibleText: visible,
        quality,
        fallbackUsed: false,
      };
    } catch (e) {
      lastError = e;
      console.warn(`[edge-caller:${functionName}] attempt ${attempt + 1} failed:`, e);
    }
  }

  // All attempts threw.
  if (options.businessId) {
    await emitBrainEvent({
      eventType: 'edge_function_failed',
      businessId: options.businessId,
      sourceModule: 'system', metadata: { functionName, error: String(lastError) },
    }).catch(() => {});
  }
  return {
    success: false,
    data: null,
    visibleText: options.fallbackText ?? DEFAULT_FALLBACK,
    quality: { passed: false, reasons: ['edge_function_unreachable'] },
    fallbackUsed: true,
    errorCode: 'edge_function_unreachable',
  };
}

/**
 * Backward-compatible adapter for components that previously used
 * `supabase.functions.invoke(...)` and destructured `{ data, error }`.
 * Wraps `callEdgeFunctionWithSafety` so the call site keeps working
 * while still benefitting from ContextPack injection, retries, sanitization,
 * `success:false` handling and fallback events.
 */
export async function invokeEdgeFunctionSafe<T = unknown>(
  functionName: string,
  args: { body?: Record<string, unknown> } = {},
  options: SafeEdgeOptions = {},
): Promise<{ data: T | null; error: { message: string; code?: string } | null; quality: SafeEdgeResult['quality']; fallbackUsed: boolean; visibleText?: string }> {
  const res = await callEdgeFunctionWithSafety<T>(functionName, args.body ?? {}, options);
  return {
    data: res.data,
    error: res.success ? null : { message: res.errorCode ?? 'edge_function_failed', code: res.errorCode },
    quality: res.quality,
    fallbackUsed: res.fallbackUsed,
    visibleText: res.visibleText,
  };
}

