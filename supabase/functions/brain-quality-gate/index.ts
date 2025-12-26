import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Global blocked phrases - too generic
const GLOBAL_BLOCKED_PHRASES = [
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
  "analiza tu situación",
  "evalúa tus opciones",
  "trabaja en tu",
  "enfócate en mejorar",
  "desarrolla estrategias",
  "implementa un plan",
  "genera más ingresos",
  "reduce tus costos",
];

interface QualityCheckResult {
  passed: boolean;
  score: number;
  issues: string[];
  genericPhrasesFound: string[];
  suggestions: string[];
  trace: {
    hasConcreteTriger: boolean;
    hasSpecificVariables: boolean;
    hasBasedOn: boolean;
    hasConfidence: boolean;
    hasMeasurement: boolean;
  };
}

interface RecommendationInput {
  title: string;
  description: string;
  type: 'mission' | 'opportunity' | 'action' | 'chat_response';
  businessId: string;
  basedOn?: Array<{ type: string; id?: string; summary: string }>;
  variables?: Record<string, any>;
  steps?: Array<{ title: string; description?: string }>;
}

async function checkQuality(
  supabase: any,
  input: RecommendationInput
): Promise<QualityCheckResult> {
  const issues: string[] = [];
  const suggestions: string[] = [];
  const genericPhrasesFound: string[] = [];
  
  // Get business type config for type-specific blocked phrases
  const { data: business } = await supabase
    .from('businesses')
    .select('category, business_brains(*)')
    .eq('id', input.businessId)
    .maybeSingle();

  const brain = business?.business_brains?.[0];
  const businessType = brain?.primary_business_type || business?.category || 'restaurant';

  const { data: typeConfig } = await supabase
    .from('business_type_configs')
    .select('blocked_phrases')
    .eq('business_type', businessType)
    .maybeSingle();

  const typeBlockedPhrases: string[] = typeConfig?.blocked_phrases || [];
  const allBlockedPhrases = [...GLOBAL_BLOCKED_PHRASES, ...typeBlockedPhrases];

  // 1. Check for generic phrases in title and description
  const textToCheck = `${input.title} ${input.description}`.toLowerCase();
  
  for (const phrase of allBlockedPhrases) {
    if (textToCheck.includes(phrase.toLowerCase())) {
      genericPhrasesFound.push(phrase);
    }
  }

  if (genericPhrasesFound.length > 0) {
    issues.push(`Contiene frases genéricas: ${genericPhrasesFound.join(', ')}`);
    suggestions.push('Reemplazar con acciones específicas basadas en datos del negocio');
  }

  // 2. Check for concrete trigger
  const hasConcreteTriger = input.basedOn && input.basedOn.length > 0;
  if (!hasConcreteTriger) {
    issues.push('No tiene trigger concreto (basado en qué señal/dato)');
    suggestions.push('Agregar "basedOn" con la señal o dato que origina esta recomendación');
  }

  // 3. Check for specific variables
  const hasSpecificVariables = input.variables && Object.keys(input.variables).length > 0;
  if (!hasSpecificVariables) {
    issues.push('No usa variables específicas del negocio');
    suggestions.push('Incluir variables como ticket_promedio, horario_pico, etc.');
  }

  // 4. Check for measurement/metric
  const measurementKeywords = ['medir', 'métrica', 'resultado', 'objetivo', 'meta', '%', 'aumento', 'reducción'];
  const hasMeasurement = measurementKeywords.some(kw => textToCheck.includes(kw));
  if (!hasMeasurement && input.type !== 'chat_response') {
    issues.push('No tiene forma de medir el resultado');
    suggestions.push('Agregar métrica o forma de verificar el impacto');
  }

  // 5. Check steps specificity for missions
  if (input.type === 'mission' && input.steps) {
    const vagueSteps = input.steps.filter(step => {
      const stepText = `${step.title} ${step.description || ''}`.toLowerCase();
      return allBlockedPhrases.some(phrase => stepText.includes(phrase.toLowerCase()));
    });
    
    if (vagueSteps.length > 0) {
      issues.push(`${vagueSteps.length} pasos son demasiado genéricos`);
      suggestions.push('Hacer cada paso accionable y específico');
    }
  }

  // 6. Check title specificity
  const titleWords = input.title.split(' ').length;
  if (titleWords < 4) {
    issues.push('Título muy corto/vago');
    suggestions.push('Título debe describir acción específica (ej: "Agregar foto de tu café con leche a Google Maps")');
  }

  // Calculate score
  let score = 100;
  score -= genericPhrasesFound.length * 15;
  score -= !hasConcreteTriger ? 20 : 0;
  score -= !hasSpecificVariables ? 15 : 0;
  score -= !hasMeasurement ? 10 : 0;
  score -= titleWords < 4 ? 10 : 0;
  score = Math.max(0, score);

  const passed = score >= 60 && genericPhrasesFound.length === 0;

  return {
    passed,
    score,
    issues,
    genericPhrasesFound,
    suggestions,
    trace: {
      hasConcreteTriger: hasConcreteTriger ?? false,
      hasSpecificVariables: hasSpecificVariables ?? false,
      hasBasedOn: hasConcreteTriger ?? false,
      hasConfidence: true, // Will be set by caller
      hasMeasurement
    }
  };
}

async function saveTrace(
  supabase: any,
  input: RecommendationInput,
  result: QualityCheckResult,
  confidence: 'high' | 'medium' | 'low',
  whySummary: string
): Promise<string | null> {
  const { data: business } = await supabase
    .from('businesses')
    .select('business_brains(id)')
    .eq('id', input.businessId)
    .maybeSingle();

  const brainId = business?.business_brains?.[0]?.id;

  const { data: trace, error } = await supabase
    .from('recommendation_traces')
    .insert({
      business_id: input.businessId,
      brain_id: brainId,
      output_type: input.type,
      output_content: {
        title: input.title,
        description: input.description,
        steps: input.steps
      },
      based_on: input.basedOn || [],
      confidence,
      why_summary: whySummary,
      passed_quality_gate: result.passed,
      quality_gate_score: result.score,
      quality_gate_details: {
        issues: result.issues,
        suggestions: result.suggestions,
        trace: result.trace
      },
      generic_phrases_detected: result.genericPhrasesFound,
      is_blocked: !result.passed,
      block_reason: !result.passed ? result.issues.join('; ') : null,
      variables_used: input.variables || {}
    })
    .select('id')
    .single();

  if (error) {
    console.error('Error saving trace:', error);
    return null;
  }

  return trace?.id;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      recommendation, 
      confidence = 'medium',
      whySummary = 'Generado por el sistema',
      saveTraceRecord = true 
    } = await req.json();

    if (!recommendation || !recommendation.businessId) {
      return new Response(
        JSON.stringify({ error: "recommendation with businessId is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const result = await checkQuality(supabase, recommendation);

    let traceId = null;
    if (saveTraceRecord) {
      traceId = await saveTrace(supabase, recommendation, result, confidence, whySummary);
    }

    return new Response(
      JSON.stringify({
        passed: result.passed,
        score: result.score,
        issues: result.issues,
        genericPhrasesFound: result.genericPhrasesFound,
        suggestions: result.suggestions,
        traceId,
        message: result.passed 
          ? 'Recomendación específica aprobada'
          : `Bloqueada: ${result.issues[0]}`
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in brain-quality-gate:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
