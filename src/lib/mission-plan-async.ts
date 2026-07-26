/**
 * Cliente asíncrono para generate-mission-plan.
 *
 * El backend responde al instante con un jobId y la IA (Gemini 2.5 Pro,
 * máxima calidad) sigue trabajando en segundo plano. Acá hacemos polling
 * sobre ai_plan_jobs hasta que el plan esté listo — sin timeouts de 45s,
 * sin reintentos duplicados, sin conexiones largas que se corten.
 *
 * RESUMIBLE: si pasás `resumeKey`, el jobId se persiste en localStorage.
 * Si el usuario sale de la pantalla y vuelve mientras la IA sigue trabajando,
 * el próximo `requestMissionPlan` **reengancha el job existente** en lugar
 * de arrancar uno nuevo desde cero.
 */
import { supabase } from "@/integrations/supabase/client";

const POLL_INTERVAL_MS = 2500;
const DEFAULT_TIMEOUT_MS = 180_000; // 3 min de margen — Gemini Pro suele tardar 40-90s
const RESUME_TTL_MS = 10 * 60 * 1000; // un job "en curso" se considera vigente 10 min

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export interface MissionPlanResult {
  plan?: any;
  qualityGate?: { passed: boolean; cached?: boolean; mvcCompletion?: number };
  cached?: boolean;
  parseError?: boolean;
  error?: string;
  message?: string;
  used?: number;
  limit?: number;
  upgradeUrl?: string;
}

const resumeStorageKey = (key: string) => `vc:plan-job:${key}`;

const readResumeJob = (key?: string): string | null => {
  if (!key || typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(resumeStorageKey(key));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { jobId?: string; ts?: number };
    if (!parsed?.jobId || !parsed?.ts) return null;
    if (Date.now() - parsed.ts > RESUME_TTL_MS) {
      localStorage.removeItem(resumeStorageKey(key));
      return null;
    }
    return parsed.jobId;
  } catch {
    return null;
  }
};

const writeResumeJob = (key: string | undefined, jobId: string) => {
  if (!key || typeof window === "undefined") return;
  try {
    localStorage.setItem(resumeStorageKey(key), JSON.stringify({ jobId, ts: Date.now() }));
  } catch { /* quota / private mode → best effort */ }
};

const clearResumeJob = (key?: string) => {
  if (!key || typeof window === "undefined") return;
  try { localStorage.removeItem(resumeStorageKey(key)); } catch {}
};

async function pollJob(
  jobId: string,
  opts: { timeoutMs?: number; signal?: AbortSignal; resumeKey?: string; onRetryFreshJob?: () => Promise<string | null> } = {},
): Promise<MissionPlanResult> {
  const deadline = Date.now() + (opts.timeoutMs ?? DEFAULT_TIMEOUT_MS);
  let currentJobId = jobId;
  let failedRetried = false;

  while (Date.now() < deadline) {
    if (opts.signal?.aborted) throw new DOMException("Aborted", "AbortError");
    await sleep(POLL_INTERVAL_MS);
    if (opts.signal?.aborted) throw new DOMException("Aborted", "AbortError");

    const { data: job } = await (supabase as any)
      .from("ai_plan_jobs")
      .select("status, result, error")
      .eq("id", currentJobId)
      .maybeSingle();

    if (!job) {
      // Job no encontrado (RLS o expirado): limpiamos y salimos.
      clearResumeJob(opts.resumeKey);
      throw new Error("job_not_found");
    }

    if (job.status === "completed" && job.result) {
      clearResumeJob(opts.resumeKey);
      return job.result as MissionPlanResult;
    }
    if (job.status === "failed") {
      clearResumeJob(opts.resumeKey);
      if (!failedRetried && opts.onRetryFreshJob) {
        failedRetried = true;
        await sleep(2500);
        const newId = await opts.onRetryFreshJob();
        if (newId) { currentJobId = newId; continue; }
      }
      throw new Error(job.error || "generation_failed");
    }
  }
  throw new Error("timeout");
}

export async function requestMissionPlan(
  body: Record<string, unknown>,
  opts: { timeoutMs?: number; signal?: AbortSignal; resumeKey?: string } = {},
): Promise<MissionPlanResult> {
  // 1) Si hay un job en curso guardado, reenganchamos antes de invocar de nuevo.
  const existingJobId = readResumeJob(opts.resumeKey);
  if (existingJobId) {
    try {
      const { data: job } = await (supabase as any)
        .from("ai_plan_jobs")
        .select("status, result, error")
        .eq("id", existingJobId)
        .maybeSingle();

      if (job?.status === "completed" && job.result) {
        clearResumeJob(opts.resumeKey);
        return job.result as MissionPlanResult;
      }
      if (job?.status === "processing") {
        return await pollJob(existingJobId, {
          ...opts,
          onRetryFreshJob: async () => {
            const retry = await supabase.functions.invoke("generate-mission-plan", { body });
            if (retry.data?.plan) return null;
            if (retry.data?.jobId) {
              writeResumeJob(opts.resumeKey, retry.data.jobId as string);
              return retry.data.jobId as string;
            }
            return null;
          },
        });
      }
      // failed/expired → seguimos con invocación fresca
      clearResumeJob(opts.resumeKey);
    } catch {
      clearResumeJob(opts.resumeKey);
    }
  }

  const { data, error } = await supabase.functions.invoke("generate-mission-plan", { body });

  if (error) {
    const ctx = (error as any)?.context;
    if (ctx && typeof ctx.json === "function") {
      try {
        const parsed = await ctx.json();
        if (parsed && typeof parsed === "object") return parsed as MissionPlanResult;
      } catch { /* propagar */ }
    }
    throw error;
  }

  if (data?.plan || data?.error) return data as MissionPlanResult;

  if (data?.jobId) {
    writeResumeJob(opts.resumeKey, data.jobId as string);
    return await pollJob(data.jobId as string, {
      ...opts,
      onRetryFreshJob: async () => {
        const retry = await supabase.functions.invoke("generate-mission-plan", { body });
        if (retry.data?.plan) return null;
        if (retry.data?.jobId) {
          writeResumeJob(opts.resumeKey, retry.data.jobId as string);
          return retry.data.jobId as string;
        }
        return null;
      },
    });
  }

  return (data ?? {}) as MissionPlanResult;
}
