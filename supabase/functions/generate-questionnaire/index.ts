import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { ANTI_GENERIC_SYSTEM } from "../_shared/brain-core/anti-generic-prompt.ts";
import { buildTerminologyContext } from "../_shared/brain-core/contextual-terminology.ts";
import { prompt2Rules, isGenericDirectQuestion } from "../_shared/brain-core/prompt2-rules.ts";
import { extremeQualityCheck } from "../_shared/brain-core/extreme-quality-gate.ts";

// Patrones extra de preguntas genéricas detectadas en runtime (más amplios que los del prompt2-rules,
// que sólo cubren el comienzo exacto). Cubrimos variantes "¿Qué te diferencia de la competencia?",
// "Cuéntanos sobre tu negocio", etc.
const RUNTIME_GENERIC_QUESTION_PATTERNS: RegExp[] = [
  /\bqu[eé]\s+vendes\b/i,
  /\ba\s+qui[eé]n\s+(le\s+)?vendes\b/i,
  /\bcu[aá]l\s+es\s+tu\s+negocio\b/i,
  /\bcu[eé]ntanos?\s+(sobre|de)\s+tu\s+negocio\b/i,
  /\bdescr[ií]benos?\s+tu\s+negocio\b/i,
  /\bcu[aá]l\s+es\s+tu\s+objetivo\b/i,
  /\bcu[aá]l\s+es\s+tu\s+(mayor|principal)\s+problema\b/i,
  /\bqu[eé]\s+quieres\s+mejorar\b/i,
  /\bc[oó]mo\s+(consigues|obtienes|captas)\s+clientes\b/i,
  /\bqu[eé]\s+te\s+diferencia\b/i,
  /\bcu[aá]l\s+es\s+tu\s+canal\s+principal\b/i,
  /\bcu[aá]l\s+es\s+tu\s+ticket\s+promedio\b/i,
  /\bc[oó]mo\s+describir[ií]as\s+tu\s+negocio\b/i,
  /\bqu[eé]\s+tipo\s+de\s+negocio\s+tienes\b/i,
];

function isGenericQuestionTitle(title: string): boolean {
  if (!title) return true;
  if (isGenericDirectQuestion(title)) return true;
  return RUNTIME_GENERIC_QUESTION_PATTERNS.some((rx) => rx.test(title));
}

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
      questionCount: questionCountOverride, // Override from progressive loading
      batchIndex = 0, // Which batch (0 = first)
    } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const isQuick = setupMode === 'quick';
    const questionCount = questionCountOverride || (isQuick ? '12-15' : '65-75');
    const lang = countryCode === 'BR' ? 'pt-BR' : 'es';
    const voiceStyle = countryCode === 'BR' ? 'você (tuteo brasileiro)' : (countryCode === 'AR' || countryCode === 'UY') ? 'vos (voseo rioplatense)' : 'tú (tuteo)';

    // For batch requests, adjust dimension distribution
    const batchQuestionCount = questionCountOverride 
      ? parseInt(questionCountOverride.split('-')[0]) 
      : (isQuick ? 14 : 70);

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

    const dimDist = questionCountOverride 
      ? { min: Math.max(1, Math.floor(batchQuestionCount / 7) - 1), max: Math.ceil(batchQuestionCount / 7) + 1 }
      : DIMENSION_DISTRIBUTION[isQuick ? 'quick' : 'complete'];

    // Use compact prompt for background batches (batchIndex > 0) for speed
    const isBackgroundBatch = batchIndex > 0;
    
    const systemPrompt = isBackgroundBatch 
      ? `Genera preguntas de diagnóstico para "${businessTypeLabel}" (${countryCode}). Idioma: ${lang}, voz: ${voiceStyle}.

DIMENSIONES (cobertura balanceada ${dimDist.min}-${dimDist.max} c/u): traffic, profitability, team, finances, efficiency, growth, reputation.

TIPOS: single (3-6 opciones con emoji/impactScore 1-10), multi, number, slider, text, money.
CATEGORÍAS: identity, operation, sales, finance, team, marketing, reputation, goals.

REGLAS ABSOLUTAS:
1. 100% específico para "${businessTypeLabel}". Terminología del sector.
2. TODO el texto DEBE estar en ${lang === 'pt-BR' ? 'portugués brasileño' : 'español'}. PROHIBIDO usar palabras en inglés. Ni en títulos, ni en opciones, ni en ayudas. Cero inglés.
3. En opciones de tipo single donde se pregunte por cantidad de clientes, empleados, etc: SIEMPRE incluir una opción para quien NO tiene (ej: "Todavía no tengo", "No aplica", "Recién empiezo"). 
4. Rangos realistas. Datos accionables.
5. Las preguntas deben ser gramaticalmente perfectas, claras y profesionales. Sin cortes, sin errores de redacción.
${learningContext}

Responde con generate_questions.`
      : `Eres el motor de diagnóstico empresarial más avanzado del mundo. Tu tarea es generar un cuestionario de EXACTAMENTE ${questionCount} preguntas ULTRA-PERSONALIZADAS para evaluar la salud integral de un negocio/servicio/profesión.

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
1. Las preguntas DEBEN ser 100% específicas para "${businessTypeLabel}". Prohibido preguntas genéricas.
2. Usa terminología propia del sector.
3. Las opciones de respuesta deben reflejar la REALIDAD del sector con rangos y valores reales del mercado.
4. Adapta las preguntas al PAÍS (${countryCode}).
5. Usar ${voiceStyle} en idioma ${lang}. Tono: profesional pero cercano.

REGLAS ABSOLUTAS DE IDIOMA Y CALIDAD:
6. TODO el texto DEBE estar en ${lang === 'pt-BR' ? 'portugués brasileño' : 'español'}. PROHIBIDO TERMINANTEMENTE usar palabras en inglés. Ni en títulos, ni en opciones, ni en textos de ayuda. CERO inglés. Ejemplos de lo que NO debe aparecer: "feedback", "marketing mix", "target", "branding", "check-in", "delivery", "staff", etc. Siempre usar el equivalente en español.
7. OPCIONES INCLUSIVAS PARA NEGOCIOS NUEVOS: En TODA pregunta tipo "single" donde se pregunte por cantidad de clientes, empleados, ventas, facturación o cualquier métrica operativa, SIEMPRE debe existir al menos una opción para negocios que recién arrancan o no tienen eso todavía. Ejemplos: "Todavía no tengo clientes", "Recién empiezo", "No aplica a mi caso", "Aún no lo mido". Esto es OBLIGATORIO.
8. CALIDAD DE REDACCIÓN: Las preguntas deben ser gramaticalmente perfectas, claras, completas y profesionales. Sin frases cortadas, sin errores de sintaxis, sin ambigüedades. Cada pregunta debe leerse como escrita por un consultor senior.

TIPOS DE INPUT:
- "single": Selección única (3-6 opciones con emoji, label bilingüe, impactScore)
- "multi": Selección múltiple (3-6 opciones con emoji, label bilingüe)
- "number": Valor numérico (incluir unit)
- "slider": Rango deslizable (incluir min, max, unit)
- "text": Respuesta abierta
- "money": Valor monetario (incluir unit con moneda local)

CATEGORÍAS: identity, operation, sales, finance, team, marketing, reputation, goals.

FORMATO:
- id: Q_AI_XXX (número secuencial)
- weight: 1-10 (importancia para su dimensión)
- required: true para preguntas estratégicas clave, false para complementarias
- mode: "${isQuick ? 'quick' : 'complete'}" o "both"
${learningContext}`;

    const userPrompt = isBackgroundBatch
      ? `Genera EXACTAMENTE ${questionCount} preguntas para "${businessTypeLabel}" (${areaId}, ${countryCode}). ${dimDist.min}-${dimDist.max} por dimensión. Usa generate_questions.`
      : `Genera EXACTAMENTE ${questionCount} preguntas para este negocio/servicio/profesión:

${contextParts}

RECORDATORIO FINAL:
- Distribución balanceada: cada una de las 7 dimensiones debe tener entre ${dimDist.min} y ${dimDist.max} preguntas
- Total: ${questionCount} preguntas exactas
- Idioma: ${lang} con ${voiceStyle}
- 100% específico para "${businessTypeLabel}"

Responde usando la función generate_questions.`;

    // Use fast model for all batches - quality comes from the structured prompt, not model tier
    const model = "google/gemini-2.5-flash-lite"; // Cost-optimized: structured question generation

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: `${systemPrompt}\n\n${ANTI_GENERIC_SYSTEM}\n\n${buildTerminologyContext({ activity: businessTypeLabel || null, country: countryCode || null, offer: null, customer: null, channel: null }).promptFragment}` },
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
    
    let questions: any[] = [];
    
    if (toolCall?.function?.arguments) {
      const parsed = JSON.parse(toolCall.function.arguments);
      questions = parsed.questions || [];
    } else {
      // Fallback: try to extract JSON from content (model returned text instead of tool call)
      const content = result.choices?.[0]?.message?.content || '';
      console.warn("No tool call, attempting content parse. Content length:", content.length);
      
      // Try to find JSON array in the content
      const jsonMatch = content.match(/\[\s*\{[\s\S]*\}\s*\]/);
      if (jsonMatch) {
        try {
          questions = JSON.parse(jsonMatch[0]);
        } catch { /* ignore parse error */ }
      }
      
      // If still no questions, try finding {questions: [...]} pattern
      if (questions.length === 0) {
        const objMatch = content.match(/\{[\s\S]*"questions"\s*:\s*\[[\s\S]*\][\s\S]*\}/);
        if (objMatch) {
          try {
            const obj = JSON.parse(objMatch[0]);
            questions = obj.questions || [];
          } catch { /* ignore */ }
        }
      }
      
      // If still empty, retry once with the main model
      if (questions.length === 0) {
        console.warn("Content parse failed, retrying with gemini-3-flash-preview");
        const retryResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${LOVABLE_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-2.5-flash-lite", // Cost-optimized: retry with same cheap model
            messages: [
              { role: "system", content: `${systemPrompt}\n\n${ANTI_GENERIC_SYSTEM}\n\n${buildTerminologyContext({ activity: businessTypeLabel || null, country: countryCode || null, offer: null, customer: null, channel: null }).promptFragment}` },
              { role: "user", content: userPrompt },
            ],
            tools: [
              {
                type: "function",
                function: {
                  name: "generate_questions",
                  description: `Generate exactly ${questionCount} ultra-personalized diagnostic questions.`,
                  parameters: {
                    type: "object",
                    properties: {
                      questions: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            id: { type: "string" },
                            category: { type: "string", enum: [...CATEGORIES] },
                            mode: { type: "string", enum: ["quick", "complete", "both"] },
                            dimension: { type: "string", enum: [...DIMENSIONS] },
                            weight: { type: "number", minimum: 1, maximum: 10 },
                            title: { type: "object", properties: { es: { type: "string" }, "pt-BR": { type: "string" } }, required: ["es", "pt-BR"] },
                            help: { type: "object", properties: { es: { type: "string" }, "pt-BR": { type: "string" } } },
                            type: { type: "string", enum: ["single", "multi", "number", "slider", "text", "money"] },
                            options: { type: "array", items: { type: "object", properties: { id: { type: "string" }, label: { type: "object", properties: { es: { type: "string" }, "pt-BR": { type: "string" } }, required: ["es", "pt-BR"] }, emoji: { type: "string" }, impactScore: { type: "number" } }, required: ["id", "label"] } },
                            min: { type: "number" }, max: { type: "number" }, unit: { type: "string" },
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

        if (retryResponse.ok) {
          const retryResult = await retryResponse.json();
          const retryToolCall = retryResult.choices?.[0]?.message?.tool_calls?.[0];
          if (retryToolCall?.function?.arguments) {
            const retryParsed = JSON.parse(retryToolCall.function.arguments);
            questions = retryParsed.questions || [];
          }
        }
        
        if (questions.length === 0) {
          throw new Error("No tool call response from AI after retry");
        }
      }
    }

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
