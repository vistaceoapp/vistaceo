import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Categories of questions to ask
const QUESTION_CATEGORIES = [
  "operaciones",
  "equipo", 
  "clientes",
  "marketing",
  "finanzas",
  "producto",
  "tecnologia",
  "competencia",
];

const SYSTEM_PROMPT = `Eres un consultor de negocios gastronómicos experto. Tu tarea es generar UNA micro-pregunta muy específica para conocer mejor el negocio.

REGLAS ESTRICTAS:
1. La pregunta debe ser de respuesta rápida (menos de 10 segundos)
2. Las opciones deben ser entre 3 y 5, concretas y fáciles de elegir
3. La pregunta debe ser útil para personalizar recomendaciones futuras
4. NO repitas preguntas que ya se hicieron (se te darán las anteriores)
5. Adapta la pregunta al tipo de negocio y país
6. Incluye siempre el impacto: por qué esta info es valiosa

FORMATO JSON OBLIGATORIO:
{
  "question": "¿Pregunta concisa? (máx 60 caracteres)",
  "options": ["Opción 1", "Opción 2", "Opción 3"],
  "category": "operaciones|equipo|clientes|marketing|finanzas|producto|tecnologia|competencia",
  "impact": "Para qué usaremos esta información (máx 40 chars)"
}`;

// Fetch existing insights to avoid repeating questions
async function fetchExistingInsights(supabase: any, businessId: string) {
  try {
    const { data, error } = await supabase
      .from("business_insights")
      .select("question, category, answer")
      .eq("business_id", businessId)
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching insights:", error);
    return [];
  }
}

// Fetch business data for context
async function fetchBusinessContext(supabase: any, businessId: string) {
  try {
    const [businessRes, checkinsRes, actionsRes] = await Promise.all([
      supabase.from("businesses").select("*").eq("id", businessId).single(),
      supabase
        .from("checkins")
        .select("traffic_level, slot")
        .eq("business_id", businessId)
        .order("created_at", { ascending: false })
        .limit(10),
      supabase
        .from("daily_actions")
        .select("category, status")
        .eq("business_id", businessId)
        .limit(10),
    ]);

    return {
      business: businessRes.data,
      checkins: checkinsRes.data || [],
      actions: actionsRes.data || [],
    };
  } catch (error) {
    console.error("Error fetching context:", error);
    return null;
  }
}

function buildPrompt(context: any, existingInsights: any[], categoryFocus?: string): string {
  let prompt = "";
  
  if (context?.business) {
    prompt += `NEGOCIO: ${context.business.name || "Sin nombre"}
TIPO: ${context.business.category || "restaurant"}
PAÍS: ${context.business.country || "AR"}
`;
  }

  // Add existing insights summary
  if (existingInsights.length > 0) {
    prompt += "\nPREGUNTAS YA RESPONDIDAS (NO repetir):\n";
    existingInsights.slice(0, 20).forEach((insight: any) => {
      prompt += `- [${insight.category}] ${insight.question}: ${insight.answer}\n`;
    });
  }

  // Identify gaps in knowledge
  const answeredCategories = new Map<string, number>();
  existingInsights.forEach((insight: any) => {
    const count = answeredCategories.get(insight.category) || 0;
    answeredCategories.set(insight.category, count + 1);
  });

  const gapCategories = QUESTION_CATEGORIES.filter(cat => 
    (answeredCategories.get(cat) || 0) < 3
  );

  if (gapCategories.length > 0 && !categoryFocus) {
    prompt += `\nCATEGORÍAS PRIORITARIAS (pocas respuestas): ${gapCategories.join(", ")}`;
  }

  if (categoryFocus) {
    prompt += `\nENFOCATE EN: ${categoryFocus}`;
  }

  // Add time context
  const hour = new Date().getHours();
  const dayOfWeek = new Date().toLocaleDateString("es", { weekday: "long" });
  prompt += `\n\nCONTEXTO: ${dayOfWeek}, ${hour}:00 hrs`;

  return prompt;
}

// Fallback questions when AI fails
const FALLBACK_QUESTIONS = [
  {
    question: "¿Cuántos empleados trabajan contigo?",
    options: ["Solo yo", "1-3", "4-10", "Más de 10"],
    category: "equipo",
    impact: "Adaptar recomendaciones al tamaño",
  },
  {
    question: "¿Cuál es tu mayor desafío esta semana?",
    options: ["Ventas bajas", "Falta de personal", "Costos altos", "Tiempo"],
    category: "operaciones",
    impact: "Priorizar acciones según tu necesidad",
  },
  {
    question: "¿Qué canal de ventas te genera más ingresos?",
    options: ["Local", "Delivery apps", "Propio online", "Eventos"],
    category: "marketing",
    impact: "Optimizar canales más rentables",
  },
  {
    question: "¿Cada cuánto actualizas tu menú?",
    options: ["Nunca", "Anual", "Temporada", "Mensual"],
    category: "producto",
    impact: "Sugerir estrategias de innovación",
  },
  {
    question: "¿Cómo manejas las reseñas negativas?",
    options: ["No respondo", "A veces", "Siempre respondo", "Tengo protocolo"],
    category: "clientes",
    impact: "Mejorar reputación online",
  },
];

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

    // Fetch context
    const [existingInsights, context] = await Promise.all([
      fetchExistingInsights(supabase, businessId),
      fetchBusinessContext(supabase, businessId),
    ]);

    console.log(`Generating question for business ${businessId}, existing insights: ${existingInsights.length}`);

    // Build prompt
    const contextPrompt = buildPrompt(context, existingInsights, category);

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
        temperature: 0.9,
        max_tokens: 256,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);

      if (response.status === 429 || response.status === 402) {
        // Return a fallback question
        const fallback = FALLBACK_QUESTIONS[Math.floor(Math.random() * FALLBACK_QUESTIONS.length)];
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
      } else {
        throw new Error("No JSON found");
      }
    } catch (parseError) {
      console.error("Error parsing response:", parseError);
      // Use fallback
      questionData = FALLBACK_QUESTIONS[Math.floor(Math.random() * FALLBACK_QUESTIONS.length)];
    }

    console.log("Generated question:", questionData.question);

    return new Response(
      JSON.stringify({ question: questionData }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("generate-question error:", error);
    // Return fallback on error
    const fallback = FALLBACK_QUESTIONS[Math.floor(Math.random() * FALLBACK_QUESTIONS.length)];
    return new Response(
      JSON.stringify({ question: fallback }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
