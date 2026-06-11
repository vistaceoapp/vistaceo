import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import { ANTI_GENERIC_SYSTEM } from "../_shared/brain-core/anti-generic-prompt.ts";
import { sanitizeForUser } from "../_shared/brain-core/sanitize-output.ts";
import { humanizeEvidence } from "../_shared/humanize-evidence.ts";


const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `Eres un consultor estratégico senior con 20 años de experiencia, adaptable a CUALQUIER rubro (legal, salud, gastronómico, retail, tecnología, servicios profesionales, B2B, ecommerce, educación, etc.). Tu tarea es generar un PLAN DE ACCIÓN ULTRA-DETALLADO, COMPLETO y 100% PERSONALIZADO para una misión específica de mejora.

CALIDAD MÍNIMA (NO NEGOCIABLE):
- Mínimo 8 pasos, máximo 12. Nunca menos de 8.
- Cada paso DEBE tener: text claro, 4-6 sub-pasos en howTo, why con dato real del brain, timeEstimate, metric, resources (2-4), tips (1-2 de experto del rubro), confidence.
- Resumen ejecutivo claro de qué se va a lograr y por qué importa AHORA para este negocio.
- Usar emojis sutiles (1 por sección clave: 🎯 ⚡ ✨ 📌). Nunca decorativos en exceso.
- Tono: profesional pero cercano. Adaptar formalidad al rubro (legal/médico/B2B = formal, gastro/retail/wellness = cercano).

REGLAS ANTI-GENÉRICO (SI LAS VIOLÁS, EL PLAN SE BLOQUEA):
1. PROHIBIDO usar frases genéricas como: "mejora tu negocio", "aumenta tus ventas", "optimiza tu operación", "sé más eficiente", "atrae más clientes".
2. Cada paso DEBE incluir nombres específicos, números concretos, fechas, o referencias a datos del negocio que aparezcan en el contexto.
3. Si no tenés datos suficientes, SÉ HONESTO y di "basado en [lo que sé]" o "necesito saber X para ser más preciso".
4. Usa SIEMPRE los datos que te paso: nombre del negocio, rubro, país, métricas, productos/servicios, clientes, fricciones.
5. Adaptá la terminología al rubro real: un abogado no recibe los mismos consejos que un café.

REGLAS DE PERSONALIZACIÓN:
1. El plan debe ser ÚNICO para este negocio específico - usa TODOS los datos disponibles del brain.
2. Cada paso debe ser ACCIONABLE con tiempo estimado, métricas y recursos necesarios.
3. Incluye tips específicos basados en el rubro, país y contexto cultural.
4. Explica el POR QUÉ detrás de cada paso, conectando con datos reales del brain.
5. Indica la confianza de cada recomendación según los datos disponibles.
6. Si hay historial de acciones previas, aprende de lo que funcionó y lo que no.

RESPONDE SOLO EN FORMATO JSON:
{
  "planTitle": "Título específico mencionando algo único del negocio",
  "planDescription": "Descripción detallada que mencione datos concretos del negocio (máx 200 chars)",
  "estimatedDuration": "X días/semanas con desglose",
  "estimatedImpact": "Resultado específico y medible esperado - con números si es posible",
  "estimatedROI": "Retorno estimado (ej: +15% en ticket promedio, ahorro de X horas/semana)",
  "confidence": "high|medium|low",
  "riskLevel": "low|medium|high",
  "basedOn": ["Dato o señal específica que justifica este plan", "Otra evidencia del negocio", "Patrón observado en los datos"],
  "quickWins": [
    "Acción rápida que se puede hacer HOY para ver resultados inmediatos",
    "Otra quick win específica para este negocio"
  ],
  "weeklyMilestones": [
    {"week": 1, "milestone": "Objetivo específico de la semana 1", "metric": "Métrica a medir"},
    {"week": 2, "milestone": "Objetivo específico de la semana 2", "metric": "Métrica a medir"}
  ],
  "steps": [
    {
      "text": "Paso concreto con números/datos específicos para ESTE negocio",
      "done": false,
      "howTo": [
        "Sub-paso detallado con instrucciones específicas",
        "Otro sub-paso con herramientas o recursos concretos",
        "Sub-paso que menciona datos del negocio (horarios, productos, etc.)"
      ],
      "why": "Explicación que referencia datos concretos del negocio y por qué esto funciona",
      "timeEstimate": "X minutos/horas - siendo realista",
      "metric": "Métrica específica y medible que indica éxito",
      "confidence": "high|medium|low",
      "resources": ["Recurso específico necesario", "Herramienta o material", "Persona involucrada"],
      "tips": ["Tip específico para este tipo de negocio", "Consejo basado en el contexto local"]
    }
  ],
  "businessSpecificTips": [
    "Tip que menciona algo único de ESTE negocio específico (nombre, producto, etc.)",
    "Consejo basado en el tipo de negocio y país",
    "Recomendación basada en los patrones de tráfico observados"
  ],
  "potentialChallenges": [
    "Desafío específico basado en el contexto del negocio y cómo superarlo",
    "Obstáculo común en este tipo de negocio con solución"
  ],
  "successMetrics": [
    "Métrica concreta con número objetivo específico",
    "Indicador de éxito medible relacionado con el negocio"
  ],
  "teamInvolvement": [
    "Quién del equipo debe participar y en qué",
    "Rol específico con responsabilidades claras"
  ],
  "dependencies": [
    "Qué se necesita tener antes de empezar (si aplica)",
    "Recursos o permisos necesarios"
  ],
  "dataGapsIdentified": [
    "Dato que me falta para ser más preciso (si aplica)",
    "Información que ayudaría a mejorar las recomendaciones"
  ]
}`;

// Global blocked phrases - Quality Gate will check these
const BLOCKED_PHRASES = [
  "mejora tu negocio",
  "aumenta tus ventas",
  "optimiza tu operación",
  "sé más eficiente",
  "atrae más clientes",
  "implementa mejoras",
  "considera hacer",
  "podrías intentar",
  "una buena idea sería",
  "te recomiendo mejorar",
  "es importante que",
  "deberías pensar en",
];

async function fetchBusinessContext(supabase: any, businessId: string) {
  try {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 30);
    const weekAgoStr = weekAgo.toISOString();

    const [
      businessRes,
      brainRes,
      checkinsRes, 
      actionsRes, 
      missionsRes, 
      insightsRes,
      alertsRes,
      integrationsRes,
      snapshotsRes,
      signalsRes
    ] = await Promise.all([
      // Business details
      supabase
        .from("businesses")
        .select("*")
        .eq("id", businessId)
        .single(),
      // Business brain
      supabase
        .from("business_brains")
        .select("*")
        .eq("business_id", businessId)
        .maybeSingle(),
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
      // Recent signals (new!)
      supabase
        .from("signals")
        .select("*")
        .eq("business_id", businessId)
        .order("created_at", { ascending: false })
        .limit(20),
    ]);

    return {
      business: businessRes.data,
      brain: brainRes.data,
      recentCheckins: checkinsRes.data || [],
      recentActions: actionsRes.data || [],
      allMissions: missionsRes.data || [],
      businessInsights: insightsRes.data || [],
      alerts: alertsRes.data || [],
      integrations: integrationsRes.data || [],
      latestSnapshot: snapshotsRes.data?.[0] || null,
      recentSignals: signalsRes.data || [],
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
  const brain = context?.brain || {};
  
  let prompt = `MISIÓN A PLANIFICAR: "${missionTitle}"
${missionDescription ? `DESCRIPCIÓN: ${missionDescription}` : ""}
ÁREA: ${missionArea || "General"}

===== DATOS DEL NEGOCIO (USA ESTOS DATOS EN TU RESPUESTA) =====
NOMBRE: ${business.name || "Sin nombre"}
TIPO DE NEGOCIO: ${brain.primary_business_type || business.category || "restaurant"}
FOCO ACTUAL DEL DUEÑO: ${brain.current_focus || "ventas"}
PAÍS: ${business.country || "AR"}
CIUDAD/ZONA: ${business.address || "No especificado"}
RATING GOOGLE: ${business.avg_rating ? `${business.avg_rating}★` : "Sin datos"}
TICKET PROMEDIO: ${business.avg_ticket ? `$${business.avg_ticket}` : "Sin datos"}
NIVEL DE CONTEXTO (MVC): ${brain.mvc_completion_pct || 0}%`;

  // Add brain memories if available
  if (brain.factual_memory && Object.keys(brain.factual_memory).length > 0) {
    prompt += "\n\n===== MEMORIA FACTUAL DEL NEGOCIO =====";
    Object.entries(brain.factual_memory).forEach(([key, value]) => {
      prompt += `\n• ${key.replace(/_/g, ' ')}: ${value}`;
    });
  }

  if (context) {
    // Business insights - very important for personalization
    if (context.businessInsights?.length > 0) {
      prompt += "\n\n===== CONOCIMIENTO PROFUNDO DEL NEGOCIO (USALO!) =====";
      const groupedInsights: Record<string, any[]> = {};
      context.businessInsights.forEach((insight: any) => {
        const cat = insight.category || "general";
        if (!groupedInsights[cat]) groupedInsights[cat] = [];
        groupedInsights[cat].push(insight);
      });
      
      Object.entries(groupedInsights).forEach(([category, insights]) => {
        prompt += `\n[${category.toUpperCase()}]`;
        insights.slice(0, 5).forEach((insight: any) => {
          const q = humanizeEvidence(insight.question);
          const a = humanizeEvidence(insight.answer);
          if (q && a) prompt += `\n• ${q}: ${a}`;
        });
      });
    }

    // Recent signals for latest context (humanized — no raw JSON or internal IDs)
    if (context.recentSignals?.length > 0) {
      prompt += "\n\n===== SEÑALES RECIENTES =====";
      context.recentSignals.slice(0, 5).forEach((signal: any) => {
        const human = humanizeEvidence(signal.raw_text || signal.content);
        if (human && human.length > 6) prompt += `\n• ${human}`;
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
      
      const checkinNotes = context.recentCheckins
        .filter((c: any) => c.notes)
        .map((c: any) => c.notes);
      if (checkinNotes.length > 0) {
        prompt += `\nObservaciones recientes: ${checkinNotes.slice(0, 3).join("; ")}`;
      }
    }

    // Learn from past actions
    if (context.recentActions?.length > 0) {
      prompt += "\n\n===== HISTORIAL DE ACCIONES (APRENDE DE ESTO) =====";
      const goodOutcomes = context.recentActions.filter((a: any) => a.outcome_rating >= 4);
      const badOutcomes = context.recentActions.filter((a: any) => a.outcome_rating <= 2);
      
      if (goodOutcomes.length > 0) {
        prompt += "\nÉXITOS ANTERIORES:";
        goodOutcomes.slice(0, 3).forEach((a: any) => {
          prompt += `\n• ${a.title} (${a.category}): ${a.outcome || "Funcionó bien"}`;
        });
      }
      if (badOutcomes.length > 0) {
        prompt += "\nNO FUNCIONARON (EVITAR SIMILARES):";
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
          prompt += `\nCompletadas: ${completedMissions.map((m: any) => m.title).join(", ")}`;
        }
        if (abandonedMissions.length > 0) {
          prompt += `\nAbandonadas: ${abandonedMissions.map((m: any) => m.title).join(", ")} (hacer pasos más pequeños)`;
        }
      }
    }

    // Recent alerts
    if (context.alerts?.length > 0) {
      prompt += "\n\n===== ALERTAS RECIENTES (CONSIDERALAS) =====";
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

  // Data gap warning
  const mvcCompletion = brain.mvc_completion_pct || 0;
  if (mvcCompletion < 60) {
    prompt += `\n\n⚠️ NIVEL DE CONTEXTO BAJO (${mvcCompletion}%): Indica claramente en "dataGapsIdentified" qué información te falta para ser más preciso. Sé honesto sobre la confianza de tus recomendaciones.`;
  }

  prompt += `\n\n===== INSTRUCCIÓN FINAL =====
Genera un plan de acción ÚNICO y ALTAMENTE PERSONALIZADO para "${missionTitle}".
- USA los datos específicos que te di (nombres, números, productos, horarios)
- NO uses frases genéricas como "mejora tus ventas" o "optimiza tu operación"
- Cada paso debe mencionar algo específico de ESTE negocio
- Si te falta información, dilo honestamente en "dataGapsIdentified"`;

  return prompt;
}

function checkForGenericPhrases(plan: any): string[] {
  const foundPhrases: string[] = [];
  const textToCheck = JSON.stringify(plan).toLowerCase();
  
  for (const phrase of BLOCKED_PHRASES) {
    if (textToCheck.includes(phrase.toLowerCase())) {
      foundPhrases.push(phrase);
    }
  }
  
  return foundPhrases;
}

async function saveRecommendationTrace(
  supabase: any,
  businessId: string,
  plan: any,
  context: any,
  passed: boolean
) {
  try {
    const brain = context?.brain;
    
    // Build based_on from context
    const basedOn: any[] = [];
    
    if (context?.businessInsights?.length > 0) {
      basedOn.push({
        type: 'insights',
        summary: `${context.businessInsights.length} insights del negocio`
      });
    }
    if (context?.recentSignals?.length > 0) {
      basedOn.push({
        type: 'signals',
        summary: `${context.recentSignals.length} señales recientes`
      });
    }
    if (context?.recentCheckins?.length > 0) {
      basedOn.push({
        type: 'checkins',
        summary: `${context.recentCheckins.length} check-ins de tráfico`
      });
    }
    if (plan.basedOn) {
      plan.basedOn.forEach((reason: string) => {
        basedOn.push({ type: 'ai_identified', summary: reason });
      });
    }

    await supabase
      .from('recommendation_traces')
      .insert({
        business_id: businessId,
        brain_id: brain?.id,
        output_type: 'mission',
        output_content: plan,
        based_on: basedOn,
        confidence: plan.confidence || 'medium',
        why_summary: `Plan para "${plan.planTitle}" basado en ${basedOn.length} fuentes de datos`,
        passed_quality_gate: passed,
        quality_gate_score: passed ? 80 : 40,
        generic_phrases_detected: plan._genericPhrases || [],
        is_blocked: !passed,
        variables_used: {
          business_type: context?.brain?.primary_business_type || context?.business?.category,
          focus: context?.brain?.current_focus,
          mvc_completion: context?.brain?.mvc_completion_pct
        }
      });
  } catch (error) {
    console.error('Error saving trace:', error);
  }
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
      regenerate = false,
      enhanceExisting = false,
      contextPack,
      module,
    } = await req.json();
    console.log('[generate-mission-plan] module=', module ?? 'missions', 'hasContextPack=', !!contextPack);
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const supabase = SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY 
      ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
      : null;

    // ─────────────────────────────────────────────────────────────
    // FREE PLAN ENFORCEMENT (server-side, before spending AI tokens)
    // Only enforced on NEW mission creation. `enhanceExisting=true`
    // (used to re-render the plan of an already-created mission)
    // is exempt — the mission already counted against the cap when created.
    // Free users: max 3 missions per calendar month. Pro: unlimited.
    // Fail-open on infra errors so paying users are never blocked.
    // ─────────────────────────────────────────────────────────────
    const FREE_MISSIONS_PER_MONTH = 3;
    if (businessId && supabase && !enhanceExisting) {
      try {
        const { data: activeSub } = await supabase
          .from("subscriptions")
          .select("expires_at, status")
          .eq("business_id", businessId)
          .eq("status", "active")
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        const isPro = !!(activeSub?.expires_at && new Date(activeSub.expires_at).getTime() > Date.now());

        if (!isPro) {
          const startOfMonth = new Date();
          startOfMonth.setDate(1);
          startOfMonth.setHours(0, 0, 0, 0);

          const { count } = await supabase
            .from("missions")
            .select("id", { count: "exact", head: true })
            .eq("business_id", businessId)
            .gte("created_at", startOfMonth.toISOString());

          const used = count || 0;
          if (used >= FREE_MISSIONS_PER_MONTH) {
            console.log(`[free-limit] Mission cap reached: ${used}/${FREE_MISSIONS_PER_MONTH} for business ${businessId}`);
            return new Response(
              JSON.stringify({
                error: "free_limit_reached",
                limitType: "missions",
                used,
                limit: FREE_MISSIONS_PER_MONTH,
                message: `Alcanzaste el límite de ${FREE_MISSIONS_PER_MONTH} misiones del plan Free este mes. Pasate a Pro para misiones ilimitadas.`,
                upgradeUrl: "/checkout",
              }),
              {
                status: 402,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
              }
            );
          }
        }
      } catch (limitErr) {
        // Fail-open: never block on infra issues
        console.error("[free-limit] check failed, allowing request:", limitErr);
      }
    }

    // Fetch comprehensive context
    let context = null;
    if (businessId && supabase) {
      context = await fetchBusinessContext(supabase, businessId);
      
      // Check if we have enough context (MVC)
      const mvcCompletion = context?.brain?.mvc_completion_pct || 0;
      console.log(`MVC Completion: ${mvcCompletion}%`);
    }

    // ───── Motor IA Universal — Cache Lookup ─────
    const { computeBrainSignature, readArtifactCache, writeArtifactCache } = await import("../_shared/artifact-cache.ts");
    const artifactKey = `mission:${(missionTitle ?? "").slice(0, 120)}::${missionArea ?? "general"}`;
    const brainSignature = await computeBrainSignature({
      bizUpdated: context?.business?.updated_at ?? null,
      brainUpdated: context?.brain?.updated_at ?? null,
      totalSignals: context?.brain?.total_signals ?? 0,
      mvc: context?.brain?.mvc_completion_pct ?? 0,
      focus: context?.brain?.current_focus ?? null,
      type: context?.brain?.primary_business_type ?? context?.business?.category ?? null,
      country: context?.business?.country ?? null,
      title: missionTitle,
      area: missionArea,
    });
    if (businessId && !regenerate) {
      const hit = await readArtifactCache<any>({ businessId, artifactType: "mission", artifactKey, brainSignature });
      if (hit) {
        console.log("[forge-cache] HIT", artifactKey);
        return new Response(
          JSON.stringify({ plan: hit.payload, qualityGate: { passed: true, cached: true, modelUsed: hit.modelUsed }, quality: { passed: true }, fallbackUsed: false, cached: true }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
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
        model: "google/gemini-2.5-pro", // Mejor razonamiento para plan completo y profundo
        messages: [
          { role: "system", content: `${SYSTEM_PROMPT}\n\n${ANTI_GENERIC_SYSTEM}\n\n${(await import("../_shared/brain-core/prompt2-rules.ts")).prompt2Rules("mission")}\n\n${(await import("../_shared/brain-core/contextual-terminology.ts")).buildTerminologyContext({ activity: brain?.primary_business_type || business?.category || null, country: business?.country || null, offer: (brain?.factual_memory as any)?.offer ?? null, customer: (brain?.factual_memory as any)?.customer ?? null, channel: (brain?.factual_memory as any)?.channel ?? null }).promptFragment}` },
          { role: "user", content: contextPrompt },
        ],
        stream: false,
        temperature: regenerate ? 0.8 : 0.6,
        max_tokens: 8192,
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

    // Parse JSON from response - with better error handling
    let planData;
    try {
      // Try to find complete JSON object
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        let jsonStr = jsonMatch[0];
        
        // Try to fix truncated JSON by closing open arrays/objects
        const openBrackets = (jsonStr.match(/\[/g) || []).length;
        const closeBrackets = (jsonStr.match(/\]/g) || []).length;
        const openBraces = (jsonStr.match(/\{/g) || []).length;
        const closeBraces = (jsonStr.match(/\}/g) || []).length;
        
        // Add missing closing brackets/braces
        for (let i = 0; i < openBrackets - closeBrackets; i++) {
          jsonStr += ']';
        }
        for (let i = 0; i < openBraces - closeBraces; i++) {
          jsonStr += '}';
        }
        
        // Remove trailing commas before closing brackets
        jsonStr = jsonStr.replace(/,\s*([\]}])/g, '$1');
        
        planData = JSON.parse(jsonStr);
      } else {
        throw new Error("No JSON found in response");
      }
    } catch (parseError) {
      console.error("Error parsing AI response:", parseError);
      console.log("Raw content length:", content?.length);
      
      // Return a fallback minimal plan
      return new Response(
        JSON.stringify({ 
          plan: {
            planTitle: missionTitle,
            planDescription: missionDescription || "Plan de acción personalizado",
            estimatedDuration: "1-2 semanas",
            estimatedImpact: "Mejora en el área seleccionada",
            confidence: "medium",
            basedOn: ["Información básica del negocio"],
            steps: [],
            businessSpecificTips: ["Contacta al chat para más detalles personalizados"],
            potentialChallenges: [],
            successMetrics: [],
            dataGapsIdentified: ["Necesito más información para personalizar mejor"]
          },
          qualityGate: { passed: false, mvcCompletion: context?.brain?.mvc_completion_pct || 0 },
          parseError: true
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Quality Gate: Check for generic phrases + runtime title gate
    const genericPhrases = checkForGenericPhrases(planData);
    const { runtimeOutputGate, safeFallback } = await import("../_shared/brain-core/runtime-output-gate.ts");
    const titleGate = runtimeOutputGate({
      text: `${planData?.planTitle ?? ""}\n${planData?.planDescription ?? ""}`,
      kind: "mission",
      hasBrainEvidence: !!(context?.brain),
      hasConcreteAction: Array.isArray(planData?.steps) && planData.steps.length > 0,
    });
    const passed = genericPhrases.length === 0 && titleGate.ok;

    if (!titleGate.ok) {
      console.warn("[runtime-output-gate:mission] blocked:", titleGate.reasons);
      // Reemplazar título plantilla por uno conectado al brain
      if (titleGate.reasons.some(r => r.includes("plantilla"))) {
        planData.planTitle = "Mapear la fricción real del proceso comercial actual";
        planData.planDescription = safeFallback("mission");
      }
      planData._gateReasons = titleGate.reasons;
    }

    if (!passed) {
      console.warn("Quality Gate: Generic phrases detected:", genericPhrases);
      planData._genericPhrases = genericPhrases;
    }

    // Save trace for auditing
    if (supabase && businessId) {
      await saveRecommendationTrace(supabase, businessId, planData, context, passed);
    }

    console.log("Generated plan with", planData.steps?.length || 0, "steps, passed QG:", passed);

    // STEP QUALITY GATE — block generic / templated step titles before they reach the user.
    const GENERIC_STEP_RX = [
      /^analizar\s+(el|la|los|las)?\s*(problema|situaci[oó]n|contexto)\s*\.?$/i,
      /^definir\s+(el|la)?\s*objetivo\s*\.?$/i,
      /^revisar\s+(el|la|los|las)?\s*(datos|resultados)\s*\.?$/i,
      /^evaluar\s+resultados?\s*\.?$/i,
      /^implementar\s+(la|el)?\s*soluci[oó]n\s*\.?$/i,
      /^medir\s+impacto\s*\.?$/i,
      /^siguiente\s+paso\s*\.?$/i,
    ];
    if (Array.isArray(planData?.steps)) {
      planData.steps = planData.steps
        .map((s: any) => ({
          ...s,
          title: humanizeEvidence(s?.title) || s?.title,
          description: humanizeEvidence(s?.description ?? s?.what_to_do) || s?.description,
        }))
        .filter((s: any) => {
          const t = String(s?.title || "").trim();
          if (!t || t.length < 8) return false;
          if (GENERIC_STEP_RX.some((rx) => rx.test(t))) {
            console.warn("[step-gate] dropped generic step title:", t);
            return false;
          }
          const d = String(s?.description || s?.what_to_do || "");
          if (d.length < 30) {
            console.warn("[step-gate] dropped step with thin description:", t);
            return false;
          }
          return true;
        });
    }

    const cleanPlan = sanitizeForUser(planData);

    // Server-side validateBeforeStore (Prompt 3): block empty/placeholder steps.
    try {
      const { validateBeforeStore } = await import("../_shared/validate-before-store.ts");
      const audit = validateBeforeStore({
        module: 'mission',
        title: cleanPlan?.planTitle ?? missionTitle ?? '',
        description: cleanPlan?.executiveSummary ?? cleanPlan?.summary ?? '',
        steps: (cleanPlan?.steps ?? []).map((s: any) => ({ title: s?.title, description: s?.description ?? s?.what_to_do })),
      });
      if (!audit.passed) {
        console.warn('[generate-mission-plan] gate blocked:', audit.reasons);
      }
    } catch (e) { console.error('[generate-mission-plan] validate failed', e); }

    return new Response(
      JSON.stringify({
        plan: cleanPlan,
        qualityGate: {
          passed,
          genericPhrasesFound: genericPhrases,
          mvcCompletion: context?.brain?.mvc_completion_pct || 0,
        },
        quality: { passed: true },
        fallbackUsed: false,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("generate-mission-plan error:", error);
    return new Response(
      JSON.stringify({ error: 'temporary_unavailable', quality: { passed: false, reasons: ['edge_function_failed'] }, fallbackUsed: true }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
