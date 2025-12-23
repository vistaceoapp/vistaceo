import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `Eres un experto en negocios gastronómicos. Tu tarea es generar UNA acción concreta y específica que el dueño de un negocio pueda hacer HOY para mejorar su situación.

REGLAS ESTRICTAS:
1. La acción debe ser realizable en menos de 30 minutos
2. Debe ser específica, no genérica (ej: "Revisa los tiempos de espera del almuerzo" NO "Mejora la operación")
3. Debe estar adaptada al tipo de negocio y contexto
4. Incluye el POR QUÉ de la acción
5. Si hay señales recientes (check-ins, outcomes), úsalas para personalizar

RESPONDE SOLO EN FORMATO JSON:
{
  "title": "Título conciso de la acción (máx 60 caracteres)",
  "description": "Descripción clara de qué hacer y por qué (máx 200 caracteres)",
  "priority": "low|medium|high",
  "category": "marketing|operaciones|finanzas|servicio|equipo",
  "signals": [
    { "type": "insight", "message": "Razón por la cual esta acción es relevante ahora" }
  ],
  "checklist": [
    { "text": "Paso 1 concreto", "done": false },
    { "text": "Paso 2 concreto", "done": false }
  ]
}`;

// Fetch context for action generation
async function fetchActionContext(supabase: any, businessId: string) {
  try {
    const today = new Date().toISOString().split("T")[0];
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const weekAgoStr = weekAgo.toISOString();

    const [checkinsRes, actionsRes, missionsRes, insightsRes] = await Promise.all([
      // Recent checkins for traffic patterns
      supabase
        .from("checkins")
        .select("traffic_level, slot, notes, created_at")
        .eq("business_id", businessId)
        .gte("created_at", weekAgoStr)
        .order("created_at", { ascending: false })
        .limit(7),
      // Recent completed actions with outcomes
      supabase
        .from("daily_actions")
        .select("title, category, outcome, outcome_rating")
        .eq("business_id", businessId)
        .eq("status", "completed")
        .order("completed_at", { ascending: false })
        .limit(5),
      // Active missions areas
      supabase
        .from("missions")
        .select("area, title")
        .eq("business_id", businessId)
        .eq("status", "active")
        .limit(3),
      // Business insights from micro-questions
      supabase
        .from("business_insights")
        .select("category, question, answer")
        .eq("business_id", businessId)
        .order("created_at", { ascending: false })
        .limit(20),
    ]);

    return {
      recentCheckins: checkinsRes.data || [],
      recentActions: actionsRes.data || [],
      activeMissions: missionsRes.data || [],
      businessInsights: insightsRes.data || [],
    };
  } catch (error) {
    console.error("Error fetching action context:", error);
    return null;
  }
}

function buildContextPrompt(business: any, context: any): string {
  let prompt = `NEGOCIO: ${business.name || "Sin nombre"}
TIPO: ${business.category || "restaurant"}
PAÍS: ${business.country || "AR"}`;

  if (business.avg_rating) {
    prompt += `\nRATING: ${business.avg_rating}★`;
  }

  if (context) {
    // Add business insights from micro-questions
    if (context.businessInsights?.length > 0) {
      prompt += "\n\nCONOCIMIENTO DEL NEGOCIO:";
      context.businessInsights.forEach((insight: any) => {
        prompt += `\n- ${insight.question}: ${insight.answer}`;
      });
    }

    if (context.recentCheckins?.length > 0) {
      const avgTraffic = context.recentCheckins.reduce((acc: number, c: any) => acc + (c.traffic_level || 3), 0) / context.recentCheckins.length;
      const lowTrafficSlots = context.recentCheckins.filter((c: any) => c.traffic_level <= 2).map((c: any) => c.slot);
      prompt += `\n\nTRÁFICO RECIENTE: Promedio ${avgTraffic.toFixed(1)}/5`;
      if (lowTrafficSlots.length > 0) {
        prompt += ` (turnos flojos: ${[...new Set(lowTrafficSlots)].join(", ")})`;
      }
    }

    if (context.recentActions?.length > 0) {
      const goodOutcomes = context.recentActions.filter((a: any) => a.outcome_rating >= 4);
      const badOutcomes = context.recentActions.filter((a: any) => a.outcome_rating <= 2);
      
      if (goodOutcomes.length > 0) {
        prompt += `\n\nACCIONES QUE FUNCIONARON: ${goodOutcomes.map((a: any) => a.category).join(", ")}`;
      }
      if (badOutcomes.length > 0) {
        prompt += `\nACCIONES QUE NO FUNCIONARON: ${badOutcomes.map((a: any) => a.category).join(", ")}`;
      }
    }

    if (context.activeMissions?.length > 0) {
      prompt += `\n\nMISIONES ACTIVAS: ${context.activeMissions.map((m: any) => m.area || m.title).join(", ")}`;
    }
  }

  // Add day of week context
  const dayOfWeek = new Date().toLocaleDateString("es", { weekday: "long" });
  const hour = new Date().getHours();
  prompt += `\n\nHOY: ${dayOfWeek}, ${hour}:00 hrs`;

  return prompt;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { businessId, business } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Fetch context
    let context = null;
    if (businessId && SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
      const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
      context = await fetchActionContext(supabase, businessId);
    }

    // Build context prompt
    const contextPrompt = buildContextPrompt(business || {}, context);

    console.log("Generating action with context:", contextPrompt);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: contextPrompt },
        ],
        stream: false,
        temperature: 0.8,
        max_tokens: 512,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Límite de solicitudes excedido" }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No response from AI");
    }

    // Parse JSON from response
    let actionData;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        actionData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON found in response");
      }
    } catch (parseError) {
      console.error("Error parsing AI response:", parseError);
      // Return fallback action
      actionData = {
        title: "Revisar la operación del turno pico",
        description: "Observa y anota los tiempos de espera durante la hora más ocupada de hoy.",
        priority: "medium",
        category: "operaciones",
        signals: [{ type: "insight", message: "Observar tu operación revela oportunidades de mejora" }],
        checklist: [
          { text: "Cronometrar 3 pedidos de inicio a entrega", done: false },
          { text: "Anotar cualquier cuello de botella", done: false },
        ],
      };
    }

    console.log("Generated action:", actionData.title);

    return new Response(
      JSON.stringify({ action: actionData }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("generate-action error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Error desconocido" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
