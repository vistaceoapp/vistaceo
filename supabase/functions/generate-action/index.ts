import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Blocked generic phrases
const BLOCKED_PHRASES = [
  "mejora tu negocio",
  "aumenta tus ventas",
  "optimiza tu operación",
  "sé más eficiente",
  "atrae más clientes",
];

const SYSTEM_PROMPT = `Eres un experto en negocios gastronómicos. Tu tarea es generar UNA acción concreta y específica que el dueño de un negocio pueda hacer HOY para mejorar su situación.

REGLAS ANTI-GENÉRICO (CRÍTICAS):
1. PROHIBIDO usar frases como: "mejora tu negocio", "aumenta tus ventas", "optimiza tu operación"
2. La acción DEBE usar datos específicos del negocio (productos, horarios, métricas)
3. Si hay un producto estrella, mencionalo por nombre
4. Si hay un horario pico o flojo, inclúyelo
5. Si no tenés datos suficientes, sé honesto: "Basado en lo que sé..."

REGLAS DE ACCIÓN:
1. La acción debe ser realizable en menos de 30 minutos
2. Debe ser específica, no genérica (ej: "Revisa los tiempos de espera del mediodía" NO "Mejora la operación")
3. Debe estar adaptada al tipo de negocio y contexto
4. Incluye el POR QUÉ de la acción conectado con datos reales
5. Si hay señales recientes (check-ins, outcomes), úsalas para personalizar

RESPONDE SOLO EN FORMATO JSON:
{
  "title": "Título conciso y específico de la acción (máx 60 caracteres)",
  "description": "Descripción que mencione datos concretos del negocio (máx 200 caracteres)",
  "priority": "low|medium|high",
  "category": "marketing|operaciones|finanzas|servicio|equipo",
  "confidence": "high|medium|low",
  "basedOn": ["Dato o señal específica que justifica esta acción"],
  "signals": [
    { "type": "insight", "message": "Razón específica basada en datos" }
  ],
  "checklist": [
    { "text": "Paso 1 concreto y específico", "done": false },
    { "text": "Paso 2 concreto y específico", "done": false }
  ]
}`;

// Fetch context for action generation including brain
async function fetchActionContext(supabase: any, businessId: string) {
  try {
    const today = new Date().toISOString().split("T")[0];
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const weekAgoStr = weekAgo.toISOString();

    const [checkinsRes, actionsRes, missionsRes, insightsRes, brainRes, signalsRes] = await Promise.all([
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
      // Business brain
      supabase
        .from("business_brains")
        .select("*")
        .eq("business_id", businessId)
        .maybeSingle(),
      // Recent signals
      supabase
        .from("signals")
        .select("signal_type, content, raw_text")
        .eq("business_id", businessId)
        .order("created_at", { ascending: false })
        .limit(5),
    ]);

    return {
      recentCheckins: checkinsRes.data || [],
      recentActions: actionsRes.data || [],
      activeMissions: missionsRes.data || [],
      businessInsights: insightsRes.data || [],
      brain: brainRes.data,
      recentSignals: signalsRes.data || [],
    };
  } catch (error) {
    console.error("Error fetching action context:", error);
    return null;
  }
}

function buildContextPrompt(business: any, context: any): string {
  const brain = context?.brain;
  
  let prompt = `NEGOCIO: ${business.name || "Sin nombre"}
TIPO: ${brain?.primary_business_type || business.category || "restaurant"}
FOCO ACTUAL: ${brain?.current_focus || "ventas"}
PAÍS: ${business.country || "AR"}
NIVEL DE CONTEXTO: ${brain?.mvc_completion_pct || 0}%`;

  if (business.avg_rating) {
    prompt += `\nRATING: ${business.avg_rating}★`;
  }
  if (business.avg_ticket) {
    prompt += `\nTICKET PROMEDIO: $${business.avg_ticket}`;
  }

  // Brain factual memory
  if (brain?.factual_memory && Object.keys(brain.factual_memory).length > 0) {
    prompt += "\n\nMEMORIA FACTUAL (USALA!):";
    Object.entries(brain.factual_memory).forEach(([key, value]) => {
      prompt += `\n- ${key.replace(/_/g, ' ')}: ${value}`;
    });
  }

  if (context) {
    // Add business insights from micro-questions
    if (context.businessInsights?.length > 0) {
      prompt += "\n\nCONOCIMIENTO DEL NEGOCIO (USALO!):";
      context.businessInsights.forEach((insight: any) => {
        prompt += `\n- ${insight.question}: ${insight.answer}`;
      });
    }

    // Recent signals
    if (context.recentSignals?.length > 0) {
      prompt += "\n\nSEÑALES RECIENTES:";
      context.recentSignals.forEach((signal: any) => {
        prompt += `\n- [${signal.signal_type}] ${signal.raw_text || JSON.stringify(signal.content).slice(0, 80)}`;
      });
    }

    if (context.recentCheckins?.length > 0) {
      const avgTraffic = context.recentCheckins.reduce((acc: number, c: any) => acc + (c.traffic_level || 3), 0) / context.recentCheckins.length;
      const lowTrafficSlots = context.recentCheckins.filter((c: any) => c.traffic_level <= 2).map((c: any) => c.slot);
      const highTrafficSlots = context.recentCheckins.filter((c: any) => c.traffic_level >= 4).map((c: any) => c.slot);
      prompt += `\n\nTRÁFICO RECIENTE: Promedio ${avgTraffic.toFixed(1)}/5`;
      if (lowTrafficSlots.length > 0) {
        prompt += ` | Turnos flojos: ${[...new Set(lowTrafficSlots)].join(", ")}`;
      }
      if (highTrafficSlots.length > 0) {
        prompt += ` | Turnos fuertes: ${[...new Set(highTrafficSlots)].join(", ")}`;
      }
    }

    if (context.recentActions?.length > 0) {
      const goodOutcomes = context.recentActions.filter((a: any) => a.outcome_rating >= 4);
      const badOutcomes = context.recentActions.filter((a: any) => a.outcome_rating <= 2);
      
      if (goodOutcomes.length > 0) {
        prompt += `\n\nACCIONES QUE FUNCIONARON: ${goodOutcomes.map((a: any) => `${a.title} (${a.category})`).join(", ")}`;
      }
      if (badOutcomes.length > 0) {
        prompt += `\nACCIONES QUE NO FUNCIONARON: ${badOutcomes.map((a: any) => `${a.title}`).join(", ")}`;
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

  // Low context warning
  const mvcCompletion = brain?.mvc_completion_pct || 0;
  if (mvcCompletion < 60) {
    prompt += `\n\n⚠️ NIVEL DE CONTEXTO BAJO: Sé honesto sobre la confianza de tu recomendación.`;
  }

  return prompt;
}

function checkForGenericPhrases(action: any): string[] {
  const foundPhrases: string[] = [];
  const textToCheck = JSON.stringify(action).toLowerCase();
  
  for (const phrase of BLOCKED_PHRASES) {
    if (textToCheck.includes(phrase.toLowerCase())) {
      foundPhrases.push(phrase);
    }
  }
  
  return foundPhrases;
}

async function saveActionTrace(supabase: any, businessId: string, action: any, context: any, passed: boolean) {
  try {
    const brain = context?.brain;
    
    await supabase.from('recommendation_traces').insert({
      business_id: businessId,
      brain_id: brain?.id,
      output_type: 'action',
      output_content: action,
      based_on: action.basedOn?.map((b: string) => ({ type: 'ai_identified', summary: b })) || [],
      confidence: action.confidence || 'medium',
      why_summary: `Acción diaria: ${action.title}`,
      passed_quality_gate: passed,
      quality_gate_score: passed ? 80 : 40,
      generic_phrases_detected: action._genericPhrases || [],
      is_blocked: !passed,
      variables_used: {
        business_type: brain?.primary_business_type,
        focus: brain?.current_focus,
        mvc_completion: brain?.mvc_completion_pct
      }
    });
  } catch (error) {
    console.error('Error saving action trace:', error);
  }
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

    const supabase = SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY 
      ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
      : null;

    // Fetch context
    let context = null;
    if (businessId && supabase) {
      context = await fetchActionContext(supabase, businessId);
    }

    // Build context prompt
    const contextPrompt = buildContextPrompt(business || {}, context);

    console.log("Generating action with context, MVC:", context?.brain?.mvc_completion_pct || 0);

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
        confidence: "low",
        basedOn: ["Acción genérica por falta de datos"],
        signals: [{ type: "insight", message: "Observar tu operación revela oportunidades de mejora" }],
        checklist: [
          { text: "Cronometrar 3 pedidos de inicio a entrega", done: false },
          { text: "Anotar cualquier cuello de botella", done: false },
        ],
      };
    }

    // Quality Gate check
    const genericPhrases = checkForGenericPhrases(actionData);
    const passed = genericPhrases.length === 0;
    
    if (!passed) {
      console.warn("Quality Gate: Generic phrases in action:", genericPhrases);
      actionData._genericPhrases = genericPhrases;
    }

    // Save trace
    if (supabase && businessId) {
      await saveActionTrace(supabase, businessId, actionData, context, passed);
    }

    console.log("Generated action:", actionData.title, "QG passed:", passed);

    return new Response(
      JSON.stringify({ 
        action: actionData,
        qualityGate: {
          passed,
          genericPhrasesFound: genericPhrases,
          mvcCompletion: context?.brain?.mvc_completion_pct || 0
        }
      }),
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
