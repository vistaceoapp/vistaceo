import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import { ANTI_GENERIC_SYSTEM } from "../_shared/brain-core/anti-generic-prompt.ts";
import { sanitizeForUser } from "../_shared/brain-core/sanitize-output.ts";
import { humanizeEvidence } from "../_shared/humanize-evidence.ts";


const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `Eres un consultor senior con 20 años de experiencia. Generá un PLAN ULTRA-DIRECTO, ESPECÍFICO Y COMPLETO para esta misión. NADA de vueltas ni relleno.

ESTILO OBLIGATORIO DE CADA PASO (esto define la calidad):
- "text": ORDEN DIRECTA en imperativo, MÁXIMO 12 palabras, empieza con verbo (Escribí, Configurá, Llamá, Publicá, Medí, Contactá, Cotizá, Cerrá, Enviá…). SIN adjetivos vacíos ("efectivo", "óptimo", "adecuado"). SIN prefacios ("Es importante que…", "Deberías…").
  ✅ "Publicá 3 reels de before/after esta semana, martes 20h, jueves 20h, sábado 12h"
  ❌ "Considerá implementar una estrategia de contenido en redes sociales"
- "howTo": 5-7 sub-pasos, cada uno accionable HOY, con herramienta/canal/número/tiempo concreto ("Abrí Instagram → Reels → grabá 15s vertical con luz natural"). Nada de "prepará el contenido" — decí exactamente qué escribir/decir/mostrar.
- "example": OBLIGATORIO. Copy/script/mensaje LITERAL listo para copiar y pegar, adaptado al negocio real (nombre, productos, ciudad, clientes). Entre comillas. Si es un mensaje de WhatsApp, escribilo entero.
- "why": 1-2 frases, dato específico del brain (ej "Tu ticket promedio está 22% por debajo del sector"). NO frases genéricas tipo "esto ayuda a crecer".
- "timeEstimate": realista y granular ("25 min", "1h 30min"), no "algunas horas".
- "metric": UN número medible con umbral ("+15% en respuestas WhatsApp en 7 días", "3 reseñas Google nuevas en 14 días"). Nunca "mejorar engagement".
- "checklist": 3-5 items ultra-concretos que se puedan tildar en un minuto cada uno.
- "definitionOfDone": OBLIGATORIO. Una sola frase, condición binaria verificable ("El link de reservas está publicado en la bio y respondió al menos 1 cliente").
- "resources": 2-4 items con nombre real (herramienta, plantilla, persona del equipo).
- "tips": 1-2 tips de experto del rubro, específicos.

ESTRUCTURA:
- Mínimo 8 pasos, máximo 12. Cada paso debe poder ejecutarse SIN leer los otros.
- Los primeros 2 pasos son quick wins ejecutables en <45 min hoy. Los últimos son de consolidación/medición.
- Nunca dos pasos que digan lo mismo con otras palabras. Cada paso avanza la misión un tramo distinto.

REGLAS ANTI-GENÉRICO (violación = plan bloqueado):
1. Nombres, productos, clientes, ciudad, horarios REALES del brain en al menos 60% de los pasos.
2. PROHIBIDO: "mejora tu negocio", "aumenta tus ventas", "optimiza tu operación", "sé más eficiente", "atrae más clientes", "implementa mejoras", "considera hacer", "podrías intentar", "una buena idea sería", "es importante que", "deberías pensar en".
3. Si falta un dato, decilo explícito: "Necesito saber X para ser más preciso" — NUNCA rellenes con genérico.
4. Terminología del rubro real (abogado ≠ café ≠ dentista).

RESPONDE SOLO EN FORMATO JSON:
{
  "planTitle": "Título específico mencionando algo único del negocio",
  "planDescription": "Descripción con datos concretos del negocio (máx 200 chars)",
  "estimatedDuration": "X días/semanas con desglose",
  "estimatedImpact": "Resultado medible con número",
  "estimatedROI": "Retorno estimado con número (ej: +15% ticket promedio, ahorro 4h/semana)",
  "confidence": "high|medium|low",
  "riskLevel": "low|medium|high",
  "basedOn": ["Dato/señal específica del brain", "Otra evidencia real", "Patrón observado"],
  "quickWins": ["Acción concreta ejecutable HOY en <30 min", "Otra quick win específica"],
  "weeklyMilestones": [
    {"week": 1, "milestone": "Objetivo verificable semana 1", "metric": "Número a medir"},
    {"week": 2, "milestone": "Objetivo verificable semana 2", "metric": "Número a medir"}
  ],
  "steps": [
    {
      "text": "Orden directa en imperativo, ≤12 palabras",
      "done": false,
      "howTo": ["Sub-paso 1 accionable con herramienta/canal concreto", "Sub-paso 2 con número", "Sub-paso 3 con dato del negocio", "Sub-paso 4", "Sub-paso 5"],
      "example": "Copy/script/mensaje LITERAL listo para copiar, con nombre real del negocio",
      "why": "Dato específico del brain que justifica este paso ahora",
      "timeEstimate": "25 min",
      "metric": "Número medible con umbral y plazo",
      "checklist": ["Item concreto 1", "Item concreto 2", "Item concreto 3"],
      "definitionOfDone": "Condición binaria verificable en una sola frase",
      "confidence": "high|medium|low",
      "resources": ["Herramienta/plantilla real", "Otro recurso concreto"],
      "tips": ["Tip de experto específico del rubro"]
    }
  ],
  "businessSpecificTips": ["Tip mencionando algo único de ESTE negocio", "Consejo por rubro/país"],
  "potentialChallenges": ["Desafío concreto + cómo superarlo"],
  "successMetrics": ["Métrica con número objetivo específico"],
  "teamInvolvement": ["Quién participa y en qué exactamente"],
  "dependencies": ["Qué se necesita tener antes"],
  "dataGapsIdentified": ["Dato que falta para ser más preciso (si aplica)"]
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

  // Identity profile — el DNI del negocio (offerings reales, canales, cliente objetivo,
  // pains). Esto es lo que evita misiones genéricas. Espejamos analyze-patterns.
  const identity = (brain.identity_profile as Record<string, unknown>) || {};
  const factual = (brain.factual_memory as Record<string, unknown>) || {};
  const offerP = (brain.offer_profile as Record<string, unknown>) || {};
  const customerP = (brain.customer_profile as Record<string, unknown>) || {};
  const arr = (v: unknown): string[] => Array.isArray(v) ? v.map((x) => String(x)).filter(Boolean) : (typeof v === "string" && v.trim() ? [v.trim()] : []);
  const offerings = arr(identity.offerings || identity.products).length ? arr(identity.offerings || identity.products) : arr(offerP.summary).concat(arr(factual.offer_summary), arr(factual.unidades_negocio));
  const channels = arr(identity.channels || identity.channel_mix).length ? arr(identity.channels || identity.channel_mix) : arr(factual.main_channel).concat(arr(factual.channel_summary));
  const customer = (identity.customer_type as string) || (identity.target_customer as string) || (customerP.summary as string) || (factual.main_customer as string) || (factual.client_summary as string) || "";
  const pains = arr(identity.primary_pains || identity.pain_points).length ? arr(identity.primary_pains || identity.pain_points) : arr(factual.primary_pains).concat(arr(factual.main_friction));
  const angles = arr(identity.opportunity_angles).length ? arr(identity.opportunity_angles) : arr(factual.opportunity_angles);
  if (offerings.length || channels.length || customer || pains.length || angles.length) {
    prompt += "\n\n===== IDENTIDAD DEL NEGOCIO (ANCLÁ LA MISIÓN A ESTO) =====";
    if (offerings.length) prompt += `\nOFERTA REAL: ${offerings.slice(0, 8).join(", ")}`;
    if (channels.length) prompt += `\nCANALES: ${channels.slice(0, 6).join(", ")}`;
    if (customer) prompt += `\nCLIENTE OBJETIVO: ${customer}`;
    if (pains.length) prompt += `\nDOLORES: ${pains.slice(0, 5).join(" | ")}`;
    if (angles.length) prompt += `\nÁNGULOS DE OPORTUNIDAD: ${angles.slice(0, 5).join(" | ")}`;
  }

  // Add brain memories if available (con humanización de arrays anidados de chat-learning)
  if (brain.factual_memory && Object.keys(brain.factual_memory).length > 0) {
    prompt += "\n\n===== MEMORIA FACTUAL DEL NEGOCIO =====";
    Object.entries(brain.factual_memory).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        // learning_business / learning_operations / etc — arrays de {q,a,t,c}
        const pairs = (value as Array<Record<string, unknown>>)
          .slice(-6)
          .map(item => {
            const q = (item.q as string) || (item.question as string) || "";
            const a = (item.a as string) || (item.answer as string) || "";
            return q && a ? `${q} → ${a}` : "";
          })
          .filter(Boolean);
        if (pairs.length) {
          prompt += `\n[${key.replace(/_/g, ' ').toUpperCase()}]`;
          pairs.forEach(p => { prompt += `\n• ${p}`; });
        }
      } else if (value && typeof value === "object") {
        prompt += `\n• ${key.replace(/_/g, ' ')}: ${JSON.stringify(value).slice(0, 200)}`;
      } else if (value !== null && value !== undefined && value !== "") {
        prompt += `\n• ${key.replace(/_/g, ' ')}: ${value}`;
      }
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

    // ─────────────────────────────────────────────────────────────
    // GENERATION CORE — extracted so it can run as a background job.
    // SAME model (google/gemini-2.5-pro), SAME prompts, SAME quality.
    // ─────────────────────────────────────────────────────────────
    const generateAndPersist = async (): Promise<Record<string, unknown>> => {
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

      const brain = context?.brain ?? null;
      const business = context?.business ?? null;
      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          // Gemini 2.5 Pro: máxima calidad de razonamiento y profundidad para planes hiper-personalizados.
          // La generación corre en SEGUNDO PLANO (job) — el cliente nunca espera con la conexión abierta.
          model: "google/gemini-2.5-pro",
          messages: [
            { role: "system", content: `${SYSTEM_PROMPT}\n\n${ANTI_GENERIC_SYSTEM}\n\n${(await import("../_shared/brain-core/prompt2-rules.ts")).prompt2Rules("mission")}\n\n${(await import("../_shared/brain-core/contextual-terminology.ts")).buildTerminologyContext({ activity: brain?.primary_business_type || business?.category || null, country: business?.country || null, offer: (brain?.factual_memory as any)?.offer ?? null, customer: (brain?.factual_memory as any)?.customer ?? null, channel: (brain?.factual_memory as any)?.channel ?? null }).promptFragment}\n\n${(await import("../_shared/brain-core/anchor-directive.ts")).buildAnchorDirective((await import("../_shared/brain-core/hyper-personalization-gate.ts")).buildHyperAnchors({ business, brain }), "mission")}` },
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
          throw new Error("Límite de solicitudes excedido. Intenta en unos minutos.");
        }
        if (response.status === 402) {
          throw new Error("Créditos agotados. Contacta al soporte.");
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
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          let jsonStr = jsonMatch[0];

          const openBrackets = (jsonStr.match(/\[/g) || []).length;
          const closeBrackets = (jsonStr.match(/\]/g) || []).length;
          const openBraces = (jsonStr.match(/\{/g) || []).length;
          const closeBraces = (jsonStr.match(/\}/g) || []).length;

          for (let i = 0; i < openBrackets - closeBrackets; i++) {
            jsonStr += ']';
          }
          for (let i = 0; i < openBraces - closeBraces; i++) {
            jsonStr += '}';
          }

          jsonStr = jsonStr.replace(/,\s*([\]}])/g, '$1');

          planData = JSON.parse(jsonStr);
        } else {
          throw new Error("No JSON found in response");
        }
      } catch (parseError) {
        console.error("Error parsing AI response:", parseError);
        console.log("Raw content length:", content?.length);

        return {
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
        };
      }

      // Quality Gate: Check for generic phrases + runtime title gate
      const genericPhrases = checkForGenericPhrases(planData);
      const { runtimeOutputGate, safeFallback } = await import("../_shared/brain-core/runtime-output-gate.ts");
      const { buildHyperAnchors } = await import("../_shared/brain-core/hyper-personalization-gate.ts");
      const titleGate = runtimeOutputGate({
        text: `${planData?.planTitle ?? ""}\n${planData?.planDescription ?? ""}`,
        kind: "mission",
        hasBrainEvidence: !!(context?.brain),
        hasConcreteAction: Array.isArray(planData?.steps) && planData.steps.length > 0,
        anchors: buildHyperAnchors({ context }),
      });
      const passed = genericPhrases.length === 0 && titleGate.ok;

      if (!titleGate.ok) {
        console.warn("[runtime-output-gate:mission] blocked:", titleGate.reasons);
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
      // NOTA: el schema del prompt usa { text, howTo, why } — el gate debe
      // aceptar AMBAS formas (text/title) para no borrar pasos válidos.
      if (Array.isArray(planData?.steps)) {
        planData.steps = planData.steps
          .map((s: any) => ({
            ...s,
            title: humanizeEvidence(s?.title) || s?.title,
            text: humanizeEvidence(s?.text) || s?.text,
            description: humanizeEvidence(s?.description ?? s?.what_to_do) || s?.description,
          }))
          .filter((s: any) => {
            const t = String(s?.title || s?.text || "").trim();
            if (!t || t.length < 8) return false;
            if (GENERIC_STEP_RX.some((rx) => rx.test(t))) {
              console.warn("[step-gate] dropped generic step title:", t);
              return false;
            }
            const d = String(
              s?.description ||
              s?.what_to_do ||
              s?.why ||
              (Array.isArray(s?.howTo) ? s.howTo.join(" ") : "") ||
              ""
            );
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

      // ───── Motor IA Universal — persist cache ─────
      if (businessId && passed) {
        await writeArtifactCache({
          businessId,
          artifactType: "mission",
          artifactKey,
          brainSignature,
          payload: cleanPlan,
          modelUsed: "google/gemini-2.5-pro",
        });
      }

      // Brain signal: mission_plan_generated (cierra loop de auto-aprendizaje)
      if (businessId && supabase) {
        try {
          await supabase.from("signals").insert({
            business_id: businessId,
            brain_id: context?.brain?.id || null,
            signal_type: "mission_plan_generated",
            source: "generate-mission-plan",
            content: {
              title: cleanPlan?.planTitle,
              steps_count: (cleanPlan?.steps || []).length,
              confidence: cleanPlan?.confidence,
              risk_level: cleanPlan?.riskLevel,
              estimated_impact: cleanPlan?.estimatedImpact,
              quality_passed: passed,
            },
            confidence: cleanPlan?.confidence === "high" ? "high" : "medium",
            importance: 7,
          });
        } catch (e) { console.warn("[generate-mission-plan] signal insert failed", e); }
      }

      return {
        plan: cleanPlan,
        qualityGate: {
          passed,
          genericPhrasesFound: genericPhrases,
          mvcCompletion: context?.brain?.mvc_completion_pct || 0,
        },
        quality: { passed: true },
        fallbackUsed: false,
      };
    };

    // ─────────────────────────────────────────────────────────────
    // ASYNC JOB MODE — respond instantly with a jobId; the AI keeps
    // working in background (EdgeRuntime.waitUntil). Eliminates
    // client timeouts and duplicate retries without touching quality.
    // The client polls ai_plan_jobs until completed.
    // ─────────────────────────────────────────────────────────────
    if (supabase && businessId) {
      const { data: job, error: jobErr } = await supabase
        .from("ai_plan_jobs")
        .insert({
          business_id: businessId,
          job_type: "mission_plan",
          status: "processing",
          request: { missionTitle, missionArea, regenerate: !!regenerate, enhanceExisting: !!enhanceExisting },
        })
        .select("id")
        .single();

      if (!jobErr && job?.id) {
        const work = (async () => {
          try {
            const payload = await generateAndPersist();
            await supabase
              .from("ai_plan_jobs")
              .update({ status: "completed", result: payload, updated_at: new Date().toISOString() })
              .eq("id", job.id);
            console.log("[job] completed:", job.id);
          } catch (e) {
            console.error("[job] failed:", job.id, e);
            await supabase
              .from("ai_plan_jobs")
              .update({ status: "failed", error: String((e as Error)?.message ?? e), updated_at: new Date().toISOString() })
              .eq("id", job.id);
          }
        })();

        try {
          // @ts-ignore — EdgeRuntime está disponible en el runtime de funciones
          EdgeRuntime.waitUntil(work);
        } catch (_) {
          // Si waitUntil no existe, la promesa sigue corriendo igual (sin await)
        }

        return new Response(
          JSON.stringify({ jobId: job.id, status: "processing", async: true }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      console.warn("[job] insert failed, falling back to sync:", jobErr);
    }

    // Fallback síncrono (sin businessId o si falló la creación del job)
    const payload = await generateAndPersist();
    return new Response(
      JSON.stringify(payload),
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
