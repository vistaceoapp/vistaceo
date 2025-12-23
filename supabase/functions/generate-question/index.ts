import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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
];

const SYSTEM_PROMPT = `Eres el CEO virtual más inteligente del mundo para negocios gastronómicos. Tu misión es CONOCER PROFUNDAMENTE el negocio para dar recomendaciones ULTRA PERSONALIZADAS.

🎯 TU OBJETIVO: Hacer preguntas ESTRATÉGICAS que revelen información ACCIONABLE.

📋 REGLAS ESTRICTAS:
1. Pregunta UNA cosa específica que ayude a entender el negocio profundamente
2. Las opciones deben ser 4, muy concretas y mutuamente excluyentes
3. NUNCA repitas preguntas ya hechas (se te dan las anteriores)
4. Cada pregunta debe tener un PROPÓSITO CLARO para mejorar las recomendaciones
5. Adapta el lenguaje al país (Argentina=vos, México=tú)
6. Si hay pocos datos, pregunta cosas básicas primero
7. Si hay muchos datos, pregunta cosas más específicas y estratégicas

🧠 TIPOS DE PREGUNTAS INTELIGENTES:
- DIAGNÓSTICO: "¿Cuál es tu mayor dolor operativo ahora mismo?"
- BENCHMARK: "¿Cómo te comparás con tu competencia directa en X?"
- OPORTUNIDAD: "¿Qué servicio te piden clientes que hoy no ofrecés?"
- FINANCIERO: "¿Cuál es tu margen aproximado por plato?"
- EQUIPO: "¿Tu equipo puede tomar decisiones sin consultarte?"
- TECNOLOGÍA: "¿Qué proceso te gustaría automatizar primero?"

⚠️ NUNCA hagas preguntas:
- Vagas o filosóficas
- Que ya fueron respondidas
- Sin impacto claro en las recomendaciones

📤 FORMATO JSON OBLIGATORIO:
{
  "question": "Pregunta directa y específica (máx 80 chars)",
  "options": ["Opción clara 1", "Opción clara 2", "Opción clara 3", "Opción clara 4"],
  "category": "operaciones|equipo|clientes|marketing|finanzas|producto|tecnologia|competencia|proveedores|ubicacion",
  "impact": "Cómo usaré esta info para ayudarte (máx 50 chars)"
}`;

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
      checkinsRes, 
      actionsRes, 
      missionsRes,
      externalDataRes,
      lessonsRes
    ] = await Promise.all([
      supabase.from("businesses").select("*").eq("id", businessId).single(),
      supabase
        .from("checkins")
        .select("traffic_level, slot, notes, created_at")
        .eq("business_id", businessId)
        .order("created_at", { ascending: false })
        .limit(20),
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
        .from("external_data")
        .select("data_type, content, sentiment_score")
        .eq("business_id", businessId)
        .order("created_at", { ascending: false })
        .limit(30),
      supabase
        .from("lessons")
        .select("content, category, importance")
        .eq("business_id", businessId)
        .order("importance", { ascending: false })
        .limit(10),
    ]);

    return {
      business: businessRes.data,
      checkins: checkinsRes.data || [],
      actions: actionsRes.data || [],
      missions: missionsRes.data || [],
      externalData: externalDataRes.data || [],
      lessons: lessonsRes.data || [],
    };
  } catch (error) {
    console.error("Error fetching context:", error);
    return null;
  }
}

function buildPrompt(context: any, existingInsights: any[]): string {
  let prompt = "";
  
  // Business basics
  if (context?.business) {
    prompt += `📊 NEGOCIO:
- Nombre: ${context.business.name || "Sin nombre"}
- Tipo: ${formatCategory(context.business.category)}
- País: ${formatCountry(context.business.country)}
- Rating promedio: ${context.business.avg_rating || "No disponible"}
- Ticket promedio: ${context.business.avg_ticket ? `$${context.business.avg_ticket}` : "No disponible"}
`;
  }

  // Insights already collected - CRITICAL to not repeat
  if (existingInsights.length > 0) {
    prompt += `\n🚫 PREGUNTAS YA RESPONDIDAS (NO repetir ninguna):\n`;
    existingInsights.forEach((insight: any) => {
      prompt += `• [${insight.category}] "${insight.question}" → "${insight.answer}"\n`;
    });

    // Analyze patterns in answers
    const categoryCount = new Map<string, number>();
    existingInsights.forEach((i: any) => {
      categoryCount.set(i.category, (categoryCount.get(i.category) || 0) + 1);
    });
    
    prompt += `\n📈 DISTRIBUCIÓN DE CONOCIMIENTO:\n`;
    QUESTION_CATEGORIES.forEach(cat => {
      const count = categoryCount.get(cat) || 0;
      const bar = "█".repeat(Math.min(count, 10)) + "░".repeat(Math.max(0, 10 - count));
      prompt += `${cat}: ${bar} (${count})\n`;
    });
  }

  // Recent activity signals
  if (context?.checkins?.length > 0) {
    const avgTraffic = context.checkins.reduce((sum: number, c: any) => sum + (c.traffic_level || 0), 0) / context.checkins.length;
    prompt += `\n🚦 TRÁFICO RECIENTE: Promedio ${avgTraffic.toFixed(1)}/5\n`;
    
    // Find patterns in notes
    const notes = context.checkins.filter((c: any) => c.notes).map((c: any) => c.notes).slice(0, 5);
    if (notes.length > 0) {
      prompt += `Notas recientes: ${notes.join(" | ")}\n`;
    }
  }

  // External data signals (reviews, social, etc)
  if (context?.externalData?.length > 0) {
    const reviews = context.externalData.filter((d: any) => d.data_type === "review");
    if (reviews.length > 0) {
      const avgSentiment = reviews.reduce((sum: number, r: any) => sum + (r.sentiment_score || 0), 0) / reviews.length;
      prompt += `\n⭐ RESEÑAS: ${reviews.length} reseñas, sentimiento promedio: ${avgSentiment.toFixed(1)}/10\n`;
      
      // Sample some review content
      const recentReviews = reviews.slice(0, 3).map((r: any) => {
        const content = r.content as Record<string, any>;
        return content?.text || content?.comment || "";
      }).filter(Boolean);
      if (recentReviews.length > 0) {
        prompt += `Comentarios recientes: "${recentReviews.join('" | "')}"\n`;
      }
    }
  }

  // Lessons learned
  if (context?.lessons?.length > 0) {
    prompt += `\n💡 LECCIONES APRENDIDAS:\n`;
    context.lessons.slice(0, 5).forEach((l: any) => {
      prompt += `• ${l.content}\n`;
    });
  }

  // Actions performance
  if (context?.actions?.length > 0) {
    const completed = context.actions.filter((a: any) => a.status === "completed").length;
    const total = context.actions.length;
    prompt += `\n✅ ACCIONES: ${completed}/${total} completadas\n`;
    
    // Categories where they're active
    const actionCategories = [...new Set(context.actions.map((a: any) => a.category).filter(Boolean))];
    if (actionCategories.length > 0) {
      prompt += `Áreas de enfoque: ${actionCategories.join(", ")}\n`;
    }
  }

  // Time context
  const now = new Date();
  const hour = now.getHours();
  const dayOfWeek = now.toLocaleDateString("es", { weekday: "long" });
  const isWeekend = now.getDay() === 0 || now.getDay() === 6;
  
  prompt += `\n⏰ CONTEXTO TEMPORAL:
- Día: ${dayOfWeek}
- Hora: ${hour}:00
- Es fin de semana: ${isWeekend ? "Sí" : "No"}
`;

  // Intelligence level
  const insightCount = existingInsights.length;
  let intelligenceNote = "";
  if (insightCount < 5) {
    intelligenceNote = "🔴 NIVEL BAJO - Haz preguntas BÁSICAS primero (tipo de negocio, equipo, clientes principales)";
  } else if (insightCount < 15) {
    intelligenceNote = "🟡 NIVEL MEDIO - Ya conocemos lo básico, pregunta sobre OPERACIONES y DESAFÍOS";
  } else if (insightCount < 30) {
    intelligenceNote = "🟢 NIVEL BUENO - Profundiza en ESTRATEGIA, COMPETENCIA y CRECIMIENTO";
  } else {
    intelligenceNote = "🔵 NIVEL EXPERTO - Haz preguntas MUY ESPECÍFICAS y estratégicas sobre optimización";
  }
  
  prompt += `\n🧠 INTELIGENCIA: ${intelligenceNote}\n`;

  prompt += `\n🎯 GENERA UNA PREGUNTA ESTRATÉGICA QUE AÚN NO SE HAYA HECHO Y QUE AYUDE A PERSONALIZAR LAS RECOMENDACIONES.`;

  return prompt;
}

function formatCategory(category: string | null): string {
  const categories: Record<string, string> = {
    cafeteria: "Cafetería",
    bar: "Bar",
    restaurant: "Restaurante",
    fast_casual: "Fast Casual",
    heladeria: "Heladería",
    panaderia: "Panadería",
    dark_kitchen: "Dark Kitchen",
  };
  return categories[category || ""] || "Restaurante";
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

// Smart fallback questions based on insight count
function getFallbackQuestion(insightCount: number, existingCategories: Set<string>) {
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
      options: ["Pasan caminando", "Redes sociales", "Recomendaciones", "Apps de delivery"],
      category: "marketing",
      impact: "Optimizar canales de adquisición",
    },
  ];

  const intermediateQuestions = [
    {
      question: "¿Con qué frecuencia actualizás tu menú?",
      options: ["Nunca", "Una vez al año", "Cada temporada", "Mensualmente"],
      category: "producto",
      impact: "Sugerir estrategias de innovación",
    },
    {
      question: "¿Cómo manejás las quejas de clientes?",
      options: ["No tengo protocolo", "Respondo cuando puedo", "Tengo un proceso", "Equipo dedicado"],
      category: "clientes",
      impact: "Mejorar tu reputación y retención",
    },
    {
      question: "¿Cuánto tiempo tardás en servir un pedido?",
      options: ["Menos de 10 min", "10-20 minutos", "20-30 minutos", "Más de 30 min"],
      category: "operaciones",
      impact: "Optimizar tiempos de servicio",
    },
  ];

  const advancedQuestions = [
    {
      question: "¿Qué porcentaje de tus ventas es por delivery?",
      options: ["Menos del 10%", "10-30%", "30-50%", "Más del 50%"],
      category: "marketing",
      impact: "Optimizar canales de venta",
    },
    {
      question: "¿Conocés tu costo por plato en detalle?",
      options: ["No lo calculo", "Aproximado", "Lo calculo bien", "Sistema automatizado"],
      category: "finanzas",
      impact: "Mejorar márgenes de ganancia",
    },
    {
      question: "¿Qué hace tu competencia que vos no?",
      options: ["Mejor marketing", "Más variedad", "Mejores precios", "Mejor servicio"],
      category: "competencia",
      impact: "Identificar oportunidades de mejora",
    },
  ];

  // Select based on knowledge level
  let questions;
  if (insightCount < 5) {
    questions = basicQuestions;
  } else if (insightCount < 15) {
    questions = [...basicQuestions, ...intermediateQuestions];
  } else {
    questions = [...intermediateQuestions, ...advancedQuestions];
  }

  // Filter out already asked categories if possible
  const available = questions.filter(q => !existingCategories.has(q.category));
  if (available.length > 0) {
    return available[Math.floor(Math.random() * available.length)];
  }

  return questions[Math.floor(Math.random() * questions.length)];
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { businessId, category } = await req.json();
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

    console.log(`[generate-question] Business: ${businessId}, Insights: ${existingInsights.length}`);

    // Build rich prompt
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
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: contextPrompt },
        ],
        temperature: 0.8,
        max_tokens: 300,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);

      if (response.status === 429 || response.status === 402) {
        const existingCategories = new Set<string>(existingInsights.map((i: any) => i.category as string));
        const fallback = getFallbackQuestion(existingInsights.length, existingCategories);
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
      questionData = getFallbackQuestion(existingInsights.length, existingCategories);
    }

    console.log(`[generate-question] Generated: "${questionData.question}" [${questionData.category}]`);

    return new Response(
      JSON.stringify({ question: questionData }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("generate-question error:", error);
    const fallback = getFallbackQuestion(0, new Set());
    return new Response(
      JSON.stringify({ question: fallback }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
