// Cross-device persistent cache for AI artifacts (mission plans, opportunity
// plans, etc.). Reads directly from `ai_artifacts_cache` on Supabase so a
// plan generated on one device shows up instantly on any other device of
// the same business owner. Falls back to localStorage for ultra-fast
// repeated visits on the same device.

import { supabase } from "@/integrations/supabase/client";

type ArtifactType = "mission" | "opportunity" | "prediction" | "analytics" | "radar_mission";

interface LocalEntry<T> {
  payload: T;
  businessId: string;
  cachedAt: number;
}

const LS_PREFIX = "ai_artifact_v1:";

function lsKey(type: ArtifactType, artifactKey: string) {
  return `${LS_PREFIX}${type}:${artifactKey}`;
}

export function readLocalArtifact<T>(type: ArtifactType, artifactKey: string, businessId: string): T | null {
  try {
    const raw = localStorage.getItem(lsKey(type, artifactKey));
    if (!raw) return null;
    const entry = JSON.parse(raw) as LocalEntry<T>;
    return entry.businessId === businessId ? entry.payload : null;
  } catch {
    return null;
  }
}

export function writeLocalArtifact<T>(type: ArtifactType, artifactKey: string, businessId: string, payload: T) {
  try {
    const entry: LocalEntry<T> = { payload, businessId, cachedAt: Date.now() };
    localStorage.setItem(lsKey(type, artifactKey), JSON.stringify(entry));
  } catch {
    /* quota o storage bloqueado — ignorar silencioso */
  }
}

/**
 * Lee el artefacto desde la base (cross-device). Devuelve null si no existe
 * o si la sesión no autoriza ver ese negocio.
 */
export async function readRemoteArtifact<T>(
  type: ArtifactType,
  artifactKey: string,
  businessId: string,
): Promise<T | null> {
  try {
    const { data } = await supabase
      .from("ai_artifacts_cache")
      .select("payload")
      .eq("business_id", businessId)
      .eq("artifact_type", type)
      .eq("artifact_key", artifactKey)
      .maybeSingle();
    return (data?.payload as T) ?? null;
  } catch {
    return null;
  }
}

/**
 * Composición típica: local → remoto → null. Hidrata localStorage al volver
 * desde remoto para que la próxima vez sea instantáneo.
 */
export async function readArtifactCachedAnywhere<T>(
  type: ArtifactType,
  artifactKey: string,
  businessId: string,
): Promise<T | null> {
  const local = readLocalArtifact<T>(type, artifactKey, businessId);
  if (local) return local;
  const remote = await readRemoteArtifact<T>(type, artifactKey, businessId);
  if (remote) writeLocalArtifact(type, artifactKey, businessId, remote);
  return remote;
}
