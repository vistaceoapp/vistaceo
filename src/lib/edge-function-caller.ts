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

export async function callEdgeFunctionWithSafety<T = unknown>(
  functionName: string,
  payload: Record<string, unknown> = {},
  options: SafeEdgeOptions = {},
): Promise<SafeEdgeResult<T>> {
  const retries = Math.max(0, options.retries ?? 1);
  const timeoutMs = options.timeoutMs ?? 45_000;
  const wantsPack = options.withContextPack ?? Boolean(options.module && options.businessId);

  let contextPack: ContextPack | null = null;
  if (wantsPack && options.module && options.businessId) {
    try {
      contextPack = await buildContextPack(options.module, options.businessId);
    } catch (e) {
      console.warn('[edge-caller] buildContextPack failed:', e);
    }
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
            payload: { functionName, reasons: quality.reasons ?? [String(lastError)] },
          }).catch(() => {});
          await emitBrainEvent({
            eventType: 'fallback_used',
            businessId: options.businessId,
            payload: { functionName, module: options.module },
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
      payload: { functionName, error: String(lastError) },
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
