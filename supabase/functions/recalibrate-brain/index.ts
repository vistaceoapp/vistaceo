// recalibrate-brain — Parte 3 §6.
// Se invoca después de eventos relevantes (misión aceptada, oportunidad
// descartada, objetivo cambiado, dato actualizado, corrección del usuario,
// etc). Aplica un plan de recalibración prudente sobre business_brains.
//
// No cambia UX/UI: solo actualiza dashboard_seed, focus_priority y refresca
// el campo learning_log con el evento. Nunca borra datos previos.

import { createClient } from "npm:@supabase/supabase-js@2";
import { planRecalibration, type RecalibrationEvent } from "../_shared/brain-core/index.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { businessId, event, payload } = await req.json() as {
      businessId: string;
      event: RecalibrationEvent;
      payload?: Record<string, unknown>;
    };
    if (!businessId || !event) {
      return json({ error: "businessId y event son obligatorios" }, 400);
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const plan = planRecalibration(event);

    // Carga brain actual para no pisar nada
    const { data: brain, error: brainErr } = await supabase
      .from("business_brains")
      .select("learning_log, dashboard_seed, focus_priority")
      .eq("business_id", businessId)
      .maybeSingle();

    if (brainErr) throw brainErr;

    const log = Array.isArray((brain as any)?.learning_log) ? (brain as any).learning_log : [];
    const entry = {
      ts: new Date().toISOString(),
      event,
      prudence: plan.prudence,
      applied: plan,
      payload: payload ?? null,
    };
    const nextLog = [entry, ...log].slice(0, 200);

    // Marca el seed como "stale" para que dashboard-prepare lo recalcule
    const seed = (brain as any)?.dashboard_seed ?? {};
    const nextSeed = {
      ...seed,
      stale: true,
      stale_reason: event,
      stale_at: new Date().toISOString(),
    };

    // Reajuste prudente de prioridad de foco solo si el evento lo amerita
    let nextFocusPriority = (brain as any)?.focus_priority ?? 1;
    if (plan.reweight_focus) {
      nextFocusPriority = Math.min(10, Number(nextFocusPriority) + 1);
    }

    const { error: upErr } = await supabase
      .from("business_brains")
      .update({
        learning_log: nextLog,
        dashboard_seed: nextSeed,
        focus_priority: nextFocusPriority,
        last_learning_at: new Date().toISOString(),
      })
      .eq("business_id", businessId);

    if (upErr) throw upErr;

    return json({ ok: true, plan });
  } catch (err) {
    console.error("recalibrate-brain error", err);
    // Nunca exponer error técnico: respondemos ok=false con mensaje genérico
    return json({ ok: false }, 200);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
