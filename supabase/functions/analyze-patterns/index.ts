import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { businessId } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!LOVABLE_API_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Missing required environment variables");
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Fetch business data
    const { data: business } = await supabase
      .from("businesses")
      .select("*")
      .eq("id", businessId)
      .single();

    if (!business) {
      throw new Error("Business not found");
    }

    // Fetch recent data for pattern analysis
    const [checkinsRes, actionsRes, lessonsRes, insightsRes, externalDataRes] = await Promise.all([
      supabase
        .from("checkins")
        .select("*")
        .eq("business_id", businessId)
        .order("created_at", { ascending: false })
        .limit(30),
      supabase
        .from("daily_actions")
        .select("*")
        .eq("business_id", businessId)
        .order("created_at", { ascending: false })
        .limit(30),
      supabase
        .from("lessons")
        .select("*")
        .eq("business_id", businessId)
        .limit(20),
      supabase
        .from("business_insights")
        .select("*")
        .eq("business_id", businessId)
        .order("created_at", { ascending: false })
        .limit(50),
      supabase
        .from("external_data")
        .select("*")
        .eq("business_id", businessId)
        .order("synced_at", { ascending: false })
        .limit(50),
    ]);

    const checkins = checkinsRes.data || [];
    const actions = actionsRes.data || [];
    const lessons = lessonsRes.data || [];
    const insights = insightsRes.data || [];
    const externalData = externalDataRes.data || [];

    // Build analysis context
    const analysisContext = buildAnalysisContext(business, checkins, actions, lessons, insights, externalData);

    console.log("Analyzing patterns for business:", business.name);

    // Call AI to detect patterns and generate insights
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: `Eres un analista experto en negocios gastronómicos. Tu trabajo es detectar patrones en los datos y generar insights accionables.

DEBES responder con JSON válido en este formato exacto:
{
  "patterns": [
    {
      "type": "trend|anomaly|opportunity|risk",
      "title": "Título corto del patrón (max 50 chars)",
      "description": "Descripción del patrón detectado (max 100 chars)",
      "confidence": 0.0-1.0,
      "category": "ventas|operaciones|clientes|equipo|marketing"
    }
  ],
  "opportunities": [
    {
      "title": "Oportunidad específica (max 60 chars)",
      "description": "Por qué es una oportunidad (max 150 chars)",
      "impact_score": 1-10,
      "effort_score": 1-10,
      "source": "patterns|checkins|actions"
    }
  ],
  "lessons": [
    {
      "content": "Lección aprendida del análisis (max 100 chars)",
      "category": "ventas|operaciones|clientes|equipo|marketing",
      "importance": 1-10
    }
  ]
}

Analiza los datos y encuentra:
1. Patrones de tráfico (días buenos/malos, horarios)
2. Efectividad de acciones (qué funciona, qué no)
3. Oportunidades no aprovechadas
4. Riesgos potenciales

Sé específico y práctico. Solo incluye insights con alta confianza.`
          },
          {
            role: "user",
            content: analysisContext
          }
        ],
        temperature: 0.3,
        max_tokens: 1500,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded" }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const aiData = await response.json();
    const aiMessage = aiData.choices?.[0]?.message?.content;

    if (!aiMessage) {
      throw new Error("No response from AI");
    }

    // Parse AI response
    let analysis;
    try {
      const jsonMatch = aiMessage.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysis = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON found in response");
      }
    } catch (e) {
      console.error("Failed to parse AI response:", aiMessage);
      analysis = { patterns: [], opportunities: [], lessons: [] };
    }

    // Save detected opportunities
    if (analysis.opportunities && analysis.opportunities.length > 0) {
      for (const opp of analysis.opportunities) {
        await supabase.from("opportunities").insert({
          business_id: businessId,
          title: opp.title,
          description: opp.description,
          source: opp.source || "patterns",
          impact_score: opp.impact_score || 5,
          effort_score: opp.effort_score || 5,
        });
      }
    }

    // Save new lessons
    if (analysis.lessons && analysis.lessons.length > 0) {
      for (const lesson of analysis.lessons) {
        await supabase.from("lessons").insert({
          business_id: businessId,
          content: lesson.content,
          category: lesson.category || "general",
          source: "ai_analysis",
          importance: lesson.importance || 5,
        });
      }
    }

    console.log("Pattern analysis complete:", {
      patterns: analysis.patterns?.length || 0,
      opportunities: analysis.opportunities?.length || 0,
      lessons: analysis.lessons?.length || 0,
    });

    return new Response(
      JSON.stringify({
        success: true,
        patterns: analysis.patterns || [],
        opportunitiesCreated: analysis.opportunities?.length || 0,
        lessonsLearned: analysis.lessons?.length || 0,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Pattern analysis error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

function buildAnalysisContext(
  business: any,
  checkins: any[],
  actions: any[],
  lessons: any[],
  insights: any[],
  externalData: any[]
): string {
  let context = `## Negocio: ${business.name}
- Tipo: ${business.category || "No especificado"}
- País: ${business.country || "No especificado"}
- Ticket promedio: ${business.avg_ticket || "No especificado"}
- Rating: ${business.avg_rating || "No especificado"}
`;

  // Business insights from micro-questions (MOST IMPORTANT)
  if (insights.length > 0) {
    context += `\n## Conocimiento del Negocio (${insights.length} respuestas)\n`;
    
    // Group by category
    const byCategory: Record<string, any[]> = {};
    for (const insight of insights) {
      const cat = insight.category || "general";
      if (!byCategory[cat]) byCategory[cat] = [];
      byCategory[cat].push(insight);
    }
    
    for (const [cat, catInsights] of Object.entries(byCategory)) {
      context += `\n[${cat.toUpperCase()}]\n`;
      for (const insight of catInsights.slice(0, 5)) {
        context += `- ${insight.question}: ${insight.answer}\n`;
      }
    }
  }

  // Check-ins analysis
  if (checkins.length > 0) {
    const byDay: Record<string, number[]> = {};
    const bySlot: Record<string, number[]> = {};

    for (const checkin of checkins) {
      const date = new Date(checkin.created_at);
      const dayName = date.toLocaleDateString("es", { weekday: "long" });
      const traffic = checkin.traffic_level || 3;

      if (!byDay[dayName]) byDay[dayName] = [];
      byDay[dayName].push(traffic);

      if (checkin.slot) {
        if (!bySlot[checkin.slot]) bySlot[checkin.slot] = [];
        bySlot[checkin.slot].push(traffic);
      }
    }

    context += `\n## Check-ins (últimos 30)\nTotal registrados: ${checkins.length}\n`;

    for (const [day, traffics] of Object.entries(byDay)) {
      const avg = traffics.reduce((a, b) => a + b, 0) / traffics.length;
      context += `- ${day}: promedio ${avg.toFixed(1)}/5 (${traffics.length} registros)\n`;
    }

    if (Object.keys(bySlot).length > 0) {
      context += `\nPor turno:\n`;
      for (const [slot, traffics] of Object.entries(bySlot)) {
        const avg = traffics.reduce((a, b) => a + b, 0) / traffics.length;
        context += `- ${slot}: promedio ${avg.toFixed(1)}/5\n`;
      }
    }
  }

  // Actions analysis
  if (actions.length > 0) {
    const completed = actions.filter(a => a.status === "completed").length;
    const skipped = actions.filter(a => a.status === "skipped").length;
    const pending = actions.filter(a => a.status === "pending").length;

    const byCategory: Record<string, { completed: number; total: number }> = {};
    for (const action of actions) {
      const cat = action.category || "general";
      if (!byCategory[cat]) byCategory[cat] = { completed: 0, total: 0 };
      byCategory[cat].total++;
      if (action.status === "completed") byCategory[cat].completed++;
    }

    context += `\n## Acciones (últimas 30)\n- Completadas: ${completed}\n- Omitidas: ${skipped}\n- Pendientes: ${pending}\n- Tasa de completado: ${((completed / actions.length) * 100).toFixed(0)}%\n\nPor categoría:\n`;

    for (const [cat, stats] of Object.entries(byCategory)) {
      const rate = stats.total > 0 ? ((stats.completed / stats.total) * 100).toFixed(0) : 0;
      context += `- ${cat}: ${stats.completed}/${stats.total} (${rate}%)\n`;
    }
  }

  // Existing lessons
  if (lessons.length > 0) {
    context += `\n## Lecciones existentes (${lessons.length} total)\n`;
    for (const lesson of lessons.slice(0, 5)) {
      context += `- [${lesson.category}] ${lesson.content}\n`;
    }
  }

  // External data (reviews, metrics, transactions from integrations)
  if (externalData.length > 0) {
    context += `\n## Datos Externos (${externalData.length} items sincronizados)\n`;
    
    // Group by type
    const byType: Record<string, any[]> = {};
    for (const item of externalData) {
      const type = item.data_type || "other";
      if (!byType[type]) byType[type] = [];
      byType[type].push(item);
    }
    
    // Reviews
    if (byType.review) {
      context += `\n### Reseñas (${byType.review.length})\n`;
      for (const review of byType.review.slice(0, 5)) {
        const content = review.content || {};
        context += `- Rating: ${content.rating}/5 - "${content.text?.slice(0, 80)}..." (Sentimiento: ${review.sentiment_score || 'N/A'})\n`;
      }
      
      // Calculate average rating
      const avgRating = byType.review.reduce((sum, r) => sum + (r.content?.rating || 0), 0) / byType.review.length;
      context += `Rating promedio externo: ${avgRating.toFixed(1)}/5\n`;
    }
    
    // Metrics
    if (byType.metric) {
      context += `\n### Métricas externas\n`;
      for (const metric of byType.metric.slice(0, 5)) {
        const content = metric.content || {};
        context += `- ${content.metric_type}: ${content.value} (cambio: ${content.change || 'N/A'})\n`;
      }
    }
    
    // Transactions
    if (byType.transaction) {
      const totalAmount = byType.transaction.reduce((sum, t) => sum + (t.content?.amount || 0), 0);
      const count = byType.transaction.length;
      context += `\n### Transacciones (${count} registradas)\n`;
      context += `- Monto total: $${totalAmount.toLocaleString()}\n`;
      context += `- Promedio por transacción: $${(totalAmount / count).toFixed(0)}\n`;
    }
  }

  return context;
}
