// Artifact Memo — reutilización de resultados IA ya generados y validados.
//
// Principio: NO cambia ni un carácter de los prompts, modelos ni gates.
// Solo evita pagar dos veces por exactamente el mismo resultado:
//   1. Se calcula una firma (hash) del contexto que alimenta al modelo.
//   2. Si existe un resultado guardado con esa misma firma (y dentro del TTL),
//      se devuelve tal cual: la salida es IDÉNTICA a regenerarla.
//   3. Si no existe, se genera, se valida con los gates de siempre y se guarda.
//   4. Candado anti-duplicados: si otra ejecución ya está generando lo mismo,
//      esta espera ese resultado en lugar de disparar una segunda llamada paga.
//
// Cero hardcode de contenido: este módulo no genera texto, solo orquesta.

import { createClient, type SupabaseClient } from "npm:@supabase/supabase-js@2";

const LOCK_TTL_MS = 90_000; // una generación en curso no bloquea más de 90s
const LOCK_POLL_MS = 1_500;
const LOCK_MAX_WAIT_MS = 45_000;

export interface MemoOptions<T> {
  businessId: string;
  /** ej: "analytics", "daily_summary", "chat_suggestion", "opportunity", "prediction" */
  artifactType: string;
  /** clave estable del artefacto dentro del tipo (ej: opportunityId, fecha, "default") */
  artifactKey?: string;
  /** cualquier objeto/string que represente el contexto exacto usado por el modelo */
  signatureSource: unknown;
  /** vigencia en minutos; 0 o undefined = sin expiración (solo cambia si cambia la firma) */
  ttlMinutes?: number;
  forceRegenerate?: boolean;
  /** generación real: prompts, modelo y gates originales, sin tocar */
  produce: () => Promise<T | null>;
  client?: SupabaseClient;
}

export interface MemoResult<T> {
  value: T | null;
  cached: boolean;
  signature: string;
}

function serviceClient(): SupabaseClient {
  return createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}

/** Hash estable (SHA-256 truncado) de cualquier contexto serializable. */
export async function computeSignature(source: unknown): Promise<string> {
  const text = typeof source === "string" ? source : stableStringify(source);
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf))
    .slice(0, 16)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function stableStringify(value: unknown): string {
  if (value === null || typeof value !== "object") return JSON.stringify(value) ?? "null";
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(",")}]`;
  const obj = value as Record<string, unknown>;
  const keys = Object.keys(obj).sort();
  return `{${keys.map((k) => `${JSON.stringify(k)}:${stableStringify(obj[k])}`).join(",")}}`;
}

function isLockPayload(payload: unknown): boolean {
  return !!payload && typeof payload === "object" && (payload as Record<string, unknown>)._memo_lock === true;
}

function isFresh(generatedAt: string | null, ttlMinutes?: number): boolean {
  if (!ttlMinutes || ttlMinutes <= 0) return true;
  if (!generatedAt) return false;
  return Date.now() - new Date(generatedAt).getTime() < ttlMinutes * 60_000;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function memoizeArtifact<T>(opts: MemoOptions<T>): Promise<MemoResult<T>> {
  const supa = opts.client ?? serviceClient();
  const artifactKey = opts.artifactKey ?? "default";
  const signature = await computeSignature(opts.signatureSource);

  const read = async () =>
    await supa
      .from("ai_artifacts_cache")
      .select("payload, brain_signature, generated_at")
      .eq("business_id", opts.businessId)
      .eq("artifact_type", opts.artifactType)
      .eq("artifact_key", artifactKey)
      .maybeSingle();

  if (!opts.forceRegenerate) {
    const { data: row } = await read();
    if (row && row.brain_signature === signature) {
      if (isLockPayload(row.payload)) {
        // Otra ejecución está generando lo mismo: esperamos su resultado.
        const lockAge = Date.now() - new Date(row.generated_at ?? 0).getTime();
        if (lockAge < LOCK_TTL_MS) {
          const waited = await waitForLock<T>(read, signature, opts.ttlMinutes);
          if (waited !== undefined) return { value: waited, cached: true, signature };
        }
      } else if (row.payload && isFresh(row.generated_at, opts.ttlMinutes)) {
        return { value: row.payload as T, cached: true, signature };
      }
    }
  }

  // Candado: marcamos que esta ejecución genera el artefacto.
  await supa.from("ai_artifacts_cache").upsert(
    {
      business_id: opts.businessId,
      artifact_type: opts.artifactType,
      artifact_key: artifactKey,
      brain_signature: signature,
      payload: { _memo_lock: true },
      model_used: null,
      generated_at: new Date().toISOString(),
    },
    { onConflict: "business_id,artifact_type,artifact_key" },
  );

  let value: T | null = null;
  try {
    value = await opts.produce();
  } catch (e) {
    await releaseLock(supa, opts.businessId, opts.artifactType, artifactKey);
    throw e;
  }

  if (value === null || value === undefined) {
    await releaseLock(supa, opts.businessId, opts.artifactType, artifactKey);
    return { value: null, cached: false, signature };
  }

  await supa.from("ai_artifacts_cache").upsert(
    {
      business_id: opts.businessId,
      artifact_type: opts.artifactType,
      artifact_key: artifactKey,
      brain_signature: signature,
      payload: value as unknown as Record<string, unknown>,
      generated_at: new Date().toISOString(),
    },
    { onConflict: "business_id,artifact_type,artifact_key" },
  );

  return { value, cached: false, signature };
}

async function waitForLock<T>(
  read: () => Promise<{ data: { payload: unknown; brain_signature: string; generated_at: string } | null }>,
  signature: string,
  ttlMinutes?: number,
): Promise<T | undefined> {
  const deadline = Date.now() + LOCK_MAX_WAIT_MS;
  while (Date.now() < deadline) {
    await sleep(LOCK_POLL_MS);
    const { data } = await read();
    if (!data || data.brain_signature !== signature) return undefined;
    if (!isLockPayload(data.payload) && data.payload && isFresh(data.generated_at, ttlMinutes)) {
      return data.payload as T;
    }
  }
  return undefined;
}

async function releaseLock(
  supa: SupabaseClient,
  businessId: string,
  artifactType: string,
  artifactKey: string,
): Promise<void> {
  await supa
    .from("ai_artifacts_cache")
    .delete()
    .eq("business_id", businessId)
    .eq("artifact_type", artifactType)
    .eq("artifact_key", artifactKey)
    .contains("payload", { _memo_lock: true });
}
