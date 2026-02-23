import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const DIMENSIONS = ['reputation', 'profitability', 'finances', 'efficiency', 'traffic', 'team', 'growth'] as const;
const CATEGORIES = ['identity', 'operation', 'sales', 'finance', 'team', 'marketing', 'reputation', 'goals'] as const;

// Dimension distribution rules
const DIMENSION_DISTRIBUTION = {
  quick: { min: 1, max: 3 }, // Each dimension: 1-3 questions in quick mode (7 dims × ~2 = 14)
  complete: { min: 7, max: 13 }, // Each dimension: 7-13 questions in complete mode (7 dims × ~10 = 70)
};

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
      setupMode,
      businessName,
      googleAddress,
      rawUserText,
      universalProfile,
      previousAnswers, // For learning/adaptation
    } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const isQuick = setupMode === 'quick';
    const questionCount = isQuick ? '12-15' : '65-75';
    const lang = countryCode === 'BR' ? 'pt-BR' : 'es';
    const voiceStyle = countryCode === 'BR' ? 'você (tuteo brasileiro)' : (countryCode === 'AR' || countryCode === 'UY') ? 'vos (voseo rioplatense)' : 'tú (tuteo)';

    const contextParts = [
      `Tipo de negocio/servicio/profesión: ${businessTypeLabel || businessTypeId}`,
      `Sector/Industria: ${areaId}`,
      `País: ${countryCode}`,
      businessName ? `Nombre del negocio: ${businessName}` : '',
      googleAddress ? `Ubicación: ${googleAddress}` : '',
      rawUserText ? `Descripción libre del usuario sobre su negocio: "${rawUserText}"` : '',
      universalProfile?.keywords ? `Keywords del perfil: ${universalProfile.keywords.join(', ')}` : '',
      universalProfile?.success_metrics ? `Métricas de éxito relevantes: ${universalProfile.success_metrics.join(', ')}` : '',
      universalProfile?.main_pains ? `Dolores/problemas principales: ${universalProfile.main_pains.join(', ')}` : '',
      universalProfile?.user_goals ? `Objetivos del usuario: ${universalProfile.user_goals.join(', ')}` : '',
      universalProfile?.opportunity_angles ? `Ángulos de oportunidad: ${universalProfile.opportunity_angles.join(', ')}` : '',
      universalProfile?.subtype_label ? `Subtipo específico: ${universalProfile.subtype_label}` : '',
    ].filter(Boolean).join('\n');

    // Learning context from previous interactions
    const learningContext = previousAnswers && Object.keys(previousAnswers).length > 0
      ? `\n\nCONTEXTO DE APRENDIZAJE - El usuario ya respondió estas preguntas previamente. Usa esta información para hacer preguntas MÁS PROFUNDAS y ESPECÍFICAS, NO repitas temas ya cubiertos:\n${JSON.stringify(previousAnswers, null, 2)}`
      : '';

    const dimDist = DIMENSION_DISTRIBUTION[isQuick ? 'quick' : 'complete'];

    const systemPrompt = `Eres el motor de diagnóstico empresarial más avanzado del mundo. Tu tarea es generar un cuestionario de EXACTAMENTE ${questionCount} preguntas ULTRA-PERSONALIZADAS para evaluar la salud integral de un negocio/servicio/profesión.

OBJETIVO ESTRATÉGICO:
Estas preguntas construyen el "Cerebro del Negocio" - un modelo de inteligencia que luego genera misiones, predicciones, radar de oportunidades y análisis de salud. Cada pregunta DEBE aportar datos accionables que alimenten decisiones estratégicas reales.

LAS 7 DIMENSIONES DE SALUD (COBERTURA OBLIGATORIA BALANCEADA):
Cada dimensión DEBE tener entre ${dimDist.min} y ${dimDist.max} preguntas:

1. 👥 TRÁFICO (traffic) - Flujo de clientes/usuarios, canales de captación, horarios/momentos pico, estacionalidad, conversión de leads
2. 💰 RENTABILIDAD (profitability) - Márgenes, pricing, costos variables, rentabilidad por producto/servicio, ticket promedio
3. 🤝 EQUIPO (team) - Personal, productividad, roles, capacitación, rotación, cultura, satisfacción del equipo
4. 📊 FINANZAS (finances) - Control de costos fijos, flujo de caja, deudas, inversión, control financiero, facturación
5. ⚙️ EFICIENCIA (efficiency) - Operación, tiempos de servicio/entrega, gestión de recursos, procesos, tecnología
6. 📈 CRECIMIENTO (growth) - Expansión, nuevos mercados, innovación, escalabilidad, diversificación, objetivos
7. ⭐ REPUTACIÓN (reputation) - Reviews, ratings, percepción de marca, fidelización, NPS, presencia digital

REGLAS CRÍTICAS DE PERSONALIZACIÓN:
1. Las preguntas DEBEN ser 100% específicas para "${businessTypeLabel}". Prohibido preguntas genéricas que sirvan para cualquier negocio.
2. Usa terminología propia del sector. Ejemplo: para un restaurante → "food cost", para un abogado → "cartera de clientes", para un ecommerce → "tasa de conversión", para un médico → "obras sociales/seguros".
3. Las opciones de respuesta deben reflejar la REALIDAD del sector con rangos y valores reales del mercado.
4. Adapta las preguntas al PAÍS (${countryCode}): regulaciones locales, plataformas populares, moneda, cultura de negocio.
5. Usar ${voiceStyle} en idioma ${lang}. Tono: profesional pero cercano, como un consultor experto hablando con el dueño.

REGLAS DE CALIDAD:
- Cada pregunta debe generar un DATO ACCIONABLE, no solo información descriptiva
- Las opciones deben tener impactScore diferenciado (1-10): opciones positivas = 8-10, neutras = 4-6, negativas/riesgosas = 1-3
- Incluir preguntas de "pain points" específicos del sector
- Incluir preguntas sobre tecnología/herramientas específicas del sector
- Incluir preguntas sobre métricas clave del sector (KPIs propios)
- Las preguntas numéricas deben tener rangos realistas para el sector y país

TIPOS DE INPUT:
- "single": Selección única (3-6 opciones con emoji, label bilingüe, impactScore)
- "multi": Selección múltiple (3-6 opciones con emoji, label bilingüe)
- "number": Valor numérico (incluir unit)
- "slider": Rango deslizable (incluir min, max, unit)
- "text": Respuesta abierta (solo para preguntas donde las opciones no cubren la variedad)
- "money": Valor monetario (incluir unit con moneda local)

DISTRIBUCIÓN POR CATEGORÍA:
- identity: Posicionamiento, diferenciación, propuesta de valor
- operation: Procesos, capacidad operativa, tiempos
- sales: Ventas, conversión, canales, pricing
- finance: Costos, márgenes, flujo de caja
- team: Recursos humanos, roles, capacitación
- marketing: Adquisición, retención, canales de marketing
- reputation: Reseñas, percepción, marca
- goals: Objetivos, metas, visión a futuro

FORMATO:
- id: Q_AI_XXX (número secuencial)
- weight: 1-10 (importancia para su dimensión)
- required: true para preguntas estratégicas clave, false para complementarias
- mode: "${isQuick ? 'quick' : 'complete'}" o "both"
${learningContext}

ERRORES A EVITAR:
- NO hacer preguntas sobre temas irrelevantes para el tipo de negocio
- NO usar lenguaje corporativo genérico ("optimizar procesos", "mejorar la eficiencia")
- NO repetir el mismo concepto en diferentes preguntas
- NO hacer preguntas cuya respuesta sea obvia
- NO usar opciones con impactScore todos iguales
- GARANTIZAR que TODAS las 7 dimensiones tengan la cobertura requerida (${dimDist.min}-${dimDist.max} preguntas cada una)`;

    const userPrompt = `Genera EXACTAMENTE ${questionCount} preguntas para este negocio/servicio/profesión:

${contextParts}

RECORDATORIO FINAL:
- Distribución balanceada: cada una de las 7 dimensiones (traffic, profitability, team, finances, efficiency, growth, reputation) debe tener entre ${dimDist.min} y ${dimDist.max} preguntas
- Total: ${questionCount} preguntas exactas
- Idioma: ${lang} con ${voiceStyle}
- 100% específico para "${businessTypeLabel}"

Responde usando la función generate_questions.`;

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
              description: `Generate exactly ${questionCount} ultra-personalized diagnostic questions for "${businessTypeLabel}" covering all 7 health dimensions with balanced distribution.`,
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

    // Validate dimension coverage
    const dimensionCounts: Record<string, number> = {};
    for (const dim of DIMENSIONS) dimensionCounts[dim] = 0;
    for (const q of validQuestions) {
      if (q.dimension && dimensionCounts[q.dimension] !== undefined) {
        dimensionCounts[q.dimension]++;
      }
    }
    
    const missingDimensions = DIMENSIONS.filter(d => dimensionCounts[d] === 0);

    console.log(`Generated ${validQuestions.length} questions for "${businessTypeLabel}" (${setupMode})`);
    console.log('Dimension coverage:', dimensionCounts);
    if (missingDimensions.length > 0) {
      console.warn('Missing dimensions:', missingDimensions);
    }

    return new Response(JSON.stringify({ 
      questions: validQuestions,
      meta: {
        businessType: businessTypeLabel,
        mode: setupMode,
        count: validQuestions.length,
        dimensionCoverage: dimensionCounts,
        missingDimensions,
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
