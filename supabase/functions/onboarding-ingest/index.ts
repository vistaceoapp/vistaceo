// Onboarding inteligente — convierte cada respuesta del usuario en una señal
// del brain. No es un formulario, es una entrevista ejecutiva.
//
// Por cada respuesta:
//  - interpreta significado
//  - actualiza fact_states con trazabilidad (learning-ingest)
//  - crea relaciones internas cuando aplica (relations)
//  - sugiere la próxima pregunta de mayor valor (si la UI la solicita)
//
// No genera UI nueva. Solo expone una API a la que el setup actual puede llamar.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import {
  ingestLearningSignal,
  type LearningSignal,
  type FactState,
} from "../_shared/brain-core/learning-ingest.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface IngestPayload {
  businessId: string;
  // campo lógico del brain (channel.primary, offer.summary, customer.objection...)
  field: string;
  value: unknown;
  // texto crudo de la respuesta del usuario (para evidencia y aprendizaje)
  rawAnswer?: string;
  source?: LearningSignal["source"];
  state?: FactState;
  confidence?: number;
  kind?: LearningSignal["kind"];
  // contexto opcional: etapa interna del onboarding
  stage?:
    | "actividad"
    | "oferta"
    | "cliente"
    | "canal"
    | "friccion"
    | "objetivo"
    | "confirmacion";
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const payload = (await req.json()) as IngestPayload;
    if (!payload?.businessId || !payload?.field) {
      return new Response(JSON.stringify({ error: "businessId y field son requeridos" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const signal: LearningSignal = {
      source: payload.source ?? "onboarding",
      kind: payload.kind ?? (payload.state === "confirmed" ? "confirmed_fact" : "new_fact"),
      field: payload.field,
      state: payload.state,
      value: payload.value,
      evidence: payload.rawAnswer,
      confidence: payload.confidence ?? 0.75,
    };

    const res = await ingestLearningSignal(payload.businessId, signal, supabase);
    if (!res.ok) {
      return new Response(JSON.stringify({ error: res.reason ?? "ingesta_fallida" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Hint mínimo para la próxima etapa interna (la UI puede ignorarlo).
    const nextStage = nextStageHint(payload.stage);

    return new Response(
      JSON.stringify({ ok: true, nextStage }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    console.error("[onboarding-ingest] error:", err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Error desconocido" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});

function nextStageHint(stage?: IngestPayload["stage"]): IngestPayload["stage"] {
  const order: IngestPayload["stage"][] = [
    "actividad",
    "oferta",
    "cliente",
    "canal",
    "friccion",
    "objetivo",
    "confirmacion",
  ];
  if (!stage) return "actividad";
  const i = order.indexOf(stage);
  return i < 0 || i >= order.length - 1 ? "confirmacion" : order[i + 1];
}
