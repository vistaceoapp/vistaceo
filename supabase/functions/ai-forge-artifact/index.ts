// ai-forge-artifact: edge function unificada del motor IA "cero hardcode".
// Acepta cualquier tipo de artefacto, arma el BrainContext, elige el forge
// correcto, genera con cache + reintento premium, y devuelve el payload.
//
// La UI solo necesita:
//   supabase.functions.invoke('ai-forge-artifact', { body: { ... } })

import "https://deno.land/std@0.224.0/dotenv/load.ts";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { buildBrainContextFromPack } from "../_shared/brain-context.ts";
import {
  forgeMissionPrompt,
  forgeOpportunityPrompt,
  forgePredictionPrompt,
  forgeAnalyticsPrompt,
  forgeRadarMissionPrompt,
  type MissionSeed,
  type OpportunitySeed,
  type PredictionSeed,
  type AnalyticsSeed,
  type RadarMissionSeed,
} from "../_shared/prompt-forge.ts";
import { generateWithCache } from "../_shared/ai-generate-with-cache.ts";
import type { EdgeContextPack } from "../_shared/context-pack-types.ts";

type ArtifactType = "mission" | "opportunity" | "prediction" | "analytics" | "radar_mission";

interface ForgeRequest {
  businessId: string;
  artifactType: ArtifactType;
  artifactKey: string;
  contextPack: EdgeContextPack;
  signals?: Array<{ raw_text?: string } | string>;
  insights?: Array<{ question?: string; answer?: string }>;
  competitors?: string[];
  integrations?: string[];
  seed: MissionSeed | OpportunitySeed | PredictionSeed | AnalyticsSeed | RadarMissionSeed;
  forceRegenerate?: boolean;
}

function validatePayload(type: ArtifactType, raw: unknown): { ok: boolean; payload?: unknown; reasons?: string[] } {
  if (!raw || typeof raw !== "object") return { ok: false, reasons: ["not_object"] };
  const r = raw as Record<string, unknown>;
  const reasons: string[] = [];
  const FORBIDDEN = /Q_AI_|\[Setup_answer\]|\[object Object\]/i;
  const flat = JSON.stringify(r);
  if (FORBIDDEN.test(flat)) reasons.push("leak");

  if (type === "mission" || type === "radar_mission") {
    if (typeof r.title !== "string" || r.title.length < 8) reasons.push("title_short");
    if (typeof r.description !== "string" || r.description.length < 40) reasons.push("desc_short");
    const steps = Array.isArray(r.steps) ? r.steps : [];
    if (steps.length < 4) reasons.push("steps_few");
    for (const s of steps) {
      const sObj = s as Record<string, unknown>;
      if (typeof sObj?.how !== "string" || (sObj.how as string).length < 80) {
        reasons.push("step_thin");
        break;
      }
      if (typeof sObj?.title === "string" && /^analizar el problema|^definir el objetivo|^planificar la acci[oó]n|^ejecutar el plan|^medir resultados/i.test(sObj.title as string)) {
        reasons.push("step_generic");
        break;
      }
    }
  } else if (type === "opportunity") {
    if (typeof r.title !== "string" || r.title.length < 10) reasons.push("title_short");
    if (typeof r.summary !== "string" || r.summary.length < 60) reasons.push("summary_short");
    if (typeof r.whyItApplies !== "string" || r.whyItApplies.length < 40) reasons.push("why_short");
  } else if (type === "prediction") {
    if (typeof r.title !== "string" || r.title.length < 10) reasons.push("title_short");
    if (typeof r.rationale !== "string" || r.rationale.length < 60) reasons.push("rationale_short");
    if (typeof r.probability !== "number") reasons.push("no_probability");
  } else if (type === "analytics") {
    if (typeof r.interpretation !== "string" || r.interpretation.length < 60) reasons.push("interpretation_short");
  }

  return reasons.length ? { ok: false, reasons } : { ok: true, payload: r };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const body = (await req.json()) as ForgeRequest;
    if (!body.businessId || !body.artifactType || !body.artifactKey || !body.contextPack || !body.seed) {
      return new Response(JSON.stringify({ error: "missing_fields" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const ctx = await buildBrainContextFromPack(body.contextPack, {
      signals: body.signals,
      insights: body.insights,
      competitors: body.competitors,
      integrations: body.integrations,
    });

    let prompt;
    switch (body.artifactType) {
      case "mission":
        prompt = forgeMissionPrompt(ctx, body.seed as MissionSeed); break;
      case "radar_mission":
        prompt = forgeRadarMissionPrompt(ctx, body.seed as RadarMissionSeed); break;
      case "opportunity":
        prompt = forgeOpportunityPrompt(ctx, body.seed as OpportunitySeed); break;
      case "prediction":
        prompt = forgePredictionPrompt(ctx, body.seed as PredictionSeed); break;
      case "analytics":
        prompt = forgeAnalyticsPrompt(ctx, body.seed as AnalyticsSeed); break;
      default:
        return new Response(JSON.stringify({ error: "unknown_type" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }

    const result = await generateWithCache({
      businessId: body.businessId,
      artifactType: body.artifactType,
      artifactKey: body.artifactKey,
      brainSignature: ctx.signature,
      system: prompt.system,
      user: prompt.user,
      validate: (raw) => validatePayload(body.artifactType, raw) as { ok: boolean; payload?: unknown; reasons?: string[] },
      forceRegenerate: body.forceRegenerate,
    });

    return new Response(
      JSON.stringify({
        ok: !!result.payload,
        payload: result.payload,
        signature: ctx.signature,
        cached: result.cached,
        modelUsed: result.modelUsed,
        gatePassed: result.gatePassed,
        reasons: result.reasons,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
