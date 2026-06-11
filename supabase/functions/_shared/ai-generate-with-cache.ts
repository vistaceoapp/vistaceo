// AI Generate with Cache: orquestador único para todos los generadores IA.
//
// Flujo:
//  1. Lookup en ai_artifacts_cache por (business_id, artifact_type, artifact_key, brain_signature)
//  2. Cache hit → devuelve payload
//  3. Cache miss → llama modelo Flash → valida con gate → si falla, reintenta con modelo Premium
//  4. Si pasa gate → guarda en cache y devuelve
//  5. Si todo falla → devuelve { payload: null, reason } para que la UI muestre skeleton/regenerar
//
// Cero hardcode de contenido: este módulo no genera texto, solo orquesta.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
const AI_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";

const FLASH_MODEL = "google/gemini-2.5-flash";
const PREMIUM_MODEL = "google/gemini-2.5-pro";

export interface GenerateOptions<T> {
  businessId: string;
  artifactType: "mission" | "opportunity" | "prediction" | "analytics" | "radar_mission";
  artifactKey: string; // ej: missionId, opportunityId, radarInsightId
  brainSignature: string;
  system: string;
  user: string;
  validate: (raw: unknown) => { ok: boolean; payload?: T; reasons?: string[] };
  forceRegenerate?: boolean;
}

export interface GenerateResult<T> {
  payload: T | null;
  cached: boolean;
  modelUsed: string | null;
  gatePassed: boolean;
  reasons: string[];
}

function getServiceClient() {
  return createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );
}

async function callModel(model: string, system: string, user: string): Promise<unknown> {
  if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY missing");
  const res = await fetch(AI_URL, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${LOVABLE_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      response_format: { type: "json_object" },
    }),
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`AI ${res.status}: ${t.slice(0, 200)}`);
  }
  const data = await res.json();
  const content = data?.choices?.[0]?.message?.content ?? "{}";
  try {
    return JSON.parse(content);
  } catch {
    // intento de rescate: extraer primer bloque JSON
    const m = content.match(/\{[\s\S]*\}/);
    if (m) {
      try { return JSON.parse(m[0]); } catch { /* fall through */ }
    }
    throw new Error("AI returned non-JSON");
  }
}

export async function generateWithCache<T>(opts: GenerateOptions<T>): Promise<GenerateResult<T>> {
  const supa = getServiceClient();

  // 1. Lookup
  if (!opts.forceRegenerate) {
    const { data: cached } = await supa
      .from("ai_artifacts_cache")
      .select("payload, model_used, brain_signature")
      .eq("business_id", opts.businessId)
      .eq("artifact_type", opts.artifactType)
      .eq("artifact_key", opts.artifactKey)
      .eq("brain_signature", opts.brainSignature)
      .maybeSingle();

    if (cached?.payload) {
      return {
        payload: cached.payload as T,
        cached: true,
        modelUsed: cached.model_used,
        gatePassed: true,
        reasons: [],
      };
    }
  }

  // 2. Flash attempt
  const reasons: string[] = [];
  let payload: T | null = null;
  let modelUsed: string | null = null;

  try {
    const raw = await callModel(FLASH_MODEL, opts.system, opts.user);
    const v = opts.validate(raw);
    if (v.ok && v.payload) {
      payload = v.payload;
      modelUsed = FLASH_MODEL;
    } else {
      reasons.push(`flash_gate_failed:${(v.reasons ?? []).join(",")}`);
    }
  } catch (e) {
    reasons.push(`flash_error:${(e as Error).message}`);
  }

  // 3. Premium retry
  if (!payload) {
    try {
      const raw = await callModel(PREMIUM_MODEL, opts.system, opts.user);
      const v = opts.validate(raw);
      if (v.ok && v.payload) {
        payload = v.payload;
        modelUsed = PREMIUM_MODEL;
      } else {
        reasons.push(`premium_gate_failed:${(v.reasons ?? []).join(",")}`);
      }
    } catch (e) {
      reasons.push(`premium_error:${(e as Error).message}`);
    }
  }

  // 4. Persist
  if (payload && modelUsed) {
    await supa.from("ai_artifacts_cache").upsert({
      business_id: opts.businessId,
      artifact_type: opts.artifactType,
      artifact_key: opts.artifactKey,
      brain_signature: opts.brainSignature,
      payload: payload as unknown as Record<string, unknown>,
      model_used: modelUsed,
      generated_at: new Date().toISOString(),
    }, { onConflict: "business_id,artifact_type,artifact_key" });
  }

  return {
    payload,
    cached: false,
    modelUsed,
    gatePassed: !!payload,
    reasons,
  };
}
