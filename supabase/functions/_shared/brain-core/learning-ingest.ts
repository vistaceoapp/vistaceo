// Brain Core — Aprendizaje continuo.
// Cada interacción del usuario es una señal. Esta función ingesta señales,
// actualiza fact_states con trazabilidad y registra en learning_log.

import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

export type FactState =
  | "confirmed"
  | "inferred"
  | "possible"
  | "doubtful"
  | "discarded"
  | "pending";

export type LearningKind =
  | "new_fact"
  | "confirmed_fact"
  | "corrected_fact"
  | "hypothesis_reinforced"
  | "hypothesis_weakened"
  | "hypothesis_discarded"
  | "behavior_signal"
  | "pending_validation";

export interface LearningSignal {
  source:
    | "onboarding"
    | "chat"
    | "mission_applied"
    | "mission_ignored"
    | "mission_completed"
    | "opportunity_saved"
    | "opportunity_dismissed"
    | "opportunity_applied"
    | "data_update"
    | "metric_loaded"
    | "user_correction"
    | "inactivity"
    | "behavior";
  kind: LearningKind;
  field?: string; // p.ej. "channel.primary", "customer.objection"
  state?: FactState;
  value?: unknown;
  evidence?: string;
  confidence?: number; // 0..1
  occurredAt?: string;
}

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

export function adminClient(): SupabaseClient {
  return createClient(SUPABASE_URL, SERVICE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/**
 * Aplica una señal de aprendizaje al brain de un negocio.
 * - Nunca sobreescribe el brain entero.
 * - Si la señal corrige un dato confirmado con baja confianza, marca como "doubtful".
 * - Registra en learning_log para trazabilidad.
 */
export async function ingestLearningSignal(
  businessId: string,
  signal: LearningSignal,
  client?: SupabaseClient,
): Promise<{ ok: boolean; reason?: string }> {
  const db = client ?? adminClient();

  const { data: brain, error } = await db
    .from("business_brains")
    .select("id, fact_states, learning_log, total_signals, last_learning_at")
    .eq("business_id", businessId)
    .maybeSingle();

  if (error || !brain) return { ok: false, reason: "brain_no_existe" };

  const fact_states: Record<string, { state: FactState; value: unknown; confidence: number; evidence?: string; updated_at: string }>
    = (brain.fact_states as Record<string, { state: FactState; value: unknown; confidence: number; evidence?: string; updated_at: string }>) ?? {};
  const learning_log: unknown[] = Array.isArray(brain.learning_log) ? brain.learning_log as unknown[] : [];

  // Aplicar al fact_states sólo si hay field
  if (signal.field) {
    const prev = fact_states[signal.field];
    const incomingConf = clamp01(signal.confidence ?? 0.5);
    const nextState: FactState = signal.state
      ?? (signal.kind === "confirmed_fact" ? "confirmed"
         : signal.kind === "corrected_fact" ? "confirmed"
         : signal.kind === "hypothesis_reinforced" ? "inferred"
         : signal.kind === "hypothesis_weakened" ? "possible"
         : signal.kind === "hypothesis_discarded" ? "discarded"
         : signal.kind === "behavior_signal" ? "inferred"
         : "pending");

    // Regla: no degradar "confirmed" con confianza alta sin evidencia explícita de corrección.
    if (prev?.state === "confirmed" && prev.confidence >= 0.8
        && signal.kind !== "corrected_fact" && signal.kind !== "user_correction" as unknown) {
      // mantener prev, no aplicar
    } else {
      fact_states[signal.field] = {
        state: nextState,
        value: signal.value ?? prev?.value,
        confidence: signal.kind === "corrected_fact"
          ? Math.max(incomingConf, 0.85)
          : Math.max(incomingConf, (prev?.confidence ?? 0) * 0.9),
        evidence: signal.evidence ?? prev?.evidence,
        updated_at: new Date().toISOString(),
      };
    }
  }

  // Append a learning_log con cap de 200 entradas más recientes.
  learning_log.push({
    at: signal.occurredAt ?? new Date().toISOString(),
    source: signal.source,
    kind: signal.kind,
    field: signal.field,
    confidence: signal.confidence,
    evidence: signal.evidence,
  });
  const trimmedLog = learning_log.slice(-200);

  const { error: upErr } = await db
    .from("business_brains")
    .update({
      fact_states,
      learning_log: trimmedLog,
      total_signals: (brain.total_signals ?? 0) + 1,
      last_learning_at: new Date().toISOString(),
    })
    .eq("id", brain.id);

  if (upErr) return { ok: false, reason: upErr.message };
  return { ok: true };
}

function clamp01(n: number): number {
  if (!Number.isFinite(n)) return 0.5;
  return Math.max(0, Math.min(1, n));
}
