/**
 * seed-business-brain
 *
 * Genera signals semilla HIPER-PERSONALIZADAS para el Brain de un negocio
 * usando Lovable AI (Gemini). No usa familias ni catálogos fijos: cada
 * negocio recibe señales únicas basadas en su propio contexto declarado
 * en setup (categoría exacta libre, país, ticket, dayparts, canales, etc.).
 *
 * También produce una `personalized_signature` (línea contextual por
 * daypart) y un `personalized_label` que se guardan en `businesses.settings`
 * para que la UI hable en el idioma específico de ese negocio.
 *
 * Body: { businessId: string, force?: boolean }
 * Idempotente: si ya hay signals `source='ai_personalized'` para el negocio
 * y `force` no es true, no regenera.
 */
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const DAYPARTS = ["early_morning", "morning", "midday", "afternoon", "evening", "late_night"] as const;
type DayPart = typeof DAYPARTS[number];

interface AISeedResponse {
  label: string;
  peak_dayparts: DayPart[];
  signature_by_daypart: Partial<Record<DayPart, string>>;
  signals: Array<{
    signal_type: string;
    importance: number;
    confidence: "low" | "medium" | "high";
    content: Record<string, unknown>;
    raw_text: string;
  }>;
}

function buildPrompt(biz: Record<string, unknown>): string {
  // Compactar todo el contexto declarado, sin recortes innecesarios.
  const ctx = {
    nombre: biz.name,
    categoria_libre: biz.category,
    pais: biz.country,
    moneda: biz.currency,
    modelo_servicio: biz.service_model,
    canales: biz.channel_mix,
    rango_facturacion_mensual: biz.monthly_revenue_range,
    rango_ticket_promedio: biz.avg_ticket_range,
    ticket_promedio: biz.avg_ticket,
    rango_transacciones_diarias: biz.daily_transactions_range,
    rango_food_cost: biz.food_cost_range,
    dayparts_activos: biz.active_dayparts,
    plataformas_delivery: biz.delivery_platforms,
    plataformas_reserva: biz.reservation_platforms,
    radio_competitivo_km: biz.competitive_radius_km,
    direccion: biz.address,
    settings: biz.settings,
  };

  return `Sos un analista estratégico senior. Vas a generar el "seed" inicial del cerebro analítico de UN negocio concreto.

CONTEXTO REAL DEL NEGOCIO (datos declarados por el dueño, NO inventes nada extra):
${JSON.stringify(ctx, null, 2)}

REGLAS DURAS:
1. Español 100% profesional. Sin anglicismos ("feedback", "insight", "tips", "core"). Sin emojis.
2. NUNCA inventes cifras propias del negocio (no fabriques ventas, clientes, ratings). Sí podés citar rangos referenciales de la INDUSTRIA específica de este negocio, marcados como referencia.
3. Personalización máxima: cada signal debe ser relevante para ESTE negocio (categoría exacta, país, ticket, canales). Nada genérico tipo "medir KPIs".
4. NO uses familias amplias ("gastronomía", "retail"). Hablá del tipo exacto que declaró el usuario.
5. Tono ejecutivo, directo, sin relleno.

DEVOLVÉ ESTRICTAMENTE UN JSON con esta forma (sin texto fuera del JSON, sin code fences):

{
  "label": "Etiqueta corta (4-9 palabras) que describe este negocio con precisión, incluyendo ciudad/país si suma. Ej: 'Cafetería de especialidad en Palermo, AR'.",
  "peak_dayparts": ["array con 1-4 de: early_morning, morning, midday, afternoon, evening, late_night — los reales de ESTE negocio según los datos"],
  "signature_by_daypart": {
    "early_morning": "Línea contextual <=120 chars sobre QUÉ pasa en este negocio a esa hora (qué mirar, qué palanca jugar). Vacía si no aplica.",
    "morning": "...",
    "midday": "...",
    "afternoon": "...",
    "evening": "...",
    "late_night": "..."
  },
  "signals": [
    {
      "signal_type": "sector_benchmark | sector_lever | sector_risk | opportunity_seed",
      "importance": 1-10,
      "confidence": "low | medium | high",
      "content": { "metric": "...", "min": 0, "max": 0, "unidad": "...", "fuente": "referencia_industria" },
      "raw_text": "Frase ejecutiva en español, una sola oración, específica al rubro del negocio."
    }
  ]
}

CANTIDAD: entre 8 y 12 signals. Variedad: al menos 3 benchmarks, 3 palancas, 2 riesgos. El resto pueden ser semillas de oportunidades específicas detectadas en el contexto.

Si algún daypart no es relevante para este negocio, devolvelo como "" (string vacío). No incluyas claves extra.`;
}

async function callLovableAI(prompt: string, apiKey: string): Promise<AISeedResponse> {
  const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Lovable-API-Key": apiKey,
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-pro",
      messages: [
        { role: "system", content: "Devolvés exclusivamente JSON válido, sin texto extra ni code fences." },
        { role: "user", content: prompt },
      ],
      temperature: 0.4,
      response_format: { type: "json_object" },
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`AI gateway ${res.status}: ${text.slice(0, 400)}`);
  }
  const json = await res.json();
  const raw = json?.choices?.[0]?.message?.content ?? "";
  const cleaned = String(raw).replace(/^```json\s*|\s*```$/g, "").trim();
  const parsed = JSON.parse(cleaned) as AISeedResponse;

  if (!parsed || !Array.isArray(parsed.signals) || parsed.signals.length === 0) {
    throw new Error("Respuesta de IA inválida: faltan signals");
  }
  return parsed;
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const lovableKey = Deno.env.get("LOVABLE_API_KEY");
    if (!lovableKey) {
      return new Response(JSON.stringify({ error: "LOVABLE_API_KEY no configurada" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(supabaseUrl, serviceKey);
    const body = await req.json().catch(() => ({}));
    const businessId = String(body?.businessId ?? "").trim();
    const force = Boolean(body?.force);
    if (!businessId) {
      return new Response(JSON.stringify({ error: "businessId requerido" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: biz, error: bizErr } = await supabase
      .from("businesses")
      .select(
        "id, name, category, country, currency, settings, service_model, channel_mix, " +
        "monthly_revenue_range, avg_ticket_range, avg_ticket, daily_transactions_range, " +
        "food_cost_range, active_dayparts, delivery_platforms, reservation_platforms, " +
        "competitive_radius_km, address"
      )
      .eq("id", businessId)
      .maybeSingle();

    if (bizErr || !biz) {
      return new Response(JSON.stringify({ error: "negocio no encontrado", detail: bizErr?.message }), {
        status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Idempotencia
    if (!force) {
      const { count } = await supabase
        .from("signals")
        .select("id", { count: "exact", head: true })
        .eq("business_id", businessId)
        .in("source", ["ai_personalized", "sector_baseline"]);
      if ((count ?? 0) > 0) {
        return new Response(JSON.stringify({ skipped: true, reason: "ya sembrado", existing: count }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // Garantizar brain
    let { data: brain } = await supabase
      .from("business_brains")
      .select("id")
      .eq("business_id", businessId)
      .maybeSingle();

    if (!brain) {
      const { data: created, error: brainErr } = await supabase
        .from("business_brains")
        .insert({ business_id: businessId })
        .select("id")
        .single();
      if (brainErr) {
        return new Response(JSON.stringify({ error: "no se pudo crear brain", detail: brainErr.message }), {
          status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      brain = created;
    }

    // Llamado a Lovable AI
    const ai = await callLovableAI(buildPrompt(biz as Record<string, unknown>), lovableKey);

    // Filtrar signature daypart vacíos
    const cleanSignature: Record<string, string> = {};
    for (const dp of DAYPARTS) {
      const v = ai.signature_by_daypart?.[dp];
      if (typeof v === "string" && v.trim().length > 0) cleanSignature[dp] = v.trim();
    }

    // Insertar signals personalizadas
    const rows = ai.signals.slice(0, 12).map((s) => ({
      business_id: businessId,
      brain_id: brain!.id,
      signal_type: String(s.signal_type || "sector_benchmark"),
      source: "ai_personalized",
      content: { ...(s.content || {}), generated_by: "seed-business-brain" },
      raw_text: String(s.raw_text || "").slice(0, 1000),
      confidence: ["low", "medium", "high"].includes(s.confidence) ? s.confidence : "medium",
      importance: Math.max(1, Math.min(10, Number(s.importance) || 5)),
    }));

    const { error: insErr, count } = await supabase
      .from("signals")
      .insert(rows, { count: "exact" });

    if (insErr) {
      return new Response(JSON.stringify({ error: "no se pudieron insertar signals", detail: insErr.message }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Persistir signature y label personalizados
    const settings = (biz.settings as Record<string, unknown>) || {};
    await supabase
      .from("businesses")
      .update({
        settings: {
          ...settings,
          brain_seeded_at: new Date().toISOString(),
          brain_seed_source: "ai_personalized",
          personalized_label: String(ai.label || "").slice(0, 120),
          personalized_signature: cleanSignature,
          peak_dayparts: Array.isArray(ai.peak_dayparts) ? ai.peak_dayparts.filter((d) => DAYPARTS.includes(d as DayPart)) : [],
          needs_seed: false,
        },
      })
      .eq("id", businessId);

    return new Response(JSON.stringify({
      ok: true,
      inserted: count ?? rows.length,
      label: ai.label,
      personalized: true,
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    return new Response(JSON.stringify({ error: "fallo inesperado", detail: e instanceof Error ? e.message : String(e) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
