import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `Eres un consultor experto en negocios gastronómicos con 20 años de experiencia. Tu tarea es generar un PLAN DE ACCIÓN ULTRA-PERSONALIZADO y ÚNICO para una oportunidad de mejora específica.

REGLAS ANTI-GENÉRICO (CRÍTICAS):
1. PROHIBIDO usar frases genéricas: "mejora tu negocio", "aumenta tus ventas", "optimiza", "sé más eficiente"
2. Cada paso DEBE incluir datos ESPECÍFICOS del negocio: nombre, productos, precios, horarios, empleados
3. Si mencionás un producto, usa el nombre REAL del negocio
4. Si hablás de horarios, usa los turnos ESPECÍFICOS que te paso
5. NUNCA uses "considera hacer X" - siempre "Hacé X a las Y horas porque Z"

REGLAS DE PERSONALIZACIÓN EXTREMA:
1. El plan debe ser IMPOSIBLE de aplicar a otro negocio (tan específico es)
2. Cada paso incluye: acción concreta, tiempo exacto, métrica específica, recursos necesarios
3. Referenciá la situación ACTUAL del negocio en cada paso
4. Usá el nombre del negocio en al menos 3 pasos
5. Si hay datos de tráfico, horarios pico, o productos, USALOS en los pasos
6. Conectá cada paso con una señal o dato real que te di

FORMATO DE RESPUESTA (JSON):
{
  "planSummary": "Resumen de 1 línea que menciona el nombre del negocio y el objetivo específico",
  "estimatedTotalTime": "X horas/días",
  "expectedResult": "Resultado concreto medible (ej: +0.3 en rating, +15% en X)",
  "confidence": "high|medium|low",
  "confidenceReason": "Por qué esta confianza - basado en qué datos",
  "steps": [
    {
      "stepNumber": 1,
      "title": "Título accionable y específico",
      "description": "Descripción que menciona datos del negocio",
      "timeEstimate": "X minutos/horas",
      "howTo": [
        "Sub-paso ultra concreto con datos reales",
        "Otro sub-paso específico",
        "Sub-paso que menciona algo del negocio"
      ],
      "why": "Por qué este paso aplica a ESTE negocio específicamente",
      "metric": "Cómo medir éxito de este paso",
      "resources": ["Recurso específico necesario"],
      "tips": ["Tip para este tipo de negocio"],
      "confidence": "high|medium|low",
      "warnings": ["Posible obstáculo a considerar"]
    }
  ],
  "quickWins": [
    "Acción que puede hacer HOY en 15 minutos"
  ],
  "risks": [
    "Riesgo específico del contexto de este negocio"
  ],
  "dependencies": [
    "Qué necesita para poder ejecutar esto"
  ],
  "successChecklist": [
    "Criterio de éxito medible"
  ],
  "dataGapsIdentified": [
    "Dato que me falta para ser más preciso (si aplica)"
  ]
}`;

async function fetchOpportunityContext(supabase: any, businessId: string, opportunityId: string) {
  try {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 30);
    const weekAgoStr = weekAgo.toISOString();

    const [
      businessRes,
      brainRes,
      opportunityRes,
      checkinsRes,
      insightsRes,
      signalsRes,
      actionsRes,
      alertsRes,
      snapshotsRes,
      missionsRes,
      menuRes
    ] = await Promise.all([
      supabase.from("businesses").select("*").eq("id", businessId).single(),
      supabase.from("business_brains").select("*").eq("business_id", businessId).maybeSingle(),
      supabase.from("opportunities").select("*").eq("id", opportunityId).maybeSingle(),
      supabase.from("checkins").select("*").eq("business_id", businessId).gte("created_at", weekAgoStr).order("created_at", { ascending: false }).limit(20),
      supabase.from("business_insights").select("*").eq("business_id", businessId).order("created_at", { ascending: false }).limit(40),
      supabase.from("signals").select("*").eq("business_id", businessId).order("created_at", { ascending: false }).limit(15),
      supabase.from("daily_actions").select("*").eq("business_id", businessId).order("completed_at", { ascending: false }).limit(10),
      supabase.from("alerts").select("*").eq("business_id", businessId).order("created_at", { ascending: false }).limit(5),
      supabase.from("snapshots").select("*").eq("business_id", businessId).order("created_at", { ascending: false }).limit(1),
      supabase.from("missions").select("*").eq("business_id", businessId).in("status", ["active", "paused", "completed"]).limit(10),
      supabase.from("business_menu_items").select("*").eq("business_id", businessId).limit(20),
    ]);

    return {
      business: businessRes.data,
      brain: brainRes.data,
      opportunity: opportunityRes.data,
      recentCheckins: checkinsRes.data || [],
      businessInsights: insightsRes.data || [],
      recentSignals: signalsRes.data || [],
      recentActions: actionsRes.data || [],
      alerts: alertsRes.data || [],
      latestSnapshot: snapshotsRes.data?.[0] || null,
      missions: missionsRes.data || [],
      menuItems: menuRes.data || [],
    };
  } catch (error) {
    console.error("Error fetching context:", error);
    return null;
  }
}

function buildPrompt(context: any): string {
  const { business, brain, opportunity, recentCheckins, businessInsights, recentSignals, menuItems, latestSnapshot, missions, recentActions } = context;
  
  let prompt = `===== OPORTUNIDAD A PLANIFICAR =====
TÍTULO: "${opportunity?.title || "Oportunidad de mejora"}"
DESCRIPCIÓN: ${opportunity?.description || "Sin descripción"}
FUENTE: ${opportunity?.source || "diagnóstico"}
IMPACTO ESPERADO: ${opportunity?.impact_score || 5}/10
ESFUERZO ESTIMADO: ${opportunity?.effort_score || 5}/10
EVIDENCIA: ${JSON.stringify(opportunity?.evidence || {})}

===== DATOS DEL NEGOCIO (USA ESTOS DATOS EN CADA PASO) =====
🏪 NOMBRE: ${business?.name || "Sin nombre"}
📍 DIRECCIÓN: ${business?.address || "No especificada"}
🍽️ CATEGORÍA: ${brain?.primary_business_type || business?.category || "restaurant"}
🌍 PAÍS: ${business?.country || "AR"}
💵 MONEDA: ${business?.currency || "ARS"}
⭐ RATING: ${business?.avg_rating ? `${business.avg_rating}★` : "Sin datos"}
🎯 FOCO ACTUAL: ${brain?.current_focus || "ventas"}
📊 NIVEL DE CONTEXTO: ${brain?.mvc_completion_pct || 0}%`;

  // Menu items - SUPER important for personalization
  if (menuItems?.length > 0) {
    prompt += `\n\n===== PRODUCTOS/MENÚ (MENCIONALOS EN LOS PASOS) =====`;
    const starItems = menuItems.filter((m: any) => m.is_star_item);
    if (starItems.length > 0) {
      prompt += `\n⭐ PRODUCTOS ESTRELLA: ${starItems.map((m: any) => `${m.name} ($${m.price})`).join(", ")}`;
    }
    const categories = [...new Set(menuItems.map((m: any) => m.category).filter(Boolean))];
    prompt += `\n📋 CATEGORÍAS: ${categories.join(", ")}`;
    prompt += `\n💰 RANGO PRECIOS: $${Math.min(...menuItems.map((m: any) => m.price))} - $${Math.max(...menuItems.map((m: any) => m.price))}`;
  }

  // Brain factual memory - KEY DATA
  if (brain?.factual_memory && Object.keys(brain.factual_memory).length > 0) {
    prompt += `\n\n===== MEMORIA DEL NEGOCIO (DATOS CLAVE) =====`;
    Object.entries(brain.factual_memory).forEach(([key, value]) => {
      prompt += `\n• ${key.replace(/_/g, ' ').toUpperCase()}: ${value}`;
    });
  }

  // Business insights - DEEP KNOWLEDGE
  if (businessInsights?.length > 0) {
    prompt += `\n\n===== CONOCIMIENTO PROFUNDO =====`;
    const grouped: Record<string, any[]> = {};
    businessInsights.forEach((i: any) => {
      const cat = i.category || "general";
      if (!grouped[cat]) grouped[cat] = [];
      grouped[cat].push(i);
    });
    Object.entries(grouped).slice(0, 6).forEach(([cat, items]) => {
      prompt += `\n[${cat.toUpperCase()}]`;
      items.slice(0, 4).forEach((i: any) => {
        prompt += `\n  • ${i.question}: ${i.answer}`;
      });
    });
  }

  // Traffic patterns
  if (recentCheckins?.length > 0) {
    const avgTraffic = recentCheckins.reduce((acc: number, c: any) => acc + (c.traffic_level || 3), 0) / recentCheckins.length;
    const slotCounts: Record<string, number[]> = {};
    recentCheckins.forEach((c: any) => {
      if (c.slot) {
        if (!slotCounts[c.slot]) slotCounts[c.slot] = [];
        slotCounts[c.slot].push(c.traffic_level || 3);
      }
    });
    
    prompt += `\n\n===== PATRONES DE TRÁFICO =====`;
    prompt += `\n📈 PROMEDIO GENERAL: ${avgTraffic.toFixed(1)}/5`;
    Object.entries(slotCounts).forEach(([slot, levels]) => {
      const avg = levels.reduce((a, b) => a + b, 0) / levels.length;
      const emoji = avg >= 4 ? "🔥" : avg <= 2 ? "❄️" : "➡️";
      prompt += `\n${emoji} ${slot}: ${avg.toFixed(1)}/5 (${levels.length} registros)`;
    });
    
    const notes = recentCheckins.filter((c: any) => c.notes).map((c: any) => c.notes);
    if (notes.length > 0) {
      prompt += `\n📝 NOTAS RECIENTES: "${notes.slice(0, 2).join('", "')}"`;
    }
  }

  // Recent signals
  if (recentSignals?.length > 0) {
    prompt += `\n\n===== SEÑALES RECIENTES =====`;
    recentSignals.slice(0, 5).forEach((s: any) => {
      prompt += `\n• [${s.signal_type}] ${s.raw_text || JSON.stringify(s.content).slice(0, 80)}`;
    });
  }

  // Snapshot scores
  if (latestSnapshot) {
    prompt += `\n\n===== DIAGNÓSTICO ACTUAL =====`;
    prompt += `\n🎯 SCORE GENERAL: ${latestSnapshot.total_score || "?"}/100`;
    if (latestSnapshot.weaknesses?.length) {
      prompt += `\n⚠️ DEBILIDADES: ${latestSnapshot.weaknesses.slice(0, 3).join(", ")}`;
    }
    if (latestSnapshot.strengths?.length) {
      prompt += `\n✅ FORTALEZAS: ${latestSnapshot.strengths.slice(0, 3).join(", ")}`;
    }
  }

  // Past missions - learn from them
  if (missions?.length > 0) {
    const completed = missions.filter((m: any) => m.status === "completed");
    const abandoned = missions.filter((m: any) => m.status === "abandoned");
    if (completed.length > 0 || abandoned.length > 0) {
      prompt += `\n\n===== HISTORIAL DE MISIONES =====`;
      if (completed.length > 0) {
        prompt += `\n✅ COMPLETADAS: ${completed.map((m: any) => m.title).join(", ")}`;
      }
      if (abandoned.length > 0) {
        prompt += `\n❌ ABANDONADAS (hacer pasos más cortos): ${abandoned.map((m: any) => m.title).join(", ")}`;
      }
    }
  }

  // Past actions with outcomes
  if (recentActions?.length > 0) {
    const good = recentActions.filter((a: any) => a.outcome_rating >= 4);
    const bad = recentActions.filter((a: any) => a.outcome_rating && a.outcome_rating <= 2);
    if (good.length > 0 || bad.length > 0) {
      prompt += `\n\n===== ACCIONES PASADAS =====`;
      if (good.length > 0) {
        prompt += `\n✅ FUNCIONARON: ${good.slice(0, 2).map((a: any) => a.title).join(", ")}`;
      }
      if (bad.length > 0) {
        prompt += `\n❌ NO FUNCIONARON: ${bad.slice(0, 2).map((a: any) => a.title).join(", ")}`;
      }
    }
  }

  // Date context
  const now = new Date();
  const dayOfWeek = now.toLocaleDateString("es", { weekday: "long" });
  const month = now.toLocaleDateString("es", { month: "long" });
  prompt += `\n\n===== CONTEXTO TEMPORAL =====`;
  prompt += `\n📅 HOY: ${dayOfWeek}, ${now.getDate()} de ${month}`;

  // Final instruction
  prompt += `\n\n===== INSTRUCCIÓN FINAL =====
Generá un plan de acción ÚNICO e IMPOSIBLE de aplicar a otro negocio.
- USA el nombre "${business?.name}" en al menos 3 pasos
- Si hay productos específicos, MENCIONALOS por nombre y precio
- Si hay horarios pico/flojos, USALOS en las recomendaciones
- Cada paso debe ser TAN ESPECÍFICO que solo aplica a este negocio
- Incluí métricas NUMÉRICAS concretas (no "mejorar", sino "+X%")`;

  return prompt;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { businessId, opportunityId } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    const supabase = SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY 
      ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
      : null;

    if (!supabase || !businessId) {
      throw new Error("Missing required parameters");
    }

    console.log(`[generate-opportunity-plan] Generating for business ${businessId}, opportunity ${opportunityId}`);

    const context = await fetchOpportunityContext(supabase, businessId, opportunityId);
    
    if (!context?.business) {
      throw new Error("Business not found");
    }

    const userPrompt = buildPrompt(context);
    console.log(`[generate-opportunity-plan] Context built, ${userPrompt.length} chars`);

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
          { role: "user", content: userPrompt }
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[generate-opportunity-plan] AI error: ${response.status}`, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const aiData = await response.json();
    const rawContent = aiData.choices?.[0]?.message?.content || "";
    
    // Parse JSON from response
    let plan;
    try {
      const jsonMatch = rawContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        plan = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON found");
      }
    } catch (parseError) {
      console.error("[generate-opportunity-plan] Parse error:", parseError);
      // Generate fallback plan
      plan = {
        planSummary: `Plan personalizado para ${context.business.name}`,
        estimatedTotalTime: "2-4 horas",
        expectedResult: "Mejora medible en el área objetivo",
        confidence: "medium",
        confidenceReason: "Basado en datos limitados disponibles",
        steps: [
          {
            stepNumber: 1,
            title: "Analizar situación actual",
            description: `Revisar el estado actual en ${context.business.name}`,
            timeEstimate: "30 min",
            howTo: ["Revisar datos disponibles", "Identificar puntos críticos"],
            why: "Entender el punto de partida",
            metric: "Claridad del problema",
            resources: ["Acceso a datos del negocio"],
            tips: ["Tomá nota de lo que encontrés"],
            confidence: "medium",
            warnings: []
          }
        ],
        quickWins: ["Hacer una revisión rápida del área"],
        risks: ["Datos limitados pueden afectar precisión"],
        dependencies: ["Tiempo disponible para implementar"],
        successChecklist: ["Mejora medible lograda"],
        dataGapsIdentified: ["Más datos del negocio ayudarían a personalizar mejor"]
      };
    }

    console.log(`[generate-opportunity-plan] Generated plan with ${plan.steps?.length || 0} steps`);

    return new Response(JSON.stringify({ plan, success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("[generate-opportunity-plan] Error:", error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : "Unknown error",
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
