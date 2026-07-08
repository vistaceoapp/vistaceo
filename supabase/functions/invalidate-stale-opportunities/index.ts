// invalidate-stale-opportunities — marca oportunidades como "stale" cuando el
// brain aprende un hecho nuevo del chat / enriquecimiento y ese hecho toca el
// dominio de una oportunidad activa. No borra: setea repair_status='stale' y
// agrega evidence.staleReason para que el próximo scan pueda regenerarla.
//
// Body: { businessId: string, keywords: string[], reason?: string, fields?: string[] }

import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const { businessId, keywords = [], reason = "chat_learned_fact", fields = [] } =
      (await req.json()) as {
        businessId: string;
        keywords?: string[];
        reason?: string;
        fields?: string[];
      };

    if (!businessId) return json({ error: "businessId required" }, 400);

    const kws = Array.from(
      new Set(
        (keywords || [])
          .map((k) => (k || "").toString().toLowerCase().trim())
          .filter((k) => k.length >= 3),
      ),
    ).slice(0, 12);

    if (kws.length === 0) return json({ ok: true, invalidated: 0, reason: "no_keywords" });

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Traer oportunidades activas del negocio
    const { data: opps, error } = await supabase
      .from("opportunities")
      .select("id, title, description, evidence, repair_status, is_converted, dismissed_at")
      .eq("business_id", businessId)
      .is("dismissed_at", null)
      .eq("is_converted", false)
      .limit(200);

    if (error) return json({ error: error.message }, 500);

    const affected: string[] = [];
    for (const o of opps ?? []) {
      if (o.repair_status === "stale") continue;
      const hay = `${o.title ?? ""} ${o.description ?? ""}`.toLowerCase();
      const matched = kws.filter((k) => hay.includes(k));
      if (matched.length === 0) continue;

      const evidence =
        (o.evidence && typeof o.evidence === "object" && !Array.isArray(o.evidence)
          ? (o.evidence as Record<string, unknown>)
          : {}) || {};
      evidence.staleReason = reason;
      evidence.staleAt = new Date().toISOString();
      evidence.staleMatchedKeywords = matched;
      evidence.staleFields = fields;

      const { error: upErr } = await supabase
        .from("opportunities")
        .update({ repair_status: "stale", evidence })
        .eq("id", o.id);
      if (!upErr) affected.push(o.id);
    }

    return json({ ok: true, invalidated: affected.length, ids: affected });
  } catch (e) {
    return json({ error: String((e as Error)?.message ?? e) }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
