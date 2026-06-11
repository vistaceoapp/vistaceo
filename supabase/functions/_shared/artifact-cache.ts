// Cache layer compartido para los generadores existentes (mission/opportunity/...).
// Genera signature determinístico a partir del contexto del brain + seed,
// permite lookup en `ai_artifacts_cache` y persistencia tras éxito.
//
// Diseñado para inyectarse en `generate-mission-plan`, `generate-opportunity-plan`
// y similares SIN reescribir su lógica de prompt.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

type ArtifactType = "mission" | "opportunity" | "prediction" | "analytics" | "radar_mission";

async function sha256(text: string): Promise<string> {
  const buf = new TextEncoder().encode(text);
  const hash = await crypto.subtle.digest("SHA-256", buf);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function computeBrainSignature(parts: Record<string, unknown>): Promise<string> {
  // Orden estable y sólo campos relevantes para invalidación.
  const keys = Object.keys(parts).sort();
  const norm = keys.map((k) => `${k}=${JSON.stringify(parts[k] ?? null)}`).join("|");
  return await sha256(norm);
}

function admin() {
  return createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );
}

export async function readArtifactCache<T = unknown>(opts: {
  businessId: string;
  artifactType: ArtifactType;
  artifactKey: string;
  brainSignature: string;
}): Promise<{ payload: T; modelUsed: string | null } | null> {
  try {
    const { data } = await admin()
      .from("ai_artifacts_cache")
      .select("payload, model_used, brain_signature, legacy")
      .eq("business_id", opts.businessId)
      .eq("artifact_type", opts.artifactType)
      .eq("artifact_key", opts.artifactKey)
      .maybeSingle();
    if (!data) return null;
    if (data.legacy) return null;
    if (data.brain_signature !== opts.brainSignature) return null;
    return { payload: data.payload as T, modelUsed: (data.model_used as string) ?? null };
  } catch (e) {
    console.warn("[artifact-cache] read failed:", (e as Error).message);
    return null;
  }
}

export async function writeArtifactCache(opts: {
  businessId: string;
  artifactType: ArtifactType;
  artifactKey: string;
  brainSignature: string;
  payload: unknown;
  modelUsed: string;
}): Promise<void> {
  try {
    await admin().from("ai_artifacts_cache").upsert(
      {
        business_id: opts.businessId,
        artifact_type: opts.artifactType,
        artifact_key: opts.artifactKey,
        brain_signature: opts.brainSignature,
        payload: opts.payload as Record<string, unknown>,
        model_used: opts.modelUsed,
        generated_at: new Date().toISOString(),
        legacy: false,
      },
      { onConflict: "business_id,artifact_type,artifact_key" },
    );
  } catch (e) {
    console.warn("[artifact-cache] write failed:", (e as Error).message);
  }
}
