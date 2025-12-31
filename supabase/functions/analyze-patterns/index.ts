import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Blocked generic phrases that should never appear in opportunities
const BLOCKED_PHRASES = [
  "mejorar ventas",
  "aumentar clientes", 
  "optimizar operaciones",
  "mejorar servicio",
  "incrementar ingresos",
  "mejorar negocio",
  "hacer crecer",
  "optimizar procesos",
  "mejorar rendimiento",
  "aumentar ventas",
  "mejorar calidad",
  "incrementar productividad",
  "maximizar beneficios",
  "potenciar resultados",
  "aumentar ganancias",
  "mejorar eficiencia",
  "sistema de check-in", // Too generic
  "implementar check-ins", // Too generic
];

// Function to calculate semantic similarity between two strings
function calculateSimilarity(str1: string, str2: string): number {
  const s1 = str1.toLowerCase().replace(/[^a-záéíóúñ\s]/g, '');
  const s2 = str2.toLowerCase().replace(/[^a-záéíóúñ\s]/g, '');
  
  const words1 = s1.split(/\s+/).filter(w => w.length > 3);
  const words2 = s2.split(/\s+/).filter(w => w.length > 3);
  
  if (words1.length === 0 || words2.length === 0) return 0;
  
  const commonWords = words1.filter(w => words2.includes(w));
  const similarity = (2 * commonWords.length) / (words1.length + words2.length);
  
  return similarity;
}

// Check if opportunity is duplicate of existing ones
function isDuplicate(
  newOpp: { title: string; description: string },
  existingOpps: Array<{ title: string; description: string | null }>
): boolean {
  for (const existing of existingOpps) {
    // Check title similarity
    const titleSim = calculateSimilarity(newOpp.title, existing.title);
    if (titleSim > 0.5) {
      console.log(`Duplicate detected (title similarity ${titleSim.toFixed(2)}): "${newOpp.title}" ~ "${existing.title}"`);
      return true;
    }
    
    // Check combined title+description similarity
    const newCombined = `${newOpp.title} ${newOpp.description}`;
    const existCombined = `${existing.title} ${existing.description || ''}`;
    const combinedSim = calculateSimilarity(newCombined, existCombined);
    if (combinedSim > 0.6) {
      console.log(`Duplicate detected (combined similarity ${combinedSim.toFixed(2)}): "${newOpp.title}"`);
      return true;
    }
  }
  return false;
}

// Check if opportunity contains blocked generic phrases
function containsBlockedPhrase(title: string, description: string): boolean {
  const combined = `${title} ${description}`.toLowerCase();
  for (const phrase of BLOCKED_PHRASES) {
    if (combined.includes(phrase)) {
      console.log(`Blocked phrase detected: "${phrase}" in "${title}"`);
      return true;
    }
  }
  return false;
}

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

    // Fetch ALL existing opportunities for deduplication
    const { data: existingOpportunities } = await supabase
      .from("opportunities")
      .select("id, title, description, source")
      .eq("business_id", businessId)
      .is("dismissed_at", null);

    // Fetch ALL existing missions to avoid suggesting same things
    const { data: existingMissions } = await supabase
      .from("missions")
      .select("id, title, description")
      .eq("business_id", businessId);

    // Combine both for deduplication
    const existingItems = [
      ...(existingOpportunities || []),
      ...(existingMissions || []).map(m => ({ ...m, source: 'mission' }))
    ];

    console.log(`Existing items for deduplication: ${existingItems.length}`);

    // Fetch business brain for deep personalization
    const { data: brain } = await supabase
      .from("business_brains")
      .select("*")
      .eq("business_id", businessId)
      .single();

    // Fetch recent data for pattern analysis
    const [checkinsRes, actionsRes, lessonsRes, insightsRes, externalDataRes, signalsRes, snapshotsRes, focusConfigRes] = await Promise.all([
      supabase.from("checkins").select("*").eq("business_id", businessId).order("created_at", { ascending: false }).limit(30),
      supabase.from("daily_actions").select("*").eq("business_id", businessId).order("created_at", { ascending: false }).limit(30),
      supabase.from("lessons").select("*").eq("business_id", businessId).limit(20),
      supabase.from("business_insights").select("*").eq("business_id", businessId).order("created_at", { ascending: false }).limit(50),
      supabase.from("external_data").select("*").eq("business_id", businessId).order("synced_at", { ascending: false }).limit(50),
      supabase.from("signals").select("*").eq("business_id", businessId).order("created_at", { ascending: false }).limit(30),
      supabase.from("snapshots").select("*").eq("business_id", businessId).order("created_at", { ascending: false }).limit(3),
      supabase.from("business_focus_config").select("*").eq("business_id", businessId).single(),
    ]);

    // Build ultra-personalized analysis context
    const analysisContext = buildDeepAnalysisContext(
      business, 
      brain,
      checkinsRes.data || [],
      actionsRes.data || [],
      lessonsRes.data || [],
      insightsRes.data || [],
      externalDataRes.data || [],
      signalsRes.data || [],
      snapshotsRes.data || [],
      focusConfigRes.data,
      existingItems
    );

    console.log("Analyzing patterns for business:", business.name);

    // ULTRA-PERSONALIZED SYSTEM PROMPT
    const systemPrompt = `Eres un consultor de negocios gastronómicos con 20 años de experiencia en LATAM. 
Tu especialidad es detectar oportunidades CONCRETAS y ESPECÍFICAS basadas en datos reales.

## REGLAS CRÍTICAS:
1. NUNCA generes oportunidades genéricas como "mejorar ventas" o "aumentar clientes"
2. Cada oportunidad DEBE mencionar datos específicos del negocio (números, nombres, fechas)
3. NUNCA sugieras algo que ya existe en la lista de "Oportunidades/Misiones Existentes"
4. Si no hay datos suficientes para una oportunidad concreta, NO la generes
5. Máximo 3 oportunidades por análisis - prefiere calidad sobre cantidad
6. Los títulos deben ser ÚNICOS y diferenciarse claramente entre sí

## FORMATO DE RESPUESTA (JSON válido):
{
  "opportunities": [
    {
      "title": "Título específico (mencionar dato concreto)",
      "description": "Descripción con evidencia del negocio (mencionar dato, fecha, o patrón detectado)",
      "impact_score": 1-10,
      "effort_score": 1-10,
      "source": "categoría",
      "evidence": {
        "trigger": "¿Qué dato disparó esta oportunidad?",
        "signals": ["señal 1", "señal 2"],
        "dataPoints": número_de_datos_usados,
        "basedOn": ["fuente 1", "fuente 2"]
      }
    }
  ],
  "patterns": [],
  "lessons": []
}

## EJEMPLOS DE OPORTUNIDADES CORRECTAS:
✅ "Potenciar el almuerzo: 73% del tráfico vs 27% cena" (menciona datos específicos)
✅ "Responder a las 4 reseñas negativas sobre tiempos de espera" (número concreto)
✅ "Promoción para miércoles: día más bajo con solo 2.1/5 de tráfico" (día + métrica)
✅ "Destacar la Milanesa Napolitana ($8500) - mencionada en 3 reseñas positivas" (producto + precio + dato)

## EJEMPLOS DE OPORTUNIDADES INCORRECTAS (BLOQUEADAS):
❌ "Implementar sistema de check-ins" (demasiado genérico)
❌ "Mejorar la comunicación con el equipo" (sin datos específicos)
❌ "Optimizar operaciones" (vacío de contenido)
❌ "Aumentar presencia en redes" (sin estrategia concreta)

Solo genera oportunidades que PUEDAS respaldar con datos del contexto proporcionado.`;

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
          { role: "system", content: systemPrompt },
          { role: "user", content: analysisContext }
        ],
        temperature: 0.3,
        max_tokens: 2000,
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

    // QUALITY GATE: Filter and deduplicate opportunities
    let insertedCount = 0;
    let filteredCount = 0;
    
    if (analysis.opportunities && analysis.opportunities.length > 0) {
      for (const opp of analysis.opportunities) {
        // Check for blocked phrases
        if (containsBlockedPhrase(opp.title, opp.description)) {
          console.log(`Filtered (blocked phrase): ${opp.title}`);
          filteredCount++;
          continue;
        }
        
        // Check for duplicates
        if (isDuplicate(opp, existingItems)) {
          console.log(`Filtered (duplicate): ${opp.title}`);
          filteredCount++;
          continue;
        }
        
        // Check minimum quality
        if (!opp.title || opp.title.length < 10 || !opp.description || opp.description.length < 20) {
          console.log(`Filtered (too short): ${opp.title}`);
          filteredCount++;
          continue;
        }
        
        // Insert the opportunity with evidence
        const { error: insertError } = await supabase.from("opportunities").insert({
          business_id: businessId,
          title: opp.title,
          description: opp.description,
          source: opp.source || "patterns",
          impact_score: opp.impact_score || 5,
          effort_score: opp.effort_score || 5,
          evidence: opp.evidence || {},
        });

        if (insertError) {
          console.error("Insert error:", insertError);
        } else {
          insertedCount++;
          // Add to existing items for subsequent duplicate checks
          existingItems.push({ id: '', title: opp.title, description: opp.description, source: 'new' });
        }
      }
    }

    // Save new lessons (with deduplication)
    if (analysis.lessons && analysis.lessons.length > 0) {
      for (const lesson of analysis.lessons) {
        // Check if similar lesson exists
        const similarLesson = (lessonsRes.data || []).find(l => 
          calculateSimilarity(l.content, lesson.content) > 0.6
        );
        
        if (!similarLesson) {
          await supabase.from("lessons").insert({
            business_id: businessId,
            content: lesson.content,
            category: lesson.category || "general",
            source: "ai_analysis",
            importance: lesson.importance || 5,
          });
        }
      }
    }

    console.log("Pattern analysis complete:", {
      patternsFound: analysis.patterns?.length || 0,
      opportunitiesGenerated: analysis.opportunities?.length || 0,
      opportunitiesInserted: insertedCount,
      opportunitiesFiltered: filteredCount,
      lessonsLearned: analysis.lessons?.length || 0,
    });

    return new Response(
      JSON.stringify({
        success: true,
        patterns: analysis.patterns || [],
        opportunitiesCreated: insertedCount,
        opportunitiesFiltered: filteredCount,
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

function buildDeepAnalysisContext(
  business: any,
  brain: any,
  checkins: any[],
  actions: any[],
  lessons: any[],
  insights: any[],
  externalData: any[],
  signals: any[],
  snapshots: any[],
  focusConfig: any,
  existingItems: any[]
): string {
  let context = `# ANÁLISIS PARA: ${business.name}

## PERFIL DEL NEGOCIO
- **Nombre**: ${business.name}
- **Tipo**: ${business.category || "Gastronómico"}
- **País**: ${business.country || "Argentina"}
- **Ciudad/Zona**: ${business.address || "No especificado"}
- **Ticket promedio**: ${business.avg_ticket ? `$${business.avg_ticket}` : "No especificado"}
- **Rating actual**: ${business.avg_rating ? `${business.avg_rating}/5` : "No especificado"}
- **Modelo de servicio**: ${business.service_model || "No especificado"}
- **Plataformas delivery**: ${business.delivery_platforms?.join(", ") || "Ninguna"}
- **Días/Horarios fuertes**: ${business.active_dayparts?.join(", ") || "No especificado"}
`;

  // Brain context (what we already know)
  if (brain) {
    context += `
## MEMORIA DEL NEGOCIO (Lo que ya sabemos)
- **Foco actual**: ${brain.current_focus || "ventas"}
- **Tipo principal**: ${brain.primary_business_type || "restaurant"}
- **Confianza del sistema**: ${brain.confidence_score || 0}%
- **Señales procesadas**: ${brain.total_signals || 0}

### Datos factuales conocidos:
${JSON.stringify(brain.factual_memory || {}, null, 2)}

### Preferencias del dueño:
${JSON.stringify(brain.preferences_memory || {}, null, 2)}
`;
  }

  // Focus config
  if (focusConfig) {
    context += `
## CONFIGURACIÓN DE FOCO
- **Foco principal**: ${focusConfig.current_focus}
- **Foco secundario**: ${focusConfig.secondary_focus || "ninguno"}
- **Límite semanal de acciones**: ${focusConfig.weekly_action_limit || 3}
`;
  }

  // EXISTING ITEMS - CRITICAL FOR DEDUPLICATION
  if (existingItems.length > 0) {
    context += `
## ⚠️ OPORTUNIDADES/MISIONES EXISTENTES (NO REPETIR)
${existingItems.map(item => `- "${item.title}"`).join("\n")}
`;
  }

  // Business insights from micro-questions (MOST IMPORTANT)
  if (insights.length > 0) {
    context += `\n## RESPUESTAS DEL DUEÑO (${insights.length} datos)\n`;
    
    const byCategory: Record<string, any[]> = {};
    for (const insight of insights) {
      const cat = insight.category || "general";
      if (!byCategory[cat]) byCategory[cat] = [];
      byCategory[cat].push(insight);
    }
    
    for (const [cat, catInsights] of Object.entries(byCategory)) {
      context += `\n**[${cat.toUpperCase()}]**\n`;
      for (const insight of catInsights.slice(0, 8)) {
        context += `- ${insight.question}: **${insight.answer}**\n`;
      }
    }
  }

  // Signals (recent observations)
  if (signals.length > 0) {
    context += `\n## SEÑALES RECIENTES (${signals.length})\n`;
    for (const signal of signals.slice(0, 10)) {
      const content = signal.content || {};
      context += `- [${signal.signal_type}] ${signal.raw_text || JSON.stringify(content).slice(0, 100)}\n`;
    }
  }

  // Latest snapshot (health diagnosis)
  if (snapshots.length > 0) {
    const latest = snapshots[0];
    context += `\n## ÚLTIMO DIAGNÓSTICO DE SALUD
- **Score total**: ${latest.total_score || 0}/100
- **Fortalezas**: ${JSON.stringify(latest.strengths || [])}
- **Debilidades**: ${JSON.stringify(latest.weaknesses || [])}
- **Acciones sugeridas**: ${JSON.stringify(latest.top_actions || [])}
`;
  }

  // Check-ins analysis with specific numbers
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

    context += `\n## TRÁFICO (${checkins.length} check-ins)\n`;

    // Find best and worst days
    const dayStats = Object.entries(byDay).map(([day, traffics]) => ({
      day,
      avg: traffics.reduce((a, b) => a + b, 0) / traffics.length,
      count: traffics.length
    })).sort((a, b) => b.avg - a.avg);

    context += `**Ranking de días:**\n`;
    for (const stat of dayStats) {
      context += `- ${stat.day}: ${stat.avg.toFixed(1)}/5 (${stat.count} registros)\n`;
    }

    if (dayStats.length >= 2) {
      context += `\n📈 **Mejor día**: ${dayStats[0].day} (${dayStats[0].avg.toFixed(1)}/5)\n`;
      context += `📉 **Peor día**: ${dayStats[dayStats.length-1].day} (${dayStats[dayStats.length-1].avg.toFixed(1)}/5)\n`;
    }

    if (Object.keys(bySlot).length > 0) {
      context += `\n**Por turno:**\n`;
      for (const [slot, traffics] of Object.entries(bySlot)) {
        const avg = traffics.reduce((a, b) => a + b, 0) / traffics.length;
        const percent = ((traffics.length / checkins.length) * 100).toFixed(0);
        context += `- ${slot}: ${avg.toFixed(1)}/5 (${percent}% del total)\n`;
      }
    }
  }

  // Actions analysis
  if (actions.length > 0) {
    const completed = actions.filter(a => a.status === "completed").length;
    const skipped = actions.filter(a => a.status === "skipped").length;
    const completionRate = ((completed / actions.length) * 100).toFixed(0);

    const byCategory: Record<string, { completed: number; total: number }> = {};
    for (const action of actions) {
      const cat = action.category || "general";
      if (!byCategory[cat]) byCategory[cat] = { completed: 0, total: 0 };
      byCategory[cat].total++;
      if (action.status === "completed") byCategory[cat].completed++;
    }

    context += `\n## ACCIONES (${actions.length} totales)
- ✅ Completadas: ${completed}
- ⏭️ Omitidas: ${skipped}
- 📊 Tasa de ejecución: **${completionRate}%**

**Por categoría:**\n`;

    for (const [cat, stats] of Object.entries(byCategory)) {
      const rate = stats.total > 0 ? ((stats.completed / stats.total) * 100).toFixed(0) : 0;
      const emoji = parseInt(rate as string) >= 70 ? "✅" : parseInt(rate as string) >= 40 ? "⚠️" : "❌";
      context += `- ${emoji} ${cat}: ${stats.completed}/${stats.total} (${rate}%)\n`;
    }
  }

  // External data (reviews with specific mentions)
  if (externalData.length > 0) {
    const reviews = externalData.filter(d => d.data_type === 'review');
    
    if (reviews.length > 0) {
      const positiveReviews = reviews.filter(r => (r.sentiment_score || 0) > 0.5);
      const negativeReviews = reviews.filter(r => (r.sentiment_score || 0) < -0.2);
      const avgRating = reviews.reduce((sum, r) => sum + (r.content?.rating || 0), 0) / reviews.length;
      
      context += `\n## RESEÑAS EXTERNAS (${reviews.length})
- Rating promedio: **${avgRating.toFixed(1)}/5**
- Positivas: ${positiveReviews.length}
- Negativas: ${negativeReviews.length}
`;
      
      if (negativeReviews.length > 0) {
        context += `\n**Reseñas negativas recientes:**\n`;
        for (const review of negativeReviews.slice(0, 3)) {
          const text = review.content?.text?.slice(0, 150) || "Sin texto";
          context += `- ⭐${review.content?.rating || "?"}: "${text}..."\n`;
        }
      }
    }
  }

  return context;
}
