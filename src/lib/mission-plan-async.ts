/**
 * Cliente asíncrono para generate-mission-plan.
 *
 * El backend responde al instante con un jobId y la IA (Gemini 2.5 Pro,
 * máxima calidad) sigue trabajando en segundo plano. Acá hacemos polling
 * sobre ai_plan_jobs hasta que el plan esté listo — sin timeouts de 45s,
 * sin reintentos duplicados, sin conexiones largas que se corten.
 */
import { supabase } from "@/integrations/supabase/client";

const POLL_INTERVAL_MS = 2500;
const DEFAULT_TIMEOUT_MS = 180_000; // 3 min de margen — Gemini Pro suele tardar 40-90s

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export interface MissionPlanResult {
  plan?: any;
  qualityGate?: { passed: boolean; cached?: boolean; mvcCompletion?: number };
  cached?: boolean;
  parseError?: boolean;
  // Errores estructurados (ej: límite del plan Free)
  error?: string;
  message?: string;
  used?: number;
  limit?: number;
  upgradeUrl?: string;
}

export async function requestMissionPlan(
  body: Record<string, unknown>,
  opts: { timeoutMs?: number; signal?: AbortSignal } = {},
): Promise<MissionPlanResult> {
  const { data, error } = await supabase.functions.invoke("generate-mission-plan", { body });

  if (error) {
    // Respuestas no-2xx (ej: 402 free_limit_reached) traen cuerpo estructurado
    const ctx = (error as any)?.context;
    if (ctx && typeof ctx.json === "function") {
      try {
        const parsed = await ctx.json();
        if (parsed && typeof parsed === "object") return parsed as MissionPlanResult;
      } catch {
        /* cuerpo no parseable — propagar error original */
      }
    }
    throw error;
  }

  // Cache hit (plan instantáneo) o error estructurado directo
  if (data?.plan || data?.error) return data as MissionPlanResult;

  // Modo job asíncrono: poll hasta que el plan esté listo
  if (data?.jobId) {
    const deadline = Date.now() + (opts.timeoutMs ?? DEFAULT_TIMEOUT_MS);
    let failedRetried = false; // self-heal: 1 reintento silencioso ante fallo transitorio
    while (Date.now() < deadline) {
      if (opts.signal?.aborted) throw new DOMException("Aborted", "AbortError");
      await sleep(POLL_INTERVAL_MS);
      if (opts.signal?.aborted) throw new DOMException("Aborted", "AbortError");

      const { data: job } = await (supabase as any)
        .from("ai_plan_jobs")
        .select("status, result, error")
        .eq("id", data.jobId)
        .maybeSingle();

      if (job?.status === "completed" && job.result) return job.result as MissionPlanResult;
      if (job?.status === "failed") {
        if (!failedRetried) {
          // Reintento silencioso: re-invocar para que el backend genere un nuevo job.
          failedRetried = true;
          await sleep(2500);
          try {
            const retry = await supabase.functions.invoke("generate-mission-plan", { body });
            if (retry.data?.plan) return retry.data as MissionPlanResult;
            if (retry.data?.jobId) {
              (data as any).jobId = retry.data.jobId;
              continue;
            }
          } catch {
            /* dejamos que el while siga; si vuelve a fallar saldrá abajo */
          }
        }
        throw new Error(job?.error || "generation_failed");
      }
    }
    throw new Error("timeout");
  }

  return (data ?? {}) as MissionPlanResult;
}

