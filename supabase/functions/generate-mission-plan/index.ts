import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `Eres un consultor experto en negocios gastronómicos con 20 años de experiencia. Tu tarea es generar un PLAN DE ACCIÓN DETALLADO y 100% PERSONALIZADO para una misión específica de mejora.

REGLAS ESTRICTAS:
1. El plan debe ser ÚNICO para este negocio específico - usa TODOS los datos disponibles
2. Cada paso debe ser ACCIONABLE con tiempo estimado, métricas y recursos necesarios
3. Incluye tips específicos basados en el tipo de negocio, país y contexto
4. Explica el POR QUÉ detrás de cada paso
5. Indica la confianza de cada recomendación (alta/media/baja) según los datos disponibles
6. Personaliza TODO según la categoría del negocio (cafetería, bar, restaurante, etc.)
7. Considera el país y cultura local para las recomendaciones
8. Si hay historial de acciones previas, aprende de lo que funcionó y lo que no

RESPONDE SOLO EN FORMATO JSON:
{
  "planTitle": "Título del plan personalizado para [nombre del negocio]",
  "planDescription": "Descripción corta del enfoque elegido (máx 150 chars)",
  "estimatedDuration": "X días/semanas",
  "estimatedImpact": "Descripción del resultado esperado específico",
  "steps": [
    {
      "text": "Paso concreto y específico para ESTE negocio",
      "done": false,
      "howTo": [
        "Sub-paso detallado 1",
        "Sub-paso detallado 2",
        "Sub-paso detallado 3"
      ],
      "why": "Explicación personalizada de por qué esto es relevante para este negocio",
      "timeEstimate": "X minutos/horas",
      "metric": "Cómo medir el éxito de este paso",
      "confidence": "high|medium|low",
      "resources": ["Recurso o herramienta necesaria"],
      "tips": ["Tip específico para este tipo de negocio"]
    }
  ],
  "businessSpecificTips": [
    "Tip personalizado basado en los datos del negocio",
    "Otro tip relevante para su situación"
  ],
  "potentialChallenges": [
    "Desafío que podría enfrentar según su contexto"
  ],
  "successMetrics": [
    "Métrica de éxito a trackear"
  ]
}`;

async function fetchBusinessContext(supabase: any, businessId: string) {
  try {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 30);
    const weekAgoStr = weekAgo.toISOString();

    const [
      businessRes,
      checkinsRes, 
      actionsRes, 
      missionsRes, 
      insightsRes,
      alertsRes,
      integrationsRes,
      snapshotsRes
    ] = await Promise.all([
      // Business details
      supabase
        .from("businesses")
        .select("*")
        .eq("id", businessId)
        .single(),
      // Recent checkins for traffic patterns
      supabase
        .from("checkins")
        .select("*")
        .eq("business_id", businessId)
        .gte("created_at", weekAgoStr)
        .order("created_at", { ascending: false })
        .limit(20),
      // Recent completed actions with outcomes
      supabase
        .from("daily_actions")
        .select("*")
        .eq("business_id", businessId)
        .order("completed_at", { ascending: false })
        .limit(10),
      // All missions (to learn what worked)
      supabase
        .from("missions")
        .select("*")
        .eq("business_id", businessId)
        .limit(15),
      // Business insights from conversations
      supabase
        .from("business_insights")
        .select("*")
        .eq("business_id", businessId)
        .order("created_at", { ascending: false })
        .limit(30),
      // Recent alerts
      supabase
        .from("alerts")
        .select("*")
        .eq("business_id", businessId)
        .order("created_at", { ascending: false })
        .limit(10),
      // Connected integrations
      supabase
        .from("business_integrations")
        .select("*")
        .eq("business_id", businessId)
        .eq("status", "connected"),
      // Latest snapshot
      supabase
        .from("snapshots")
        .select("*")
        .eq("business_id", businessId)
        .order("created_at", { ascending: false })
        .limit(1),
    ]);

    return {
      business: businessRes.data,
      recentCheckins: checkinsRes.data || [],
      recentActions: actionsRes.data || [],
      allMissions: missionsRes.data || [],
      businessInsights: insightsRes.data || [],
      alerts: alertsRes.data || [],
      integrations: integrationsRes.data || [],
      latestSnapshot: snapshotsRes.data?.[0] || null,
    };
  } catch (error) {
    console.error("Error fetching business context:", error);
    return null;
  }
}

function buildContextPrompt(
  missionTitle: string,
  missionDescription: string | null,
  missionArea: string | null,
  context: any,
  regenerate: boolean
): string {
  const business = context?.business || {};
  
  let prompt = `MISIÓN A PLANIFICAR: "${missionTitle}"
${missionDescription ? `DESCRIPCIÓN: ${missionDescription}` : ""}
ÁREA: ${missionArea || "General"}

===== DATOS DEL NEGOCIO =====
NOMBRE: ${business.name || "Sin nombre"}
TIPO: ${business.category || "restaurant"}
PAÍS: ${business.country || "AR"}
CIUDAD/ZONA: ${business.address || "No especificado"}
RATING GOOGLE: ${business.avg_rating ? `${business.avg_rating}★` : "Sin datos"}
TICKET PROMEDIO: ${business.avg_ticket ? `$${business.avg_ticket}` : "Sin datos"}`;

  if (context) {
    // Business insights - very important for personalization
    if (context.businessInsights?.length > 0) {
      prompt += "\n\n===== CONOCIMIENTO PROFUNDO DEL NEGOCIO =====";
      const groupedInsights: Record<string, any[]> = {};
      context.businessInsights.forEach((insight: any) => {
        const cat = insight.category || "general";
        if (!groupedInsights[cat]) groupedInsights[cat] = [];
        groupedInsights[cat].push(insight);
      });
      
      Object.entries(groupedInsights).forEach(([category, insights]) => {
        prompt += `\n[${category.toUpperCase()}]`;
        insights.slice(0, 5).forEach((insight: any) => {
          prompt += `\n• ${insight.question}: ${insight.answer}`;
        });
      });
    }

    // Traffic patterns
    if (context.recentCheckins?.length > 0) {
      prompt += "\n\n===== PATRONES DE TRÁFICO (últimos 30 días) =====";
      const avgTraffic = context.recentCheckins.reduce((acc: number, c: any) => 
        acc + (c.traffic_level || 3), 0) / context.recentCheckins.length;
      const lowTrafficSlots = context.recentCheckins
        .filter((c: any) => c.traffic_level <= 2)
        .map((c: any) => c.slot);
      const highTrafficSlots = context.recentCheckins
        .filter((c: any) => c.traffic_level >= 4)
        .map((c: any) => c.slot);
        
      prompt += `\nTráfico promedio: ${avgTraffic.toFixed(1)}/5`;
      if (lowTrafficSlots.length > 0) {
        prompt += `\nTurnos flojos: ${[...new Set(lowTrafficSlots)].join(", ")}`;
      }
      if (highTrafficSlots.length > 0) {
        prompt += `\nTurnos fuertes: ${[...new Set(highTrafficSlots)].join(", ")}`;
      }
      
      // Notes from checkins
      const checkinNotes = context.recentCheckins
        .filter((c: any) => c.notes)
        .map((c: any) => c.notes);
      if (checkinNotes.length > 0) {
        prompt += `\nObservaciones recientes: ${checkinNotes.slice(0, 3).join("; ")}`;
      }
    }

    // Learn from past actions
    if (context.recentActions?.length > 0) {
      prompt += "\n\n===== HISTORIAL DE ACCIONES =====";
      const goodOutcomes = context.recentActions.filter((a: any) => a.outcome_rating >= 4);
      const badOutcomes = context.recentActions.filter((a: any) => a.outcome_rating <= 2);
      
      if (goodOutcomes.length > 0) {
        prompt += "\nÉXITOS ANTERIORES:";
        goodOutcomes.slice(0, 3).forEach((a: any) => {
          prompt += `\n• ${a.title} (${a.category}): ${a.outcome || "Funcionó bien"}`;
        });
      }
      if (badOutcomes.length > 0) {
        prompt += "\nNO FUNCIONARON:";
        badOutcomes.slice(0, 3).forEach((a: any) => {
          prompt += `\n• ${a.title}: ${a.outcome || "No dio resultados"}`;
        });
      }
    }

    // Past missions - learn patterns
    if (context.allMissions?.length > 0) {
      const completedMissions = context.allMissions.filter((m: any) => m.status === "completed");
      const abandonedMissions = context.allMissions.filter((m: any) => m.status === "abandoned");
      
      if (completedMissions.length > 0 || abandonedMissions.length > 0) {
        prompt += "\n\n===== EXPERIENCIA CON MISIONES =====";
        if (completedMissions.length > 0) {
          prompt += `\nCompletadas exitosamente: ${completedMissions.map((m: any) => m.title).join(", ")}`;
        }
        if (abandonedMissions.length > 0) {
          prompt += `\nAbandonadas: ${abandonedMissions.map((m: any) => m.title).join(", ")} (considera hacer pasos más pequeños)`;
        }
      }
    }

    // Recent alerts
    if (context.alerts?.length > 0) {
      prompt += "\n\n===== ALERTAS RECIENTES =====";
      context.alerts.slice(0, 5).forEach((alert: any) => {
        prompt += `\n• [${alert.category}] ${alert.text_content || "Alerta sin detalle"}`;
      });
    }

    // Connected integrations
    if (context.integrations?.length > 0) {
      prompt += `\n\n===== INTEGRACIONES CONECTADAS =====`;
      context.integrations.forEach((int: any) => {
        prompt += `\n• ${int.integration_type}`;
      });
    }

    // Latest snapshot scores
    if (context.latestSnapshot) {
      const snapshot = context.latestSnapshot;
      if (snapshot.dimensions_json) {
        prompt += "\n\n===== DIAGNÓSTICO ACTUAL =====";
        prompt += `\nPuntaje general: ${snapshot.total_score || "?"}/100`;
        if (snapshot.weaknesses) {
          prompt += `\nÁreas débiles: ${Array.isArray(snapshot.weaknesses) ? snapshot.weaknesses.join(", ") : "No especificado"}`;
        }
        if (snapshot.strengths) {
          prompt += `\nFortalezas: ${Array.isArray(snapshot.strengths) ? snapshot.strengths.join(", ") : "No especificado"}`;
        }
      }
    }
  }

  // Context for today
  const dayOfWeek = new Date().toLocaleDateString("es", { weekday: "long" });
  const month = new Date().toLocaleDateString("es", { month: "long" });
  prompt += `\n\n===== CONTEXTO TEMPORAL =====
HOY: ${dayOfWeek}
MES: ${month}`;

  if (regenerate) {
    prompt += `\n\n⚠️ IMPORTANTE: El usuario pidió un PLAN ALTERNATIVO. Genera un enfoque DIFERENTE al anterior - puede ser más rápido, más gradual, con otras tácticas, o diferente secuencia.`;
  }

  prompt += `\n\n===== INSTRUCCIÓN FINAL =====
Genera un plan de acción ÚNICO y ALTAMENTE PERSONALIZADO para "${missionTitle}" considerando TODOS los datos anteriores.
El plan debe sentirse como si un consultor experto hubiera pasado horas estudiando este negocio específico.`;

  return prompt;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      businessId, 
      missionTitle, 
      missionDescription, 
      missionArea,
      regenerate = false 
    } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Fetch comprehensive context
    let context = null;
    if (businessId && SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
      const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
      context = await fetchBusinessContext(supabase, businessId);
    }

    // Build context prompt
    const contextPrompt = buildContextPrompt(
      missionTitle,
      missionDescription,
      missionArea,
      context,
      regenerate
    );

    console.log("Generating mission plan for:", missionTitle);
    console.log("Context length:", contextPrompt.length, "chars");

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
        temperature: regenerate ? 0.9 : 0.7, // More creative for regeneration
        max_tokens: 2048,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Límite de solicitudes excedido. Intenta en unos minutos." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Créditos agotados. Contacta al soporte." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
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
    let planData;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        planData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON found in response");
      }
    } catch (parseError) {
      console.error("Error parsing AI response:", parseError);
      // Return fallback plan
      planData = {
        planTitle: `Plan para ${missionTitle}`,
        planDescription: "Plan generado automáticamente",
        estimatedDuration: "1-2 semanas",
        estimatedImpact: "Mejora en el área objetivo",
        steps: [
          {
            text: "Analizar la situación actual",
            done: false,
            howTo: ["Revisar datos disponibles", "Identificar puntos de mejora"],
            why: "Es importante entender el punto de partida",
            timeEstimate: "30 minutos",
            metric: "Diagnóstico completado",
            confidence: "medium",
          },
          {
            text: "Definir acciones concretas",
            done: false,
            howTo: ["Priorizar por impacto", "Asignar responsables"],
            why: "La planificación es clave para el éxito",
            timeEstimate: "45 minutos",
            metric: "Plan definido",
            confidence: "medium",
          },
          {
            text: "Implementar y medir",
            done: false,
            howTo: ["Ejecutar las acciones", "Medir resultados semanalmente"],
            why: "La ejecución consistente genera resultados",
            timeEstimate: "Continuo",
            metric: "KPIs mejorados",
            confidence: "medium",
          },
        ],
        businessSpecificTips: ["Adapta el plan a tu realidad diaria"],
        potentialChallenges: ["Falta de tiempo es común, prioriza lo esencial"],
        successMetrics: ["Progreso semanal visible"],
      };
    }

    console.log("Generated plan with", planData.steps?.length || 0, "steps");

    return new Response(
      JSON.stringify({ plan: planData }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("generate-mission-plan error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Error desconocido" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
