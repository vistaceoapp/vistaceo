import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { SECTOR_CONTEXTS, getSectorContext, getFollowUpTrigger } from "./sectorContexts.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Categories of questions to ask - Prioritized by business impact
const QUESTION_CATEGORIES = [
  "operaciones",
  "equipo", 
  "clientes",
  "marketing",
  "finanzas",
  "producto",
  "tecnologia",
  "competencia",
  "proveedores",
  "ubicacion",
  "ventas",
  "servicio",
];

const buildSystemPrompt = (businessType: string, country: string): string => {
  const sectorContext = SECTOR_CONTEXTS[businessType] || SECTOR_CONTEXTS.default;
  const pronoun = country === "MX" ? "tú" : "vos";
  const verb = country === "MX" ? "tienes" : "tenés";
  
  return `Sos el consultor de negocios más inteligente del mundo, especializado en ${sectorContext.focus}.

🎯 TU MISIÓN: Hacer UNA pregunta estratégica para conocer mejor ESTE negocio específico.

📊 CONTEXTO DEL SECTOR:
- Tipo de negocio: ${businessType.replace(/_/g, ' ')}
- Métricas clave del sector: ${sectorContext.keyMetrics.join(', ')}
- Desafíos típicos: ${sectorContext.uniqueChallenges.join(', ')}

📋 REGLAS ESTRICTAS:
1. Hablá DIRECTAMENTE al dueño usando "${pronoun}" - ejemplo: "¿Cuántos X ${verb} actualmente?"
2. La pregunta debe ser ESPECÍFICA para ${sectorContext.focus}
3. Las 4 opciones deben ser MUTUAMENTE EXCLUYENTES y concretas
4. NUNCA repitas preguntas ya hechas (se te dan las anteriores)
5. El impacto debe explicar CÓMO usarás la info para ayudar
6. Pregunta sobre UNA métrica o desafío específico del sector

🧠 TIPOS DE PREGUNTAS POR NIVEL:
BÁSICO (< 5 insights): Estructura del negocio, equipo, clientes principales
MEDIO (5-15 insights): Operaciones diarias, desafíos actuales, competencia
AVANZADO (15-30 insights): Estrategia, optimización, crecimiento
EXPERTO (30+ insights): Mejora continua, benchmarks, innovación

⚠️ EVITAR:
- Preguntas genéricas que apliquen a cualquier negocio
- Opciones vagas como "Otro" o "No sé"
- Preguntas ya respondidas
- Frases en tercera persona ("El dueño debería...")

📤 FORMATO JSON ESTRICTO:
{
  "question": "Pregunta directa usando ${pronoun} (máx 80 chars)",
  "options": ["Opción específica 1", "Opción específica 2", "Opción específica 3", "Opción específica 4"],
  "category": "operaciones|equipo|clientes|marketing|finanzas|producto|tecnologia|competencia|proveedores|ventas|servicio",
  "impact": "Cómo usaré esto para personalizar tu asesoría (máx 60 chars)"
}`;
};

// Fetch existing insights to avoid repeating questions
async function fetchExistingInsights(supabase: any, businessId: string) {
  try {
    const { data, error } = await supabase
      .from("business_insights")
      .select("question, category, answer, created_at")
      .eq("business_id", businessId)
      .order("created_at", { ascending: false })
      .limit(100);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching insights:", error);
    return [];
  }
}

// Fetch comprehensive business data for context
async function fetchBusinessContext(supabase: any, businessId: string) {
  try {
    const [
      businessRes, 
      brainRes,
      checkinsRes, 
      actionsRes, 
      missionsRes,
      pulseRes,
    ] = await Promise.all([
      supabase.from("businesses").select("*").eq("id", businessId).single(),
      supabase.from("business_brains").select("*").eq("business_id", businessId).single(),
      supabase
        .from("pulse_checkins")
        .select("pulse_score_1_5, pulse_label, shift_tag, notes_good, notes_bad, applies_to_date")
        .eq("business_id", businessId)
        .order("applies_to_date", { ascending: false })
        .limit(14),
      supabase
        .from("daily_actions")
        .select("category, status, title, outcome_rating")
        .eq("business_id", businessId)
        .order("created_at", { ascending: false })
        .limit(20),
      supabase
        .from("missions")
        .select("title, status, area, impact_score")
        .eq("business_id", businessId)
        .limit(10),
      supabase
        .from("pulse_checkins")
        .select("pulse_score_1_5, shift_tag")
        .eq("business_id", businessId)
        .order("applies_to_date", { ascending: false })
        .limit(30),
    ]);

    return {
      business: businessRes.data,
      brain: brainRes.data,
      checkins: checkinsRes.data || [],
      actions: actionsRes.data || [],
      missions: missionsRes.data || [],
      pulseHistory: pulseRes.data || [],
    };
  } catch (error) {
    console.error("Error fetching context:", error);
    return null;
  }
}

function buildPrompt(context: any, existingInsights: any[]): string {
  let prompt = "";
  
  const businessType = context?.brain?.primary_business_type || context?.business?.category || "negocio_general";
  const country = context?.business?.country || "AR";
  
  // Business basics
  prompt += `📊 PERFIL DEL NEGOCIO:
- Nombre: ${context?.business?.name || "Sin nombre"}
- Tipo específico: ${businessType.replace(/_/g, ' ')}
- País: ${formatCountry(country)}
- Rating: ${context?.business?.avg_rating || "Sin datos"}
`;

  // Brain context - ultra important for personalization
  if (context?.brain) {
    const factualMemory = context.brain.factual_memory || {};
    const factualKeys = Object.keys(factualMemory).filter(k => k.startsWith('learning_'));
    
    prompt += `\n🧠 CEREBRO DEL NEGOCIO:
- Foco actual: ${context.brain.current_focus || "general"}
- Confianza: ${Math.round((context.brain.confidence_score || 0) * (context.brain.confidence_score > 1 ? 1 : 100))}%
- Áreas con conocimiento: ${factualKeys.map(k => k.replace('learning_', '')).join(', ') || "ninguna todavía"}
`;
  }

  // Pulse patterns - operational reality
  if (context?.pulseHistory?.length > 0) {
    const avgPulse = context.pulseHistory.reduce((sum: number, p: any) => sum + (p.pulse_score_1_5 || 0), 0) / context.pulseHistory.length;
    const shiftPatterns = context.pulseHistory.map((p: any) => p.shift_tag).filter(Boolean);
    const uniqueShifts = [...new Set(shiftPatterns)];
    
    prompt += `\n📈 PULSO OPERATIVO (últimos ${context.pulseHistory.length} registros):
- Promedio: ${avgPulse.toFixed(1)}/5
- Turnos activos: ${uniqueShifts.join(', ') || "sin especificar"}
`;
  }

  // Insights already collected - CRITICAL to not repeat
  if (existingInsights.length > 0) {
    prompt += `\n🚫 CONOCIMIENTO YA RECOPILADO (NO repetir):\n`;
    
    // Group by category
    const byCategory = existingInsights.reduce((acc: any, insight: any) => {
      if (!acc[insight.category]) acc[insight.category] = [];
      acc[insight.category].push(insight);
      return acc;
    }, {});
    
    Object.entries(byCategory).forEach(([cat, insights]: [string, any]) => {
      prompt += `\n[${cat.toUpperCase()}]:\n`;
      insights.slice(0, 5).forEach((i: any) => {
        prompt += `• "${i.question}" → "${i.answer}"\n`;
      });
    });

    // Show distribution
    prompt += `\n📊 DISTRIBUCIÓN:\n`;
    QUESTION_CATEGORIES.forEach(cat => {
      const count = byCategory[cat]?.length || 0;
      const bar = "█".repeat(Math.min(count, 10)) + "░".repeat(Math.max(0, 10 - count));
      prompt += `${cat}: ${bar} (${count})\n`;
    });
  }

  // Actions performance
  if (context?.actions?.length > 0) {
    const completed = context.actions.filter((a: any) => a.status === "completed").length;
    const categories = [...new Set(context.actions.map((a: any) => a.category).filter(Boolean))];
    prompt += `\n✅ ACTIVIDAD: ${completed}/${context.actions.length} acciones completadas en: ${categories.join(", ")}\n`;
  }

  // Intelligence level instruction
  const insightCount = existingInsights.length;
  let levelNote = "";
  if (insightCount < 5) {
    levelNote = "🔴 NIVEL INICIAL - Preguntá sobre estructura básica, equipo, tipo de clientes";
  } else if (insightCount < 15) {
    levelNote = "🟡 NIVEL MEDIO - Ya sabemos lo básico, preguntá sobre operaciones diarias y desafíos";
  } else if (insightCount < 30) {
    levelNote = "🟢 NIVEL BUENO - Profundizá en estrategia, competencia y oportunidades de crecimiento";
  } else {
    levelNote = "🔵 NIVEL EXPERTO - Hacé preguntas muy específicas sobre optimización y benchmarks";
  }
  
  prompt += `\n🎯 INSTRUCCIÓN: ${levelNote}

Generá UNA pregunta estratégica específica para este ${businessType.replace(/_/g, ' ')} que aún no hayamos cubierto.`;

  return prompt;
}

function formatCountry(country: string | null): string {
  const countries: Record<string, string> = {
    AR: "Argentina",
    MX: "México",
    CL: "Chile",
    UY: "Uruguay",
    BR: "Brasil",
    CO: "Colombia",
    CR: "Costa Rica",
    PA: "Panamá",
    US: "Estados Unidos",
  };
  return countries[country || ""] || "Argentina";
}

// Sector-specific fallback questions for 180 business types
function getFallbackQuestion(businessType: string, insightCount: number, existingCategories: Set<string>) {
  const sectorContext = SECTOR_CONTEXTS[businessType] || SECTOR_CONTEXTS.default;
  
  // Generate questions based on sector challenges
  const sectorQuestions = sectorContext.uniqueChallenges.map((challenge, idx) => ({
    question: `¿Cómo manejás actualmente ${challenge.toLowerCase()}?`,
    options: ["No tengo proceso", "Lo hago manualmente", "Tengo un sistema básico", "Proceso optimizado"],
    category: ["operaciones", "equipo", "servicio"][idx % 3] || "operaciones",
    impact: `Identificar oportunidades en ${sectorContext.focus}`,
  }));

  // Metric-based questions
  const metricQuestions = sectorContext.keyMetrics.map((metric, idx) => ({
    question: `¿Cómo está tu ${metric.toLowerCase()} actualmente?`,
    options: ["Bajo lo esperado", "Estable", "Creciendo", "Muy bueno"],
    category: ["finanzas", "ventas", "clientes"][idx % 3] || "finanzas",
    impact: `Optimizar ${metric} para tu negocio`,
  }));

  const basicQuestions = [
    {
      question: "¿Cuántas personas trabajan en tu negocio?",
      options: ["Solo yo", "2-5 personas", "6-15 personas", "Más de 15"],
      category: "equipo",
      impact: "Adaptar consejos al tamaño del equipo",
    },
    {
      question: "¿Cuál es tu mayor desafío esta semana?",
      options: ["Atraer clientes", "Reducir costos", "Gestionar equipo", "Mejorar servicio"],
      category: "operaciones",
      impact: "Priorizar las recomendaciones diarias",
    },
    {
      question: "¿De dónde vienen la mayoría de tus clientes?",
      options: ["Pasan caminando", "Redes sociales", "Recomendaciones", "Apps/Plataformas"],
      category: "marketing",
      impact: "Optimizar canales de adquisición",
    },
  ];

  // Combine all questions based on level
  let allQuestions;
  if (insightCount < 5) {
    allQuestions = basicQuestions;
  } else if (insightCount < 15) {
    allQuestions = [...basicQuestions, ...sectorQuestions];
  } else {
    allQuestions = [...sectorQuestions, ...metricQuestions];
  }

  // Filter out already asked categories if possible
  const available = allQuestions.filter(q => !existingCategories.has(q.category));
  if (available.length > 0) {
    return available[Math.floor(Math.random() * available.length)];
  }

  return allQuestions[Math.floor(Math.random() * allQuestions.length)];
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

    // Fetch comprehensive context
    const [existingInsights, context] = await Promise.all([
      fetchExistingInsights(supabase, businessId),
      fetchBusinessContext(supabase, businessId),
    ]);

    const businessType = context?.brain?.primary_business_type || context?.business?.category || "default";
    const country = context?.business?.country || "AR";

    console.log(`[generate-question] Business: ${businessId}, Type: ${businessType}, Insights: ${existingInsights.length}`);

    // Build rich prompts
    const systemPrompt = buildSystemPrompt(businessType, country);
    const contextPrompt = buildPrompt(context, existingInsights);

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
          { role: "user", content: contextPrompt },
        ],
        temperature: 0.7,
        max_tokens: 400,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);

      if (response.status === 429 || response.status === 402) {
        const existingCategories = new Set<string>(existingInsights.map((i: any) => i.category as string));
        const fallback = getFallbackQuestion(businessType, existingInsights.length, existingCategories);
        return new Response(
          JSON.stringify({ question: fallback }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No response from AI");
    }

    // Parse JSON response
    let questionData;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        questionData = JSON.parse(jsonMatch[0]);
        
        // Validate structure
        if (!questionData.question || !questionData.options || !Array.isArray(questionData.options)) {
          throw new Error("Invalid question structure");
        }
        
        // Ensure 4 options
        if (questionData.options.length < 4) {
          questionData.options.push(...["Otro", "No aplica"].slice(0, 4 - questionData.options.length));
        } else if (questionData.options.length > 4) {
          questionData.options = questionData.options.slice(0, 4);
        }
      } else {
        throw new Error("No JSON found");
      }
    } catch (parseError) {
      console.error("Error parsing AI response:", parseError, content);
      const existingCategories = new Set<string>(existingInsights.map((i: any) => i.category as string));
      questionData = getFallbackQuestion(businessType, existingInsights.length, existingCategories);
    }

    console.log(`[generate-question] Generated: "${questionData.question}" [${questionData.category}] for ${businessType}`);

    return new Response(
      JSON.stringify({ question: questionData }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("generate-question error:", error);
    const fallback = getFallbackQuestion("default", 0, new Set());
    return new Response(
      JSON.stringify({ question: fallback }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
