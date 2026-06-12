import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { ANTI_GENERIC_SYSTEM } from "../_shared/brain-core/anti-generic-prompt.ts";
import { buildTerminologyContext } from "../_shared/brain-core/contextual-terminology.ts";
import { prompt2Rules, isGenericDirectQuestion } from "../_shared/brain-core/prompt2-rules.ts";
import { extremeQualityCheck } from "../_shared/brain-core/extreme-quality-gate.ts";
import { validateQuestionServer, CLARIFY_OPTION } from "../_shared/questionnaire-gates.ts";


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
      existingTitles, // Titles already generated in earlier batches (anti-repetición)
    } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const isQuick = setupMode === 'quick';
    // ALIGNED: prompt ↔ HARD_CAP ↔ client cap. Calidad > cantidad.
    // Rápido: 8-10 preguntas. Completo: 23-25 preguntas (alta señal, baja fatiga).
    const questionCount = questionCountOverride || (isQuick ? '8-10' : '23-25');
    const lang = countryCode === 'BR' ? 'pt-BR' : 'es';
    const voiceStyle = countryCode === 'BR' ? 'você (tuteo brasileiro)' : (countryCode === 'AR' || countryCode === 'UY') ? 'vos (voseo rioplatense)' : 'tú (tuteo)';

    // For batch requests, adjust dimension distribution
    const batchQuestionCount = questionCountOverride 
      ? parseInt(questionCountOverride.split('-')[0]) 
      : (isQuick ? 10 : 25);

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

    // Anti-repetición entre micro-batches progresivos
    const dedupeContext = Array.isArray(existingTitles) && existingTitles.length > 0
      ? `\n\nPREGUNTAS YA GENERADAS EN BATCHES ANTERIORES (PROHIBIDO repetir estos temas o variantes cercanas):\n- ${existingTitles.slice(0, 40).join('\n- ')}`
      : '';

    const dimDist = questionCountOverride 
      ? { min: Math.max(1, Math.floor(batchQuestionCount / 7) - 1), max: Math.ceil(batchQuestionCount / 7) + 1 }
      : DIMENSION_DISTRIBUTION[isQuick ? 'quick' : 'complete'];

    // Use compact prompt for background batches AND small first micro-batches (speed)
    const isBackgroundBatch = batchIndex > 0 || batchQuestionCount <= 6;
    
    const systemPrompt = isBackgroundBatch 
      ? `Genera preguntas de diagnóstico ULTRA-PERSONALIZADAS para "${businessTypeLabel}" (${countryCode}). Idioma: ${lang}, voz: ${voiceStyle}.

CONTEXTO DEL NEGOCIO (úsalo en cada pregunta — no genéricas):
${contextParts}

DIMENSIONES (cobertura balanceada ${dimDist.min}-${dimDist.max} c/u): traffic, profitability, team, finances, efficiency, growth, reputation.

TIPOS PERMITIDOS: single (formato principal), multi (sólo si corresponde), number, slider, money. "text" sólo como excepción (≤10%).
CATEGORÍAS: identity, operation, sales, finance, team, marketing, reputation, goals.

REGLAS ABSOLUTAS:
1. 100% específico para "${businessTypeLabel}" usando el contexto del negocio arriba. Terminología real del sector.
2. TODO en ${lang === 'pt-BR' ? 'portugués brasileño' : 'español'}. CERO inglés en títulos, opciones o ayudas.
3. PREGUNTAS CORTAS: máximo 12 palabras. Una sola idea. PROHIBIDO "Ej:" en el título.
4. OPCIONES: EXACTAMENTE 4 ó 6 opciones por pregunta. NUNCA más de 6. Cada opción máx 4 palabras, primera letra MAYÚSCULA, sin punto final.
5. NO incluyas "No sé", "No aplica", "Otra", "Ninguna" como opciones. La UI los agrega aparte.
6. Para concepto difícil (flujo de caja, margen, ticket, conversión, recompra, capital de trabajo, etc.): completá "help" con UNA frase ≤120 chars que lo explique.
7. Datos accionables. Rangos realistas. Gramática perfecta.
8. NO repitas temas que ya están en el CONTEXTO DE APRENDIZAJE ni en PREGUNTAS YA GENERADAS. Profundizá en lo NO cubierto.
${learningContext}${dedupeContext}

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
7. CALIDAD DE REDACCIÓN: Las preguntas deben ser gramaticalmente perfectas, claras, completas y profesionales. Sin frases cortadas, sin errores de sintaxis, sin ambigüedades. Cada pregunta debe leerse como escrita por un consultor senior.

REGLAS DE SIMPLICIDAD (CRÍTICAS - NO NEGOCIABLES):
8. PREGUNTAS CORTAS: máximo 12 palabras por título. Una sola idea por pregunta. PROHIBIDO mezclar varias preguntas en una.
9. PROHIBIDO "Ej:", "Por ejemplo", "(ejemplo...)" dentro del título de la pregunta. Los ejemplos van en el campo "help".
10. PROHIBIDO pedir cálculos, porcentajes exactos, ni "3 principales canales". Las preguntas deben responderse en 2 segundos tocando una opción.
11. FORMATO PRINCIPAL: "single" (selección única con autoavance). Usá "multi" sólo si realmente corresponde elegir varias. "text" SOLO como excepción (≤10% del cuestionario, sólo si es imposible con opciones).
12. OPCIONES: EXACTAMENTE 4 ó 6 opciones normales. NUNCA más de 6. NUNCA menos de 3.
13. NO incluyas opciones tipo "No sé", "No aplica", "Otra", "Ninguna", "Recién empiezo" dentro del array de opciones. La UI agrega automáticamente una opción horizontal secundaria "No sé / Quiero aclarar algo" para TODAS las preguntas. Tus opciones deben ser sólo respuestas reales y diferenciadas.
14. CADA OPCIÓN: primera letra MAYÚSCULA, texto corto (máx 4 palabras), sin punto final, sin minúscula inicial, sin frases largas, sin "N/A", sin "Otro...". Ejemplos válidos: "Mayoría nuevos", "Honorarios", "WhatsApp", "Holgado".
15. EMOJIS: máximo 1 por opción y SOLO si suma claridad visual. Negocios formales (legal, financiero, médico, B2B serio): SIN emojis. Negocios informales (gastronomía, ecommerce, turismo, bienestar): pueden usarse con sobriedad.
16. EXPLICADORES: si la pregunta usa concepto económico/operativo difícil (flujo de caja, ticket promedio, margen, rentabilidad, recompra, conversión, checkout, pipeline, ciclo de venta, capital de trabajo, retención, rotación, ocupación, propuesta comercial, recurrencia, lead), COMPLETÁ el campo "help" con UNA frase corta (≤120 caracteres) definiéndolo en lenguaje llano. NO metas la definición en el título.
17. SIN preguntas que asuman datos que el usuario probablemente no tiene precisos (ej: porcentajes exactos, montos exactos). Usá tramos (Holgado/Suficiente/Ajustado/Preocupante) o frecuencias (Siempre/A veces/Pocas/Nunca).

TIPOS DE INPUT:
- "single": Selección única (4 ó 6 opciones con emoji opcional, label bilingüe, impactScore). FORMATO PRINCIPAL.
- "multi": Selección múltiple (4 ó 6 opciones). Sólo cuando varias respuestas tengan sentido.
- "number": Valor numérico (incluir unit). Sólo si el dato es trivial.
- "slider": Rango deslizable (incluir min, max, unit). Sólo si simplifica.
- "text": Respuesta abierta. EXCEPCIÓN: ≤10% del cuestionario.
- "money": Valor monetario. Sólo si el usuario sabe el dato exacto.

CATEGORÍAS: identity, operation, sales, finance, team, marketing, reputation, goals.

FORMATO:
- id: Q_AI_XXX (número secuencial)
- weight: 1-10 (importancia para su dimensión)
- required: true para preguntas estratégicas clave, false para complementarias
- mode: "${isQuick ? 'quick' : 'complete'}" o "both"
${learningContext}${dedupeContext}`;

    const userPrompt = isBackgroundBatch
      ? `Genera EXACTAMENTE ${questionCount} preguntas NUEVAS (no repitas temas ya cubiertos) para este negocio:

${contextParts}

${dimDist.min}-${dimDist.max} por dimensión. Idioma: ${lang}. Responde con generate_questions.`
      : `Genera EXACTAMENTE ${questionCount} preguntas para este negocio/servicio/profesión:

${contextParts}

RECORDATORIO FINAL:
- Distribución balanceada: cada una de las 7 dimensiones debe tener entre ${dimDist.min} y ${dimDist.max} preguntas
- Total: ${questionCount} preguntas exactas
- Idioma: ${lang} con ${voiceStyle}
- 100% específico para "${businessTypeLabel}"

Responde usando la función generate_questions.`;

    // Use fast model for all batches - quality comes from the structured prompt, not model tier
    const model = "google/gemini-2.5-flash"; // Rápido: micro-batches progresivos necesitan latencia baja

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: `${systemPrompt}\n\n${ANTI_GENERIC_SYSTEM}\n\n${prompt2Rules("question")}\n\n${buildTerminologyContext({ activity: businessTypeLabel || null, country: countryCode || null, offer: null, customer: null, channel: null }).promptFragment}` },
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
        max_tokens: 16384,
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
            model: "google/gemini-3-flash-preview", // Retry con modelo alternativo rápido
            messages: [
              { role: "system", content: `${systemPrompt}\n\n${ANTI_GENERIC_SYSTEM}\n\n${prompt2Rules("question")}\n\n${buildTerminologyContext({ activity: businessTypeLabel || null, country: countryCode || null, offer: null, customer: null, channel: null }).promptFragment}` },
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
            max_tokens: 16384,
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

    // --- Helpers de simplicidad / clarify ---
    const CLARIFY_OPT_IDS = new Set([
      'not_sure','no_se','no_sé','dont_know','idk','unknown','na','n_a',
      'other','otro','otra','none','ninguna','ninguno','no_aplica','recien_empiezo',
    ]);
    const CLARIFY_LABEL_RX = [
      /^no\s+(lo\s+)?s[eé]/i,/^no\s+aplica/i,/^otra?\s*(\.\.\.|$)/i,
      /^ninguna?\s+de/i,/quiero\s+aclarar/i,/quiero\s+escribir/i,
      /reci[eé]n\s+empiezo/i,/todav[ií]a\s+no/i,/^a[úu]n\s+no\s+lo\s+mido/i,
    ];
    const isClarifyOpt = (o: any): boolean => {
      if (!o) return true;
      if (CLARIFY_OPT_IDS.has(String(o.id || '').toLowerCase())) return true;
      const lbl = String(o.label?.es || o.label || '').trim();
      return CLARIFY_LABEL_RX.some(rx => rx.test(lbl));
    };
    const sanitizeOptionLabel = (s: string): string => {
      let t = String(s || '').trim().replace(/\s+/g,' ');
      if (!t) return t;
      // Sin punto final.
      t = t.replace(/[.。]+$/,'');
      // Primera letra mayúscula.
      t = t.charAt(0).toUpperCase() + t.slice(1);
      return t;
    };
    const sanitizeOptions = (opts: any[] | undefined): any[] => {
      if (!Array.isArray(opts)) return [];
      const cleaned = opts
        .filter(o => !isClarifyOpt(o))
        .map(o => ({
          ...o,
          label: {
            es: sanitizeOptionLabel(o.label?.es || ''),
            'pt-BR': sanitizeOptionLabel(o.label?.['pt-BR'] || o.label?.es || ''),
          },
        }))
        // Sin opciones demasiado largas (>40 chars).
        .filter(o => (o.label.es || '').length <= 40);
      // Cap a 6, preferir 4 ó 6.
      if (cleaned.length > 6) return cleaned.slice(0, 6);
      if (cleaned.length === 5) return cleaned.slice(0, 4);
      return cleaned;
    };

    // Validate and sanitize questions
    const validQuestions = questions
      .filter((q: any) => q.id && q.title?.es && q.type)
      .map((q: any, i: number) => ({
        ...q,
        id: q.id || `Q_AI_${String(i + 1).padStart(3, '0')}`,
        required: q.required !== false,
        weight: Math.max(1, Math.min(10, q.weight || 5)),
        title: {
          es: String(q.title.es).replace(/\s*\(?ej\.?:?\s*[^)]*\)?/gi, '').replace(/\s+/g,' ').trim(),
          'pt-BR': String(q.title['pt-BR'] || q.title.es).replace(/\s*\(?ex\.?:?\s*[^)]*\)?/gi, '').replace(/\s+/g,' ').trim(),
        },
        help: q.help ? {
          es: q.help.es || '',
          'pt-BR': q.help['pt-BR'] || q.help.es || '',
        } : undefined,
        options: sanitizeOptions(q.options),
      }))
      // RUNTIME GATE: filtrar preguntas genéricas directas y leaks técnicos
      .filter((q: any) => {
        const titleEs = q.title?.es || '';
        // Bloquear si el título quedó demasiado largo o vacío tras limpieza.
        if (!titleEs || titleEs.split(/\s+/).length > 22) {
          console.warn(`[gate] dropped too-long/empty title: "${titleEs}"`);
          return false;
        }
        if (isGenericQuestionTitle(titleEs)) {
          console.warn(`[gate] dropped generic question: "${titleEs}"`);
          return false;
        }
        // Si es single/multi y quedó sin opciones reales tras sanitize, descartar.
        if ((q.type === 'single' || q.type === 'multi') && (!q.options || q.options.length < 3)) {
          console.warn(`[gate] dropped ${q.type} with <3 normal options: "${titleEs}"`);
          return false;
        }
        const qc = extremeQualityCheck({ text: titleEs, hasBrainEvidence: true, hasConcreteAction: true });
        if (!qc.ok) {
          const blocking = qc.reasons.filter(r =>
            r.includes('técnico') || r.includes('interna') || r.includes('inglés') || r.includes('vacía')
          );
          if (blocking.length > 0) {
            console.warn(`[gate] dropped question (${blocking.join(',')}): "${titleEs}"`);
            return false;
          }
        }
        return true;
      });

    // ========================================================================
    // NO DUPLICATE QUESTION GATE — filtra preguntas redundantes vs. previousAnswers.
    // Bloquea preguntas cuya intención ya fue cubierta (por keywords en título o id).
    // ========================================================================
    const previousIntents = new Set<string>();
    if (previousAnswers && typeof previousAnswers === 'object') {
      for (const key of Object.keys(previousAnswers)) {
        previousIntents.add(key.toLowerCase());
      }
    }
    const intentKeywords = (txt: string) =>
      txt.toLowerCase()
        .replace(/[¿?¡!,.:;()]/g, ' ')
        .split(/\s+/)
        .filter(w => w.length > 4)
        .slice(0, 8)
        .join('|');

    const deduped = validQuestions.filter((q: any) => {
      const idLow = String(q.id || '').toLowerCase();
      if (previousIntents.has(idLow)) {
        console.warn(`[gate] dropped duplicate id: ${q.id}`);
        return false;
      }
      // Bloquear si comparte ≥3 keywords con alguna respuesta previa (intención repetida).
      const titleKw = intentKeywords(q.title?.es || '');
      if (titleKw && previousAnswers) {
        for (const prevKey of Object.keys(previousAnswers)) {
          const overlap = prevKey.toLowerCase().split('_').filter(w => titleKw.includes(w)).length;
          if (overlap >= 3) {
            console.warn(`[gate] dropped duplicate intent: "${q.title?.es}"`);
            return false;
          }
        }
      }
      return true;
    });

    // ========================================================================
    // BRAIN IMPACT GATE — cada pregunta debe declarar dimension + category.
    // Sin dimension válida no aporta al brain → se elimina.
    // ========================================================================
    const brainGated = deduped.filter((q: any) => {
      const hasDim = q.dimension && (DIMENSIONS as readonly string[]).includes(q.dimension);
      const hasCat = q.category && (CATEGORIES as readonly string[]).includes(q.category);
      if (!hasDim || !hasCat) {
        console.warn(`[gate] dropped no-brain-impact: "${q.title?.es}" (dim=${q.dimension}, cat=${q.category})`);
        return false;
      }
      return true;
    });

    // ========================================================================
    // MODE DEPTH GATE — hard caps alineados con prompt y cliente.
    // Rápido ≤10, Completo ≤25. Calidad estricta; el gate ya descartó basura.
    // ========================================================================
    const HARD_CAP = isQuick ? 10 : 25;
    const capped = brainGated.slice(0, HARD_CAP);

    // ========================================================================
    // PROMPT 4 — validateQuestionServer + enriquecimiento (clarify, targetBrainField,
    // affectedModules, intentKey, simplicityScore, mobileSafe, explainer).
    // ========================================================================
    const finalQuestions: any[] = [];
    let questionsBlocked = 0;
    for (const q of capped) {
      const v = validateQuestionServer(q as any);
      if (!v.passed) {
        questionsBlocked++;
        console.warn(`[validateQuestionServer] dropped "${q.title?.es}":`, v.reasons.join(","));
        continue;
      }
      finalQuestions.push({
        ...v.question,
        specialClarifyOption: CLARIFY_OPTION,
        requiresExplainer: Boolean(q.help?.es),
        explainerText: q.help?.es ?? undefined,
      });
    }
    console.log(`[generate-questionnaire] ${questionsBlocked} blocked by validateQuestionServer`);


    // Validate dimension coverage
    const dimensionCounts: Record<string, number> = {};
    for (const dim of DIMENSIONS) dimensionCounts[dim] = 0;
    for (const q of finalQuestions) {
      if (q.dimension && dimensionCounts[q.dimension] !== undefined) {
        dimensionCounts[q.dimension]++;
      }
    }

    const missingDimensions = DIMENSIONS.filter(d => dimensionCounts[d] === 0);

    console.log(`Generated ${finalQuestions.length} questions for "${businessTypeLabel}" (${setupMode}) [cap=${HARD_CAP}]`);
    console.log('Dimension coverage:', dimensionCounts);
    if (missingDimensions.length > 0) {
      console.warn('Missing dimensions:', missingDimensions);
    }

    return new Response(JSON.stringify({ 
      questions: finalQuestions,
      meta: {
        businessType: businessTypeLabel,
        mode: setupMode,
        count: finalQuestions.length,
        hardCap: HARD_CAP,
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
