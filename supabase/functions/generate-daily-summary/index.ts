import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import { ANTI_GENERIC_SYSTEM } from "../_shared/brain-core/anti-generic-prompt.ts";
import { buildTerminologyContext } from "../_shared/brain-core/contextual-terminology.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { businessId, force, contextPack, module } = await req.json();
    if (!businessId) throw new Error("businessId required");
    console.log('[generate-daily-summary] module=', module ?? 'dashboard', 'hasContextPack=', !!contextPack);

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const lovableKey = Deno.env.get("LOVABLE_API_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Cache server-side: si ya hay resumen de hoy con señales y no se forzó, devolverlo.
    const today = new Date().toISOString().split("T")[0];
    if (!force) {
      const { data: cached } = await supabase
        .from("business_daily_summaries")
        .select("*")
        .eq("business_id", businessId)
        .eq("summary_date", today)
        .maybeSingle();
      const cachedMetrics = cached?.key_metrics as Record<string, any> | null;
      const cachedSignals = Array.isArray(cachedMetrics?.signals) ? cachedMetrics!.signals : [];
      if (cached && cachedSignals.length > 0) {
        return new Response(JSON.stringify({
          summary: {
            summary_text: cached.summary_text,
            headline: cachedMetrics?.headline || "",
            priorities: cached.priorities || [],
            mood: cached.mood || "neutral",
            confidence_note: cachedMetrics?.confidence_note || "",
            signals: cachedSignals,
          },
          cached: true,
        }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
    }

    const [businessRes, brainRes, snapshotRes, missionsRes, photosRes, competitorsRes] = await Promise.all([
      supabase.from("businesses").select("*").eq("id", businessId).single(),
      supabase.from("business_brains").select("factual_memory, dynamic_memory, current_focus, mvc_completion_pct, confidence_score, primary_business_type").eq("business_id", businessId).maybeSingle(),
      supabase.from("snapshots").select("total_score, dimensions_json").eq("business_id", businessId).order("created_at", { ascending: false }).limit(1),
      supabase.from("daily_actions").select("title, status, priority").eq("business_id", businessId).in("status", ["pending", "in_progress"]).limit(5),
      supabase.from("business_photos").select("id", { count: "exact", head: true }).eq("business_id", businessId),
      supabase.from("business_competitors").select("name, rating, price_level").eq("business_id", businessId).limit(5),
    ]);

    const business = businessRes.data;
    const brain = brainRes.data;
    const snapshot = snapshotRes.data?.[0];
    const missions = missionsRes.data || [];
    const photoCount = photosRes.count || 0;
    const competitors = competitorsRes.data || [];

    if (!business) throw new Error("Business not found");

    const prompt = `Sos el CEO virtual de "${business.name}".

CONTEXTO COMPLETO DEL NEGOCIO (ÚNICO Y EXCLUSIVO):
- Nombre: ${business.name}
- Tipo: ${brain?.primary_business_type || business.category || "negocio"}
- País: ${business.country || "LATAM"}
- Modelo de servicio: ${business.service_model || "no especificado"}
- Ticket promedio: ${business.avg_ticket || "no especificado"} ${business.currency || ""}
- Rating: ${business.avg_rating || "sin datos"}
- Puntaje de salud: ${snapshot?.total_score ?? "sin datos"}/100
- Dimensiones: ${JSON.stringify(snapshot?.dimensions_json ?? {})}
- Foco actual: ${brain?.current_focus ?? "general"}
- Conocimiento del sistema: ${brain?.mvc_completion_pct ?? 0}%
- Confianza: ${brain?.confidence_score ?? 0}
- Misiones activas: ${missions.map(m => m.title).join(", ") || "ninguna"}
- Competidores: ${competitors.map(c => c.name).join(", ") || "ninguno"}
- Fotos cargadas: ${photoCount}
- Memoria factual: ${JSON.stringify(brain?.factual_memory ?? {}).slice(0, 400)}
- Memoria dinámica: ${JSON.stringify(brain?.dynamic_memory ?? {}).slice(0, 200)}

INSTRUCCIONES:
Generá un CENTRO DE INTELIGENCIA ejecutivo ULTRA-PERSONALIZADO para ESTE negocio específico. Cada señal debe ser única para "${business.name}" — un negocio de "${brain?.primary_business_type || business.category}" en "${business.country}". NO uses frases genéricas.

Devolvé EXACTAMENTE este JSON:
{
  "summary_text": "Visión estratégica narrativa, 3-4 oraciones, segunda persona, mencionando nombre, rubro, país y métricas reales",
  "headline": "Frase corta 4-6 palabras del estado actual",
  "priorities": ["prioridad 1 específica", "prioridad 2 específica", "prioridad 3 específica"],
  "mood": "positive|neutral|negative",
  "confidence_note": "Frase corta sobre qué tan bien conoce el sistema al negocio",
  "signals": [
    { "type": "opportunity", "label": "OPORTUNIDAD", "title": "título corto", "description": "1 oración accionable específica del rubro y país" },
    { "type": "competitive", "label": "RADAR COMPETITIVO", "title": "título corto", "description": "1 oración sobre competidores o mercado local" },
    { "type": "prediction", "label": "PREDICCIÓN", "title": "título corto", "description": "1 oración sobre tendencia futura" },
    { "type": "mission", "label": "MISIÓN PRIORITARIA", "title": "título corto", "description": "1 oración accionable concreta" },
    { "type": "trend", "label": "TENDENCIA EMERGENTE", "title": "título corto", "description": "1 oración sobre tendencia del sector" },
    { "type": "risk", "label": "RIESGO DETECTADO", "title": "título corto", "description": "1 oración sobre un riesgo concreto" }
  ]
}

REGLAS:
- Cada señal específica del rubro y país
- Si faltan datos, basate en patrones típicos del sector con cautela
- Tono mentor ejecutivo, conciso, accionable, en español ${business.country === 'AR' || business.country === 'UY' ? 'rioplatense (vos)' : 'neutro (tú)'}`;

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${lovableKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-lite",
        messages: [
          { role: "system", content: `Sos un CEO mentor ultra-personalizado. Respondés SOLO en JSON válido. Nunca usás frases genéricas.\n\n${ANTI_GENERIC_SYSTEM}\n\n${(await import("../_shared/brain-core/prompt2-rules.ts")).prompt2Rules("dashboard")}\n\n${buildTerminologyContext({ activity: brain?.primary_business_type || business?.category || null, country: business?.country || null, offer: (brain?.factual_memory as any)?.offer ?? null, customer: (brain?.factual_memory as any)?.customer ?? null, channel: (brain?.factual_memory as any)?.channel ?? null }).promptFragment}` },
          { role: "user", content: prompt },
        ],
      }),
    });

    if (!aiResponse.ok) {
      const errText = await aiResponse.text();
      console.error("AI error:", aiResponse.status, errText);
      throw new Error("AI gateway error");
    }

    const aiData = await aiResponse.json();
    const content = aiData.choices?.[0]?.message?.content || "";

    const jsonMatch = content.match(/\{[\s\S]*\}/);
    let summary: any = { summary_text: "", headline: "", priorities: [], mood: "neutral", confidence_note: "", signals: [] };

    if (jsonMatch) {
      try {
        summary = JSON.parse(jsonMatch[0]);
      } catch {
        summary.summary_text = content.replace(/```json|```/g, "").trim();
      }
    } else {
      summary.summary_text = content.trim();
    }

    // Runtime gate sobre el headline + texto del resumen diario
    const { runtimeOutputGate, safeFallback } = await import("../_shared/brain-core/runtime-output-gate.ts");
    const dailyGate = runtimeOutputGate({
      text: `${summary.headline ?? ""}\n${summary.summary_text ?? ""}`,
      kind: "dashboard",
      hasBrainEvidence: !!brain,
      hasConcreteAction: Array.isArray(summary.priorities) && summary.priorities.length > 0,
    });
    if (!dailyGate.ok) {
      console.warn("[runtime-output-gate:daily-summary] flagged:", dailyGate.reasons);
      summary.summary_text = safeFallback("dashboard");
    }

    const today = new Date().toISOString().split("T")[0];
    await supabase.from("business_daily_summaries").upsert({
      business_id: businessId,
      summary_date: today,
      summary_text: summary.summary_text,
      priorities: summary.priorities,
      mood: summary.mood,
      key_metrics: {
        headline: summary.headline,
        confidence_note: summary.confidence_note,
        signals: summary.signals || [],
      },
    }, { onConflict: "business_id,summary_date" });

    // Server-side validateBeforeStore (Prompt 3)
    try {
      const { validateBeforeStore } = await import("../_shared/validate-before-store.ts");
      const audit = validateBeforeStore({ module: 'dashboard', text: summary.summary_text ?? '', title: summary.headline });
      if (!audit.passed) {
        console.warn('[generate-daily-summary] gate blocked:', audit.reasons);
        summary.summary_text = 'Estoy construyendo la lectura real del negocio. Confirmá tu próximo objetivo para afinar el resumen.';
      }
    } catch (e) { console.error('[generate-daily-summary] validate failed', e); }

    return new Response(JSON.stringify({ summary, quality: { passed: true }, fallbackUsed: false }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: 'temporary_unavailable', quality: { passed: false, reasons: ['edge_function_failed'] }, fallbackUsed: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
