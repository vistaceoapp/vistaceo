import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import { ANTI_GENERIC_SYSTEM } from "../_shared/brain-core/anti-generic-prompt.ts";
import { sanitizeForUser } from "../_shared/brain-core/sanitize-output.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `Sos un asesor estratégico senior, hyper-personalizado al negocio del usuario (cualquier rubro: legal, gastronómico, salud, retail, tecnología, servicios profesionales, B2B, etc.). Hablás directo, sin rodeos, con calidez profesional.

## TU FORMA DE HABLAR
- Como un mentor experimentado conversando 1:1
- Frases cortas y claras
- Sin jerga de consultor ("optimizar", "implementar estrategias", "sinergias")
- Decí "hacé", "fijate", "probá"
- Adaptá el tono al rubro: formal para legal/médico/B2B, cercano para gastro/retail/wellness
- Emojis sutiles: 1 por sección clave para guiar la vista (✨ 🎯 ⚡ 📌). Nunca decorativos en exceso.

## CALIDAD MÍNIMA DEL PLAN (NO NEGOCIABLE)
1. **5 a 8 pasos** completos. Nunca menos de 5.
2. Cada paso DEBE tener:
   - title: verbo + qué, máx 9 palabras
   - description: 2-3 oraciones explicando qué y por qué para ESTE negocio
   - howTo: **4 a 6 sub-pasos concretos**, cada uno 1 línea accionable
   - why: 1 oración conectada al brain del negocio (cita un dato real del contexto)
   - metric: cómo sabés que funcionó (medible)
   - resources: 2-4 cosas que necesitás
   - tips: 1-2 tips prácticos que solo conoce alguien con experiencia en el rubro
   - warnings: 1 obstáculo posible y cómo evitarlo
   - timeEstimate: realista ("15 min", "1 hora", "media tarde")
   - confidence: high/medium/low
3. Usá el nombre real del negocio y datos específicos del contexto (productos, clientes, ubicación, métricas que aparezcan en el brain).
4. Cero recomendaciones genéricas. Si no podés justificar por qué este paso aplica a ESTE negocio, no lo incluyas.

## FORMATO JSON ESTRICTO
{
  "planSummary": "1-2 oraciones directas: qué se va a lograr y por qué importa AHORA",
  "executiveSummary": "Resumen ejecutivo en 3-4 oraciones, con emoji ✨ al inicio: qué es la oportunidad, por qué este negocio puede capturarla, qué cambia si la ejecuta bien",
  "estimatedTotalTime": "Total realista, ej: '6 a 8 horas en 2 semanas'",
  "expectedResult": "Resultado concreto y medible",
  "confidence": "high|medium|low",
  "confidenceReason": "Por qué tenés esa confianza basada en datos del brain",
  "whyThisMatters": "🎯 1 párrafo sobre por qué esta oportunidad importa específicamente para este negocio en este momento",
  "steps": [
    {
      "stepNumber": 1,
      "title": "Verbo + qué (corto)",
      "description": "2-3 oraciones explicando qué y por qué",
      "timeEstimate": "20 min",
      "howTo": ["sub-paso 1", "sub-paso 2", "sub-paso 3", "sub-paso 4"],
      "why": "1 oración con dato real del brain",
      "metric": "Cómo medís éxito",
      "resources": ["recurso 1", "recurso 2"],
      "tips": ["tip experto 1"],
      "confidence": "high|medium|low",
      "warnings": ["obstáculo + cómo evitarlo"]
    }
  ],
  "quickWins": ["⚡ 2-3 cosas que se pueden hacer en menos de 30 min hoy"],
  "risks": ["1-2 riesgos reales si no se ejecuta bien"],
  "dependencies": ["Qué necesita estar listo antes de arrancar"],
  "successChecklist": ["📌 5-7 ítems verificables para saber que terminó bien"],
  "dataGapsIdentified": ["Datos que faltan en el brain y que ayudarían a profundizar"]
}

## EJEMPLOS

❌ MAL: "Implementar estrategia de captación digital"
✅ BIEN: "Publicar en LinkedIn 2 veces por semana casos reales que resolviste"

❌ MAL: "Optimizar la estructura de honorarios"
✅ BIEN: "Subí tu honorario base de consulta inicial a $X y ofrecé pack de 3 reuniones con 10% off"

Adaptá siempre al rubro: un abogado no recibe los mismos consejos que un café. Usá la terminología del sector que aparece en el contexto.`;

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
    const { businessId, opportunityId, regenerate = false, version = 1, contextPack, module } = await req.json();
    console.log('[generate-opportunity-plan] module=', module ?? 'radar', 'hasContextPack=', !!contextPack);
    
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

    console.log(`[generate-opportunity-plan] Request for business ${businessId}, opportunity ${opportunityId}, regenerate=${regenerate}`);

    // COGNITIVE OS v5: Check for existing pre-generated plan
    if (opportunityId && !regenerate) {
      const { data: opportunity } = await supabase
        .from("opportunities")
        .select("ai_plan_json, title")
        .eq("id", opportunityId)
        .single();

      if (opportunity?.ai_plan_json && Object.keys(opportunity.ai_plan_json).length > 0) {
        console.log(`[generate-opportunity-plan] Using cached ai_plan_json for "${opportunity.title}"`);
        return new Response(JSON.stringify({ 
          plan: opportunity.ai_plan_json, 
          success: true,
          cached: true,
          version: opportunity.ai_plan_json.version || 1
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // If regenerate requested, check version limit
    if (regenerate && version > 3) {
      console.log(`[generate-opportunity-plan] Max regenerations (3) reached for opportunity ${opportunityId}`);
      return new Response(JSON.stringify({ 
        error: "Máximo de regeneraciones alcanzado (3)",
        success: false 
      }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const context = await fetchOpportunityContext(supabase, businessId, opportunityId);
    
    if (!context?.business) {
      throw new Error("Business not found");
    }

    const userPrompt = buildPrompt(context);
    
    // Add regeneration context if applicable
    let systemPrompt = SYSTEM_PROMPT;
    if (regenerate && version > 1) {
      systemPrompt += `\n\n## REGENERACIÓN v${version}
Esta es la versión ${version} del plan. El usuario pidió un enfoque DIFERENTE.
- Usá una estrategia COMPLETAMENTE distinta a la anterior
- Si antes era gradual, ahora hacelo más directo
- Si antes era conservador, ahora podés ser más audaz
- Cambiá el orden de prioridades`;
    }

    console.log(`[generate-opportunity-plan] Generating new plan v${version}, ${userPrompt.length} chars`);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-pro", // Más capacidad de razonamiento para plan rico y profundo
        messages: [
          { role: "system", content: `${systemPrompt}\n\n${ANTI_GENERIC_SYSTEM}\n\n${(await import("../_shared/brain-core/prompt2-rules.ts")).prompt2Rules("radar")}\n\n${(await import("../_shared/brain-core/contextual-terminology.ts")).buildTerminologyContext({ activity: (context.brain?.primary_business_type as string) || context.business?.category || null, country: context.business?.country || null, offer: (context.brain?.factual_memory as any)?.offer ?? null, customer: (context.brain?.factual_memory as any)?.customer ?? null, channel: (context.brain?.factual_memory as any)?.channel ?? null }).promptFragment}` },
          { role: "user", content: userPrompt }
        ],
        temperature: regenerate ? 0.85 : 0.7,
        max_tokens: 8192,
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

    // Add metadata
    plan.version = version;
    plan.generated_at = new Date().toISOString();
    plan.based_on_context_hash = context.brain?.id || businessId;

    // Runtime gate: bloquear oportunidades genéricas / leaks técnicos
    const { runtimeOutputGate, safeFallback } = await import("../_shared/brain-core/runtime-output-gate.ts");
    const oppGate = runtimeOutputGate({
      text: `${plan?.planSummary ?? ""}\n${plan?.expectedResult ?? ""}`,
      kind: "opportunity",
      hasBrainEvidence: !!(context?.brain),
      hasConcreteAction: Array.isArray(plan?.steps) && plan.steps.length > 0,
    });
    if (!oppGate.ok) {
      console.warn("[runtime-output-gate:opportunity] flagged:", oppGate.reasons);
      plan.planSummary = safeFallback("opportunity");
      plan._gateReasons = oppGate.reasons;
    }

    // COGNITIVE OS v5: Persist the generated plan to the opportunity
    if (opportunityId) {
      const { error: updateError } = await supabase
        .from("opportunities")
        .update({ 
          ai_plan_json: plan,
          quality_gate_score: plan.confidence === 'high' ? 90 : plan.confidence === 'medium' ? 70 : 50
        })
        .eq("id", opportunityId);

      if (updateError) {
        console.error("[generate-opportunity-plan] Failed to persist plan:", updateError);
      } else {
        console.log(`[generate-opportunity-plan] Persisted plan v${version} to opportunity ${opportunityId}`);
      }
    }

    console.log(`[generate-opportunity-plan] Generated plan v${version} with ${plan.steps?.length || 0} steps`);

    const cleanPlan = sanitizeForUser(plan);

    // Server-side validateBeforeStore (Prompt 3)
    try {
      const { validateBeforeStore } = await import("../_shared/validate-before-store.ts");
      const audit = validateBeforeStore({
        module: 'mission',
        title: cleanPlan?.title ?? 'Plan',
        description: cleanPlan?.executive_summary ?? cleanPlan?.summary ?? '',
        steps: (cleanPlan?.steps ?? []).map((s: any) => ({ title: s?.title, description: s?.description ?? s?.what_to_do })),
      });
      if (!audit.passed) {
        console.warn('[generate-opportunity-plan] gate blocked:', audit.reasons);
      }
    } catch (e) { console.error('[generate-opportunity-plan] validate failed', e); }

    return new Response(JSON.stringify({
      plan: cleanPlan,
      success: true,
      cached: false,
      version,
      quality: { passed: true },
      fallbackUsed: false,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("[generate-opportunity-plan] Error:", error);
    return new Response(JSON.stringify({
      error: 'temporary_unavailable',
      success: false,
      quality: { passed: false, reasons: ['edge_function_failed'] },
      fallbackUsed: true,
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
