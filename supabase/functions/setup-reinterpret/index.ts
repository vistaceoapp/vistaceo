// setup-reinterpret — cuando el usuario responde CLARIFY con texto libre,
// re-interpreta area/businessType/sub_sector y persiste la reinterpretación
// en businesses.business_profile.reinterpretations para trazabilidad.
//
// No modifica UI. Devuelve una sugerencia { areaId, businessTypeId, subSector,
// confidence, rationale } que la UI puede aplicar en el próximo tick.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface Payload {
  businessId?: string | null;
  clarifyText: string;
  currentAreaId?: string | null;
  currentBusinessTypeId?: string | null;
  currentBusinessTypeLabel?: string | null;
  countryCode?: string | null;
  questionTitle?: string | null;
}

interface Suggestion {
  areaId: string | null;
  businessTypeId: string | null;
  businessTypeLabel: string | null;
  subSector: string | null;
  confidence: number;
  rationale: string;
  invalidatesPrior: boolean;
}

const AREAS = [
  "servicios", "retail", "gastronomia", "salud", "educacion",
  "tecnologia", "manufactura", "b2b", "creativo", "turismo", "inmobiliaria",
  "logistica", "financiero", "agro", "otro",
];

async function callLLM(prompt: string): Promise<string | null> {
  const key = Deno.env.get("LOVABLE_API_KEY");
  if (!key) return null;
  try {
    const r = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-lite",
        messages: [
          { role: "system", content: "Eres un clasificador estricto de negocios. Respondes SOLO JSON válido." },
          { role: "user", content: prompt },
        ],
        temperature: 0.1,
      }),
    });
    if (!r.ok) return null;
    const j = await r.json();
    return j?.choices?.[0]?.message?.content ?? null;
  } catch {
    return null;
  }
}

function safeParse(raw: string): Suggestion | null {
  try {
    const m = raw.match(/\{[\s\S]*\}/);
    if (!m) return null;
    const o = JSON.parse(m[0]);
    return {
      areaId: typeof o.areaId === "string" ? o.areaId.toLowerCase() : null,
      businessTypeId: typeof o.businessTypeId === "string" ? o.businessTypeId : null,
      businessTypeLabel: typeof o.businessTypeLabel === "string" ? o.businessTypeLabel : null,
      subSector: typeof o.subSector === "string" ? o.subSector : null,
      confidence: typeof o.confidence === "number" ? Math.max(0, Math.min(1, o.confidence)) : 0.5,
      rationale: typeof o.rationale === "string" ? o.rationale : "",
      invalidatesPrior: !!o.invalidatesPrior,
    };
  } catch {
    return null;
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const payload = (await req.json()) as Payload;
    const clarify = (payload.clarifyText ?? "").trim();
    if (clarify.length < 6) {
      return new Response(JSON.stringify({ ok: false, reason: "clarify_too_short" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const prompt = `Un usuario está haciendo setup de una plataforma para su negocio y respondió "no me representa / quiero aclarar" con este texto:

"${clarify}"

Contexto actual detectado por el sistema (puede ser incorrecto):
- area actual: ${payload.currentAreaId ?? "desconocida"}
- tipo actual: ${payload.currentBusinessTypeLabel ?? payload.currentBusinessTypeId ?? "desconocido"}
- país: ${payload.countryCode ?? "desconocido"}
- pregunta que respondía: ${payload.questionTitle ?? "n/d"}

Áreas válidas (elegir UNA): ${AREAS.join(", ")}

Devuelve SOLO este JSON:
{
  "areaId": "una de las áreas válidas",
  "businessTypeId": "slug-en-kebab-case-o-null",
  "businessTypeLabel": "Etiqueta legible en español",
  "subSector": "sub-sector específico o null",
  "confidence": 0.0-1.0,
  "rationale": "1 frase en español explicando la clasificación",
  "invalidatesPrior": true si la clasificación actual es incorrecta
}`;

    const raw = await callLLM(prompt);
    if (!raw) {
      return new Response(JSON.stringify({ ok: false, reason: "llm_unavailable" }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const suggestion = safeParse(raw);
    if (!suggestion) {
      return new Response(JSON.stringify({ ok: false, reason: "invalid_llm_output", raw }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Persist en businesses.settings.reinterpretations si hay businessId
    if (payload.businessId) {
      try {
        const supabase = createClient(
          Deno.env.get("SUPABASE_URL")!,
          Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
          { auth: { persistSession: false } },
        );
        const { data: biz } = await supabase
          .from("businesses")
          .select("settings")
          .eq("id", payload.businessId)
          .maybeSingle();
        const settings = (biz?.settings as Record<string, unknown>) ?? {};
        const prev = Array.isArray(settings.reinterpretations) ? settings.reinterpretations : [];
        const next = [
          ...prev.slice(-9),
          {
            at: new Date().toISOString(),
            clarifyText: clarify,
            from: {
              areaId: payload.currentAreaId ?? null,
              businessTypeId: payload.currentBusinessTypeId ?? null,
              businessTypeLabel: payload.currentBusinessTypeLabel ?? null,
            },
            to: {
              areaId: suggestion.areaId,
              businessTypeId: suggestion.businessTypeId,
              businessTypeLabel: suggestion.businessTypeLabel,
              subSector: suggestion.subSector,
            },
            confidence: suggestion.confidence,
            rationale: suggestion.rationale,
          },
        ];
        await supabase
          .from("businesses")
          .update({ settings: { ...settings, reinterpretations: next } })
          .eq("id", payload.businessId);
      } catch (e) {
        console.warn("[setup-reinterpret] persist failed", e);
      }
    }

    return new Response(JSON.stringify({ ok: true, suggestion }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("[setup-reinterpret] error", err);
    return new Response(
      JSON.stringify({ ok: false, error: err instanceof Error ? err.message : "unknown" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
