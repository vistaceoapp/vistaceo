import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const DIMENSIONS = ['reputation', 'profitability', 'finances', 'efficiency', 'traffic', 'team', 'growth'] as const;
const CATEGORIES = ['identity', 'operation', 'sales', 'finance', 'team', 'marketing', 'reputation', 'goals'] as const;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const {
      businessTypeLabel,
      businessTypeId,
      areaId,
      countryCode,
      setupMode, // 'quick' | 'complete'
      businessName,
      googleAddress,
      rawUserText,
      universalProfile,
    } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const isQuick = setupMode === 'quick';
    const questionCount = isQuick ? '12-15' : '65-75';
    const lang = countryCode === 'BR' ? 'pt-BR' : 'es';
    const voiceStyle = countryCode === 'BR' ? 'você (tuteo brasileiro)' : (countryCode === 'AR' || countryCode === 'UY') ? 'vos (voseo)' : 'tú (tuteo)';

    const contextParts = [
      `Tipo de negocio: ${businessTypeLabel || businessTypeId}`,
      `Sector: ${areaId}`,
      `País: ${countryCode}`,
      businessName ? `Nombre: ${businessName}` : '',
      googleAddress ? `Ubicación: ${googleAddress}` : '',
      rawUserText ? `Contexto adicional del usuario: "${rawUserText}"` : '',
      universalProfile?.keywords ? `Keywords del perfil: ${universalProfile.keywords.join(', ')}` : '',
      universalProfile?.success_metrics ? `Métricas de éxito: ${universalProfile.success_metrics.join(', ')}` : '',
      universalProfile?.main_pains ? `Dolores principales: ${universalProfile.main_pains.join(', ')}` : '',
      universalProfile?.user_goals ? `Objetivos del usuario: ${universalProfile.user_goals.join(', ')}` : '',
    ].filter(Boolean).join('\n');

    const systemPrompt = `Eres un experto en diagnóstico de negocios, empresas, servicios y profesiones independientes. 
Tu tarea es generar un cuestionario de ${questionCount} preguntas ULTRA-PERSONALIZADO para evaluar la salud y situación actual de un negocio/servicio/profesión específico.

REGLAS CRÍTICAS:
1. Las preguntas DEBEN ser específicas para este tipo exacto de negocio/servicio/profesión. NO preguntas genéricas.
2. Cada pregunta debe tener un impacto medible en una de estas 7 dimensiones: ${DIMENSIONS.join(', ')}
3. Cada pregunta debe pertenecer a una de estas categorías: ${CATEGORIES.join(', ')}
4. Usar ${voiceStyle} en idioma ${lang}
5. Las preguntas deben cubrir TODAS las 7 dimensiones de manera balanceada
6. Tipos de input permitidos: "single" (opciones únicas), "multi" (selección múltiple), "number", "slider", "text", "money"
7. Para "single" y "multi": incluir 3-6 opciones con emoji y label en es y pt-BR
8. Para "slider": incluir min, max, unit
9. Para "number"/"money": incluir unit si aplica
10. Cada pregunta DEBE tener un id único (formato: Q_AI_XXX donde XXX es un número)
11. El campo "required" debe ser true para preguntas importantes y false para las opcionales
12. Modo: ${isQuick ? 'RÁPIDO - Solo preguntas esenciales, las más importantes para un diagnóstico inicial rápido' : 'COMPLETO - Cuestionario exhaustivo que toque todos los aspectos del negocio en profundidad'}
13. Para modo ${isQuick ? 'rápido, usar mode: "quick" o "both"' : 'completo, usar mode: "complete" o "both"'}
14. weight: 1-10, qué tan importante es la pregunta para su dimensión

IMPORTANTE: Las preguntas deben ser RELEVANTES y ESPECÍFICAS. 
- Para un abogado: preguntar sobre cartera de clientes, tipos de casos, tarifas por hora, etc.
- Para un restaurante: preguntar sobre tipo de cocina, ticket promedio, delivery, etc.
- Para un ecommerce: preguntar sobre plataforma, tasa de conversión, logística, etc.
- Para un consultorio médico: preguntar sobre especialidades, turnos, obras sociales, etc.

NO hacer preguntas que no tengan sentido para el tipo de negocio.`;

    const userPrompt = `Genera el cuestionario para este negocio/servicio/profesión:

${contextParts}

Responde ÚNICAMENTE con el JSON array de preguntas. Usa tool calling.`;

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
          { role: "user", content: userPrompt },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "generate_questions",
              description: `Generate ${questionCount} personalized diagnostic questions for this specific business type.`,
              parameters: {
                type: "object",
                properties: {
                  questions: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        id: { type: "string", description: "Unique ID like Q_AI_001" },
                        category: { type: "string", enum: [...CATEGORIES] },
                        mode: { type: "string", enum: ["quick", "complete", "both"] },
                        dimension: { type: "string", enum: [...DIMENSIONS] },
                        weight: { type: "number", minimum: 1, maximum: 10 },
                        title: {
                          type: "object",
                          properties: {
                            es: { type: "string" },
                            "pt-BR": { type: "string" },
                          },
                          required: ["es", "pt-BR"],
                        },
                        help: {
                          type: "object",
                          properties: {
                            es: { type: "string" },
                            "pt-BR": { type: "string" },
                          },
                        },
                        type: { type: "string", enum: ["single", "multi", "number", "slider", "text", "money"] },
                        options: {
                          type: "array",
                          items: {
                            type: "object",
                            properties: {
                              id: { type: "string" },
                              label: {
                                type: "object",
                                properties: {
                                  es: { type: "string" },
                                  "pt-BR": { type: "string" },
                                },
                                required: ["es", "pt-BR"],
                              },
                              emoji: { type: "string" },
                              impactScore: { type: "number" },
                            },
                            required: ["id", "label"],
                          },
                        },
                        min: { type: "number" },
                        max: { type: "number" },
                        unit: { type: "string" },
                        required: { type: "boolean" },
                      },
                      required: ["id", "category", "mode", "dimension", "weight", "title", "type"],
                    },
                  },
                },
                required: ["questions"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "generate_questions" } },
        temperature: 0.4,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited, please try again" }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required" }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI error:", response.status, t);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const result = await response.json();
    const toolCall = result.choices?.[0]?.message?.tool_calls?.[0];
    
    if (!toolCall?.function?.arguments) {
      throw new Error("No tool call response from AI");
    }

    const parsed = JSON.parse(toolCall.function.arguments);
    const questions = parsed.questions || [];

    // Validate and sanitize questions
    const validQuestions = questions
      .filter((q: any) => q.id && q.title?.es && q.type)
      .map((q: any, i: number) => ({
        ...q,
        id: q.id || `Q_AI_${String(i + 1).padStart(3, '0')}`,
        required: q.required !== false,
        weight: Math.max(1, Math.min(10, q.weight || 5)),
        // Ensure pt-BR exists
        title: {
          es: q.title.es,
          'pt-BR': q.title['pt-BR'] || q.title.es,
        },
        help: q.help ? {
          es: q.help.es || '',
          'pt-BR': q.help['pt-BR'] || q.help.es || '',
        } : undefined,
        options: q.options?.map((opt: any) => ({
          ...opt,
          label: {
            es: opt.label?.es || opt.label || '',
            'pt-BR': opt.label?.['pt-BR'] || opt.label?.es || opt.label || '',
          },
        })),
      }));

    console.log(`Generated ${validQuestions.length} questions for ${businessTypeLabel} (${setupMode})`);

    return new Response(JSON.stringify({ 
      questions: validQuestions,
      meta: {
        businessType: businessTypeLabel,
        mode: setupMode,
        count: validQuestions.length,
        generated_at: new Date().toISOString(),
      }
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (e) {
    console.error("generate-questionnaire error:", e);
    return new Response(JSON.stringify({ 
      error: e instanceof Error ? e.message : "Unknown error",
      questions: [],
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
