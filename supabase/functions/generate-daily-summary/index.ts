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

    // Gather business context
    const [businessRes, brainRes, snapshotRes, missionsRes] = await Promise.all([
      supabase.from("businesses").select("*").eq("id", businessId).single(),
      supabase.from("business_brains").select("factual_memory, dynamic_memory, current_focus, mvc_completion_pct, confidence_score").eq("business_id", businessId).maybeSingle(),
      supabase.from("snapshots").select("total_score, dimensions_json").eq("business_id", businessId).order("created_at", { ascending: false }).limit(1),
      supabase.from("daily_actions").select("title, status, priority").eq("business_id", businessId).in("status", ["pending", "in_progress"]).limit(5),
    ]);

    const business = businessRes.data;
    const brain = brainRes.data;
    const snapshot = snapshotRes.data?.[0];
    const missions = missionsRes.data || [];

    if (!business) throw new Error("Business not found");

    const hour = new Date().getHours();
    const greeting = hour < 12 ? "Buenos días" : hour < 18 ? "Buenas tardes" : "Buenas noches";

    const prompt = `Sos el CEO virtual de "${business.name}" (${business.category || "negocio"}, ${business.country || "LATAM"}).
    
Generá un resumen ejecutivo ULTRA personalizado para hoy. Máximo 3 oraciones, tono directo y profesional.

Contexto del negocio:
- Puntaje de salud: ${snapshot?.total_score ?? "sin datos"}
- Dimensiones: ${JSON.stringify(snapshot?.dimensions_json ?? {})}
- Foco actual: ${brain?.current_focus ?? "general"}
- Completitud del cerebro: ${brain?.mvc_completion_pct ?? 0}%
- Confianza: ${brain?.confidence_score ?? 0}
- Misiones activas: ${missions.map(m => m.title).join(", ") || "ninguna"}
- Memoria factual: ${JSON.stringify(brain?.factual_memory ?? {}).slice(0, 500)}

IMPORTANTE:
- Sé específico sobre ESTE negocio, nunca genérico
- Si hay datos bajos, mencionalo sutilmente
- Incluí 1-3 prioridades accionables para hoy
- Usá segunda persona (vos/tú según el país ${business.country})
- Respondé SOLO en JSON con este formato exacto:
{
  "summary_text": "texto del resumen",
  "priorities": ["prioridad 1", "prioridad 2"],
  "mood": "positive|neutral|negative"
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
          { role: "system", content: "Sos un CEO mentor ultra-personalizado. Respondés SOLO en JSON válido." },
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

    // Parse JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    let summary = { summary_text: "", priorities: [] as string[], mood: "neutral" };

    if (jsonMatch) {
      try {
        summary = JSON.parse(jsonMatch[0]);
      } catch {
        summary.summary_text = content.replace(/```json|```/g, "").trim();
      }
    } else {
      summary.summary_text = content.trim();
    }

    // Save to database
    const today = new Date().toISOString().split("T")[0];
    await supabase.from("business_daily_summaries").upsert({
      business_id: businessId,
      summary_date: today,
      summary_text: summary.summary_text,
      priorities: summary.priorities,
      mood: summary.mood,
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
