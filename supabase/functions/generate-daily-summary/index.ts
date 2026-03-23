import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { businessId } = await req.json();
    if (!businessId) throw new Error("businessId required");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const lovableKey = Deno.env.get("LOVABLE_API_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const [businessRes, brainRes, snapshotRes, missionsRes, photosRes] = await Promise.all([
      supabase.from("businesses").select("*").eq("id", businessId).single(),
      supabase.from("business_brains").select("factual_memory, dynamic_memory, current_focus, mvc_completion_pct, confidence_score, primary_business_type").eq("business_id", businessId).maybeSingle(),
      supabase.from("snapshots").select("total_score, dimensions_json").eq("business_id", businessId).order("created_at", { ascending: false }).limit(1),
      supabase.from("daily_actions").select("title, status, priority").eq("business_id", businessId).in("status", ["pending", "in_progress"]).limit(5),
      supabase.from("business_photos").select("id", { count: "exact", head: true }).eq("business_id", businessId),
    ]);

    const business = businessRes.data;
    const brain = brainRes.data;
    const snapshot = snapshotRes.data?.[0];
    const missions = missionsRes.data || [];
    const photoCount = photosRes.count || 0;

    if (!business) throw new Error("Business not found");

    const prompt = `Sos el CEO virtual de "${business.name}".

CONTEXTO COMPLETO DEL NEGOCIO:
- Tipo: ${brain?.primary_business_type || business.category || "negocio"}
- País: ${business.country || "LATAM"}
- Modelo de servicio: ${business.service_model || "no especificado"}
- Ticket promedio: ${business.avg_ticket || "no especificado"}
- Rating: ${business.avg_rating || "sin datos"}
- Puntaje de salud general: ${snapshot?.total_score ?? "sin datos"}/100
- Dimensiones de salud: ${JSON.stringify(snapshot?.dimensions_json ?? {})}
- Foco actual del sistema: ${brain?.current_focus ?? "general"}
- Conocimiento del sistema sobre el negocio: ${brain?.mvc_completion_pct ?? 0}%
- Confianza del análisis: ${brain?.confidence_score ?? 0}
- Misiones activas: ${missions.map(m => m.title).join(", ") || "ninguna"}
- Fotos del negocio cargadas: ${photoCount}
- Memoria factual: ${JSON.stringify(brain?.factual_memory ?? {}).slice(0, 800)}
- Memoria dinámica: ${JSON.stringify(brain?.dynamic_memory ?? {}).slice(0, 400)}

INSTRUCCIONES:
Generá un RESUMEN EJECUTIVO del estado general del negocio/servicio/empresa. NO es un resumen "del día", es una VISIÓN ESTRATÉGICA de cómo está el negocio en este momento.

- Máximo 3-4 oraciones, tono de mentor ejecutivo
- Sé MUY específico sobre ESTE negocio: mencioná su nombre, rubro, métricas reales
- Si hay áreas débiles, mencionalo con tacto pero con claridad
- Si hay fortalezas, reconocelas
- Cerrá con 1 insight estratégico accionable
- Usá segunda persona (vos/tú según ${business.country})
- NUNCA seas genérico. Si no hay datos, decilo explícitamente

Respondé SOLO en JSON:
{
  "summary_text": "texto del resumen estratégico",
  "headline": "frase corta de 4-6 palabras que resuma el estado (ej: 'Buen momento para crecer')",
  "priorities": ["prioridad 1", "prioridad 2", "prioridad 3"],
  "mood": "positive|neutral|negative",
  "confidence_note": "frase sobre qué tan bien conoce el sistema al negocio"
}`;

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${lovableKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: "Sos un CEO mentor ultra-personalizado. Respondés SOLO en JSON válido. Nunca usás frases genéricas." },
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
    let content = aiData.choices?.[0]?.message?.content || "";

    const jsonMatch = content.match(/\{[\s\S]*\}/);
    let summary = { summary_text: "", headline: "", priorities: [] as string[], mood: "neutral", confidence_note: "" };

    if (jsonMatch) {
      try {
        summary = JSON.parse(jsonMatch[0]);
      } catch {
        summary.summary_text = content.replace(/```json|```/g, "").trim();
      }
    } else {
      summary.summary_text = content.trim();
    }

    const today = new Date().toISOString().split("T")[0];
    await supabase.from("business_daily_summaries").upsert({
      business_id: businessId,
      summary_date: today,
      summary_text: summary.summary_text,
      priorities: summary.priorities,
      mood: summary.mood,
      key_metrics: { headline: summary.headline, confidence_note: summary.confidence_note },
    }, { onConflict: "business_id,summary_date" });

    return new Response(JSON.stringify({ summary }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
