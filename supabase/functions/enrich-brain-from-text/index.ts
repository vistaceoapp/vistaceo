// Enrich Brain From Text — extrae hechos, objetivos y dolores del texto libre
// que el usuario escribe ("Cuéntanos más") y los persiste como signals + fact_states.
// Modelo: gemini-2.5-flash (calidad de extracción).
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ReqBody {
  businessId: string;
  source: "setup_enrich" | "nurture_widget" | "settings";
  about?: string;        // qué hace / cómo cobra / cliente típico
  goals?: string;        // objetivos próximos 90 días
  pains?: string;        // qué te frena / preocupa
  freeform?: string;     // texto único (nurture widget)
  countryCode?: string;
}

const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const body = (await req.json()) as ReqBody;
    if (!body?.businessId) return json({ error: "businessId required" }, 400);
    if (!LOVABLE_API_KEY) return json({ error: "Missing LOVABLE_API_KEY" }, 500);

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Recolectar texto
    const blocks: string[] = [];
    if (body.about?.trim()) blocks.push(`SOBRE EL NEGOCIO/SERVICIO:\n${body.about.trim()}`);
    if (body.goals?.trim()) blocks.push(`OBJETIVO 90 DÍAS:\n${body.goals.trim()}`);
    if (body.pains?.trim()) blocks.push(`QUÉ LE FRENA HOY:\n${body.pains.trim()}`);
    if (body.freeform?.trim()) blocks.push(`CONTEXTO EXTRA:\n${body.freeform.trim()}`);
    const text = blocks.join("\n\n");
    if (text.length < 8) return json({ ok: true, learned: [], summary: "" });

    // Llamar a Gemini para extraer
    const prompt = `Sos un analista de negocios. El dueño te escribió esto sobre su negocio (país: ${body.countryCode || "LATAM"}).
Extraé hechos accionables. NUNCA inventes. Si algo no está explícito, no lo incluyas.

Devolvé JSON estricto con esta forma:
{
  "summary": "1 frase de 15-25 palabras que resume lo que aprendiste",
  "facts": [
    { "field": "business_model" | "pricing" | "customer_segment" | "channels" | "team_size" | "current_revenue" | "main_challenge" | "goal_90d" | "competitive_advantage" | "geo_focus" | "tools_used" | "free_observation",
      "value": "valor textual corto",
      "evidence": "frase original del usuario que lo justifica",
      "confidence": 0.0-1.0 }
  ]
}

Texto del usuario:
"""${text}"""`;

    const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: "Devolvé únicamente JSON válido. Sin markdown, sin ```." },
          { role: "user", content: prompt },
        ],
        temperature: 0.2,
      }),
    });

    if (!aiRes.ok) {
      const errText = await aiRes.text();
      if (aiRes.status === 429) return json({ error: "rate_limited", message: "Demasiadas solicitudes. Probá de nuevo en 1 minuto." }, 429);
      if (aiRes.status === 402) return json({ error: "credits_exhausted", message: "Se agotaron los créditos de IA del workspace." }, 402);
      return json({ error: "ai_error", detail: errText.slice(0, 300) }, 502);
    }
    const aiJson = await aiRes.json();
    let parsed: { summary?: string; facts?: Array<{ field: string; value: string; evidence?: string; confidence?: number }> } = {};
    try {
      const raw = aiJson?.choices?.[0]?.message?.content ?? "{}";
      parsed = JSON.parse(typeof raw === "string" ? raw : "{}");
    } catch {
      parsed = {};
    }

    const facts = Array.isArray(parsed.facts) ? parsed.facts : [];
    const summary = (parsed.summary || "").slice(0, 200);

    // Persistir como signals
    const signalRows = facts.map((f) => ({
      business_id: body.businessId,
      type: "learned_fact",
      source: body.source,
      subject: f.field,
      value: { value: f.value, evidence: f.evidence ?? null },
      confidence: clamp01(typeof f.confidence === "number" ? f.confidence : 0.7),
      meta: { from: "enrich-brain-from-text" },
    }));
    if (signalRows.length > 0) {
      await supabase.from("signals").insert(signalRows);
    }

    // Mergear a fact_states del brain
    if (facts.length > 0) {
      const { data: brain } = await supabase
        .from("business_brains")
        .select("id, fact_states, learning_log")
        .eq("business_id", body.businessId)
        .maybeSingle();
      if (brain) {
        const fs: Record<string, any> = (brain.fact_states as any) ?? {};
        const log: any[] = Array.isArray(brain.learning_log) ? (brain.learning_log as any[]) : [];
        const now = new Date().toISOString();
        for (const f of facts) {
          const conf = clamp01(typeof f.confidence === "number" ? f.confidence : 0.7);
          const prev = fs[f.field];
          if (!prev || (prev.confidence ?? 0) <= conf) {
            fs[f.field] = {
              state: conf >= 0.8 ? "confirmed" : "inferred",
              value: f.value,
              confidence: conf,
              evidence: f.evidence ?? null,
              updated_at: now,
            };
          }
          log.push({
            ts: now,
            kind: "user_text",
            field: f.field,
            source: body.source,
          });
        }
        await supabase
          .from("business_brains")
          .update({ fact_states: fs, learning_log: log.slice(-200), last_learning_at: now, updated_at: now })
          .eq("id", brain.id);
      }
    }

    // Fase 4 — invalidar oportunidades relacionadas al hecho recién aprendido.
    // Fire-and-forget: no bloqueamos la respuesta al usuario.
    if (facts.length > 0) {
      try {
        const keywords = Array.from(
          new Set(
            facts
              .flatMap((f) => [String(f.value ?? ""), String(f.field ?? "")])
              .map((s) => s.toLowerCase())
              .flatMap((s) => s.split(/[\s,.;:/()\-]+/))
              .filter((w) => w.length >= 4),
          ),
        ).slice(0, 10);
        const fields = facts.map((f) => String(f.field));
        // No await: no queremos bloquear la UX si es lento.
        supabase.functions
          .invoke("invalidate-stale-opportunities", {
            body: {
              businessId: body.businessId,
              keywords,
              fields,
              reason: `learned_fact:${body.source}`,
            },
          })
          .catch(() => undefined);
      } catch { /* nunca romper enrich */ }
    }

    return json({ ok: true, learned: facts, summary });
  } catch (e) {
    return json({ error: "unexpected", detail: String((e as Error)?.message ?? e) }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
function clamp01(n: number) {
  return Math.max(0, Math.min(1, n));
}
