import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PlaybookContext {
  businessType: string;
  businessTypeConfig: any;
  factualMemory: Record<string, any>;
  mvcCompletion: number;
  currentFocus: string;
  focusWeights: Record<string, number>;
  recentSignals: any[];
  topEntities: any[];
  activeTemplates: any[];
}

// Build complete playbook context for a business
async function buildPlaybookContext(
  supabase: any,
  businessId: string
): Promise<PlaybookContext> {
  // Get business brain
  const { data: brain } = await supabase
    .from('business_brains')
    .select('*')
    .eq('business_id', businessId)
    .maybeSingle();

  const businessType = brain?.primary_business_type || 'restaurant';

  // Get business type config (playbook definition)
  const { data: typeConfig } = await supabase
    .from('business_type_configs')
    .select('*')
    .eq('business_type', businessType)
    .maybeSingle();

  // Get focus config
  const { data: focusConfig } = await supabase
    .from('business_focus_config')
    .select('*')
    .eq('business_id', businessId)
    .maybeSingle();

  // Get recent signals (last 14 days)
  const twoWeeksAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString();
  const { data: recentSignals } = await supabase
    .from('signals')
    .select('*')
    .eq('business_id', businessId)
    .gte('created_at', twoWeeksAgo)
    .order('importance', { ascending: false })
    .limit(30);

  // Get top entities
  const { data: topEntities } = await supabase
    .from('canonical_entities')
    .select('*')
    .eq('business_id', businessId)
    .order('mention_count', { ascending: false })
    .limit(15);

  // Get active mission templates for this business type
  const { data: templates } = await supabase
    .from('mission_templates')
    .select('*')
    .eq('business_type', businessType)
    .eq('is_active', true);

  return {
    businessType,
    businessTypeConfig: typeConfig || {},
    factualMemory: brain?.factual_memory || {},
    mvcCompletion: brain?.mvc_completion_pct || 0,
    currentFocus: focusConfig?.current_focus || brain?.current_focus || 'ventas',
    focusWeights: focusConfig?.focus_weights || { ventas: 1, reputacion: 0.8, eficiencia: 0.6, marketing: 0.5 },
    recentSignals: recentSignals || [],
    topEntities: topEntities || [],
    activeTemplates: templates || [],
  };
}

// Generate system prompt for AI based on playbook
function generatePlaybookPrompt(context: PlaybookContext): string {
  const { businessType, businessTypeConfig, factualMemory, currentFocus, focusWeights, topEntities } = context;

  const typeDisplay = businessTypeConfig.display_name || businessType;
  const keyMetrics = businessTypeConfig.key_metrics || [];
  const keyVariables = businessTypeConfig.key_variables || [];
  const blockedPhrases = businessTypeConfig.blocked_phrases || [];
  const commonIssues = businessTypeConfig.common_issues || [];

  // Build known facts section
  const knownFacts = Object.entries(factualMemory)
    .filter(([_, v]) => v !== null && v !== undefined && v !== '')
    .map(([k, v]) => `- ${k}: ${v}`)
    .join('\n');

  // Build top issues section
  const issueEntities = topEntities
    .filter(e => e.entity_type === 'issue')
    .slice(0, 5);
  const topIssues = issueEntities.length > 0
    ? issueEntities.map(e => `- ${e.display_name} (${e.mention_count} menciones)`).join('\n')
    : 'No hay issues identificados aún';

  // Build focus priorities
  const focusPriorities = Object.entries(focusWeights)
    .sort(([, a], [, b]) => b - a)
    .map(([focus, weight], i) => `${i + 1}. ${focus} (peso: ${weight})`)
    .join('\n');

  return `Eres el consultor experto para un negocio tipo "${typeDisplay}".

## FOCO ACTUAL: ${currentFocus.toUpperCase()}
Prioridades:
${focusPriorities}

## LO QUE SABEMOS DEL NEGOCIO
${knownFacts || 'Información limitada disponible'}

## MÉTRICAS CLAVE PARA ESTE TIPO
${keyMetrics.map((m: string) => `- ${m}`).join('\n') || 'No definidas'}

## VARIABLES IMPORTANTES
${keyVariables.map((v: string) => `- ${v}`).join('\n') || 'No definidas'}

## TOP ISSUES DETECTADOS
${topIssues}

## REGLAS ESTRICTAS
1. NUNCA uses estas frases genéricas: ${blockedPhrases.slice(0, 10).join(', ')}
2. Siempre menciona datos específicos del negocio cuando los tengas
3. Prioriza recomendaciones alineadas con el FOCO ACTUAL
4. Si te falta información crucial, pregunta antes de recomendar
5. Las acciones deben ser medibles y con plazo definido

## ISSUES COMUNES EN ${typeDisplay.toUpperCase()}
${commonIssues.map((issue: any) => `- ${issue.name || issue}: ${issue.solution || 'requiere análisis'}`).join('\n') || 'Ver señales recientes'}

Responde siempre en español, de forma directa y actionable.`;
}

// Select best mission template based on context
function selectBestTemplate(context: PlaybookContext): any | null {
  const { activeTemplates, currentFocus, factualMemory, recentSignals, focusWeights } = context;

  if (!activeTemplates.length) return null;

  // Score each template
  const scored = activeTemplates.map(template => {
    let score = template.priority_base || 5;

    // Focus alignment bonus
    if (template.focus_area === currentFocus) {
      score *= focusWeights[currentFocus] || 1;
    } else {
      score *= (focusWeights[template.focus_area] || 0.5) * 0.6;
    }

    // Check if requirements are met
    const requiredVars = template.required_variables as string[] || [];
    const metRequirements = requiredVars.filter(v => factualMemory[v]).length;
    const requirementScore = requiredVars.length > 0 
      ? metRequirements / requiredVars.length 
      : 1;

    score *= requirementScore;

    // Boost if we have relevant signals
    const tags = template.tags as string[] || [];
    const hasRelevantSignals = recentSignals.some(s => {
      const signalText = (s.raw_text || '').toLowerCase();
      return tags.some(tag => signalText.includes(tag));
    });
    if (hasRelevantSignals) {
      score *= 1.3;
    }

    return { template, score, requirementsMet: requirementScore === 1 };
  });

  // Sort by score, prefer those with all requirements met
  scored.sort((a, b) => {
    if (a.requirementsMet !== b.requirementsMet) {
      return a.requirementsMet ? -1 : 1;
    }
    return b.score - a.score;
  });

  return scored[0]?.template || null;
}

// Instantiate a template with actual values
function instantiateTemplate(
  template: any,
  factualMemory: Record<string, any>,
  topEntities: any[]
): { title: string; description: string; steps: any[] } {
  let title = template.title_template;
  let description = template.description_template;
  let steps = JSON.parse(JSON.stringify(template.steps_template || []));

  // Replace variables in title and description
  for (const [key, value] of Object.entries(factualMemory)) {
    const placeholder = `{{${key}}}`;
    title = title.replace(placeholder, String(value));
    description = description.replace(placeholder, String(value));
  }

  // Add entity-specific context to steps if relevant
  const issueEntities = topEntities.filter(e => e.entity_type === 'issue');
  const productEntities = topEntities.filter(e => e.entity_type === 'product');

  if (issueEntities.length > 0) {
    const topIssue = issueEntities[0];
    description += ` (Issue principal detectado: ${topIssue.display_name})`;
  }

  return { title, description, steps };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const action = body.action || 'get_context';

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    switch (action) {
      case 'get_context': {
        const { businessId } = body;
        if (!businessId) {
          return new Response(
            JSON.stringify({ error: "businessId is required" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const context = await buildPlaybookContext(supabase, businessId);
        return new Response(
          JSON.stringify({ context }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case 'get_system_prompt': {
        const { businessId } = body;
        if (!businessId) {
          return new Response(
            JSON.stringify({ error: "businessId is required" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const context = await buildPlaybookContext(supabase, businessId);
        const systemPrompt = generatePlaybookPrompt(context);

        return new Response(
          JSON.stringify({ systemPrompt, context: { businessType: context.businessType, currentFocus: context.currentFocus, mvcCompletion: context.mvcCompletion } }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case 'suggest_mission': {
        const { businessId } = body;
        if (!businessId) {
          return new Response(
            JSON.stringify({ error: "businessId is required" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const context = await buildPlaybookContext(supabase, businessId);
        const bestTemplate = selectBestTemplate(context);

        if (!bestTemplate) {
          return new Response(
            JSON.stringify({ suggestion: null, reason: 'No hay templates disponibles para este tipo de negocio' }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const instantiated = instantiateTemplate(bestTemplate, context.factualMemory, context.topEntities);

        return new Response(
          JSON.stringify({
            suggestion: {
              templateId: bestTemplate.id,
              templateKey: bestTemplate.template_key,
              focusArea: bestTemplate.focus_area,
              title: instantiated.title,
              description: instantiated.description,
              steps: instantiated.steps,
              effortScore: bestTemplate.effort_score,
              tags: bestTemplate.tags,
            },
            context: {
              businessType: context.businessType,
              currentFocus: context.currentFocus,
            },
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case 'get_blocked_phrases': {
        const { businessType } = body;
        if (!businessType) {
          return new Response(
            JSON.stringify({ error: "businessType is required" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const { data: typeConfig } = await supabase
          .from('business_type_configs')
          .select('blocked_phrases')
          .eq('business_type', businessType)
          .maybeSingle();

        return new Response(
          JSON.stringify({ blockedPhrases: typeConfig?.blocked_phrases || [] }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      default:
        return new Response(
          JSON.stringify({ error: "Unknown action" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }

  } catch (error) {
    console.error("[brain-playbook] Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
