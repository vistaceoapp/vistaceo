import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface FocusConfig {
  currentFocus: string;
  secondaryFocus?: string;
  focusWeights: Record<string, number>;
  weeklyActionLimit: number;
}

interface PrioritizedItem {
  id: string;
  type: 'mission' | 'opportunity' | 'action' | 'template';
  title: string;
  description?: string;
  focusArea: string;
  basePriority: number;
  adjustedPriority: number;
  focusMultiplier: number;
  relevanceScore: number;
  signals: string[];
  canExecute: boolean;
  missingRequirements: string[];
}

// Default focus weights
const DEFAULT_FOCUS_WEIGHTS: Record<string, number> = {
  ventas: 1.0,
  reputacion: 0.8,
  eficiencia: 0.6,
  marketing: 0.5,
};

// Focus area mappings for different content types
const FOCUS_KEYWORDS: Record<string, string[]> = {
  ventas: ['ticket', 'venta', 'ingreso', 'combo', 'upsell', 'precio', 'promoción', 'descuento', 'ocupación', 'reserva'],
  reputacion: ['review', 'reseña', 'rating', 'google', 'comentario', 'feedback', 'responder', 'queja', 'satisfacción'],
  eficiencia: ['tiempo', 'espera', 'velocidad', 'operación', 'proceso', 'costo', 'stock', 'turno', 'horario'],
  marketing: ['redes', 'instagram', 'contenido', 'foto', 'post', 'historia', 'seguidor', 'engagement', 'publicidad'],
};

// Determine focus area from text
function detectFocusArea(text: string): string {
  const normalizedText = text.toLowerCase();
  const scores: Record<string, number> = {};

  for (const [focus, keywords] of Object.entries(FOCUS_KEYWORDS)) {
    scores[focus] = keywords.filter(kw => normalizedText.includes(kw)).length;
  }

  const maxScore = Math.max(...Object.values(scores));
  if (maxScore === 0) return 'ventas'; // default

  return Object.entries(scores).find(([_, score]) => score === maxScore)?.[0] || 'ventas';
}

// Calculate priority adjustment based on focus
function calculateFocusMultiplier(
  itemFocus: string,
  config: FocusConfig
): number {
  const weights = config.focusWeights;
  
  // Primary focus gets full weight
  if (itemFocus === config.currentFocus) {
    return weights[itemFocus] || 1.0;
  }
  
  // Secondary focus gets 80% of its weight
  if (itemFocus === config.secondaryFocus) {
    return (weights[itemFocus] || 0.8) * 0.8;
  }
  
  // Other areas get their base weight * 0.5
  return (weights[itemFocus] || 0.5) * 0.5;
}

// Check if a mission template can be executed based on available data
function checkTemplateRequirements(
  template: any,
  factualMemory: Record<string, any>,
  recentSignals: any[]
): { canExecute: boolean; missing: string[] } {
  const missing: string[] = [];
  const requiredVars = template.required_variables as string[] || [];
  
  for (const varName of requiredVars) {
    if (!factualMemory[varName]) {
      missing.push(varName);
    }
  }
  
  // Check required signals if any
  const requiredSignals = template.required_signals as string[] || [];
  for (const signalType of requiredSignals) {
    const hasSignal = recentSignals.some(s => 
      s.signal_type === signalType || s.source === signalType
    );
    if (!hasSignal) {
      missing.push(`signal:${signalType}`);
    }
  }
  
  return { canExecute: missing.length === 0, missing };
}

// Calculate relevance score based on recent signals and entities
function calculateRelevanceScore(
  template: any,
  recentSignals: any[],
  topEntities: any[]
): number {
  let score = 0.5; // base score
  
  const templateText = `${template.title_template} ${template.description_template}`.toLowerCase();
  const tags = template.tags as string[] || [];
  
  // Boost if related to recent negative signals
  const negativeSignals = recentSignals.filter(s => 
    s.importance >= 7 || (s.content as any)?.sentiment_score < -0.3
  );
  
  for (const signal of negativeSignals) {
    const signalText = (signal.raw_text || '').toLowerCase();
    // Check if template addresses the signal's issue
    if (tags.some(tag => signalText.includes(tag))) {
      score += 0.2;
    }
  }
  
  // Boost if related to top issues
  const issueEntities = topEntities.filter(e => e.entity_type === 'issue');
  for (const entity of issueEntities) {
    if (templateText.includes(entity.canonical_name.replace(/_/g, ' '))) {
      score += 0.15;
    }
  }
  
  return Math.min(score, 1.0);
}

// Main prioritization function
async function prioritizeForBusiness(
  supabase: any,
  businessId: string
): Promise<{ config: FocusConfig; items: PrioritizedItem[] }> {
  // Get or create focus config
  let { data: focusConfig } = await supabase
    .from('business_focus_config')
    .select('*')
    .eq('business_id', businessId)
    .maybeSingle();

  if (!focusConfig) {
    // Create default config
    const { data: newConfig } = await supabase
      .from('business_focus_config')
      .insert({
        business_id: businessId,
        current_focus: 'ventas',
        focus_weights: DEFAULT_FOCUS_WEIGHTS,
      })
      .select()
      .single();
    focusConfig = newConfig;
  }

  const config: FocusConfig = {
    currentFocus: focusConfig?.current_focus || 'ventas',
    secondaryFocus: focusConfig?.secondary_focus,
    focusWeights: focusConfig?.focus_weights || DEFAULT_FOCUS_WEIGHTS,
    weeklyActionLimit: focusConfig?.weekly_action_limit || 3,
  };

  // Get business brain
  const { data: brain } = await supabase
    .from('business_brains')
    .select('*')
    .eq('business_id', businessId)
    .maybeSingle();

  const businessType = brain?.primary_business_type || 'restaurant';
  const factualMemory = (brain?.factual_memory || {}) as Record<string, any>;

  // Get recent signals (last 30 days)
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const { data: recentSignals } = await supabase
    .from('signals')
    .select('*')
    .eq('business_id', businessId)
    .gte('created_at', thirtyDaysAgo)
    .order('created_at', { ascending: false })
    .limit(50);

  // Get top entities
  const { data: topEntities } = await supabase
    .from('canonical_entities')
    .select('*')
    .eq('business_id', businessId)
    .order('mention_count', { ascending: false })
    .limit(20);

  // Get mission templates for this business type
  const { data: templates } = await supabase
    .from('mission_templates')
    .select('*')
    .eq('business_type', businessType)
    .eq('is_active', true);

  // Get existing active missions
  const { data: activeMissions } = await supabase
    .from('missions')
    .select('*')
    .eq('business_id', businessId)
    .eq('status', 'active');

  // Get existing opportunities
  const { data: opportunities } = await supabase
    .from('opportunities')
    .select('*')
    .eq('business_id', businessId)
    .is('dismissed_at', null)
    .eq('is_converted', false);

  const items: PrioritizedItem[] = [];

  // Prioritize mission templates
  for (const template of templates || []) {
    const focusArea = template.focus_area;
    const focusMultiplier = calculateFocusMultiplier(focusArea, config);
    const { canExecute, missing } = checkTemplateRequirements(
      template,
      factualMemory,
      recentSignals || []
    );
    const relevanceScore = calculateRelevanceScore(
      template,
      recentSignals || [],
      topEntities || []
    );

    const basePriority = template.priority_base || 5;
    const adjustedPriority = basePriority * focusMultiplier * (0.5 + relevanceScore * 0.5);

    items.push({
      id: template.id,
      type: 'template',
      title: template.title_template,
      description: template.description_template,
      focusArea,
      basePriority,
      adjustedPriority,
      focusMultiplier,
      relevanceScore,
      signals: [],
      canExecute,
      missingRequirements: missing,
    });
  }

  // Prioritize existing opportunities
  for (const opp of opportunities || []) {
    const focusArea = detectFocusArea(`${opp.title} ${opp.description || ''}`);
    const focusMultiplier = calculateFocusMultiplier(focusArea, config);
    const basePriority = opp.impact_score || 5;
    const adjustedPriority = basePriority * focusMultiplier;

    items.push({
      id: opp.id,
      type: 'opportunity',
      title: opp.title,
      description: opp.description,
      focusArea,
      basePriority,
      adjustedPriority,
      focusMultiplier,
      relevanceScore: 0.7, // opportunities already filtered for relevance
      signals: (opp.evidence as any[])?.map(e => e.source) || [],
      canExecute: true,
      missingRequirements: [],
    });
  }

  // Prioritize active missions
  for (const mission of activeMissions || []) {
    const focusArea = mission.area || detectFocusArea(`${mission.title} ${mission.description || ''}`);
    const focusMultiplier = calculateFocusMultiplier(focusArea, config);
    const basePriority = mission.impact_score || 5;
    const adjustedPriority = basePriority * focusMultiplier;

    items.push({
      id: mission.id,
      type: 'mission',
      title: mission.title,
      description: mission.description,
      focusArea,
      basePriority,
      adjustedPriority,
      focusMultiplier,
      relevanceScore: 0.8, // active missions are already committed
      signals: [],
      canExecute: true,
      missingRequirements: [],
    });
  }

  // Sort by adjusted priority
  items.sort((a, b) => b.adjustedPriority - a.adjustedPriority);

  return { config, items };
}

// Get top recommendations based on focus
async function getTopRecommendations(
  supabase: any,
  businessId: string,
  limit: number = 3
): Promise<PrioritizedItem[]> {
  const { items } = await prioritizeForBusiness(supabase, businessId);
  
  // Filter to only executable items, prefer templates for new recommendations
  const executable = items.filter(item => item.canExecute);
  
  // Group by type and get top from each
  const templates = executable.filter(i => i.type === 'template').slice(0, limit);
  const missions = executable.filter(i => i.type === 'mission').slice(0, 1);
  const opportunities = executable.filter(i => i.type === 'opportunity').slice(0, 1);
  
  // Combine and re-sort
  const combined = [...missions, ...templates, ...opportunities];
  combined.sort((a, b) => b.adjustedPriority - a.adjustedPriority);
  
  return combined.slice(0, limit);
}

// Update focus for a business
async function updateFocus(
  supabase: any,
  businessId: string,
  newFocus: string,
  reason?: string
): Promise<boolean> {
  const { data: current } = await supabase
    .from('business_focus_config')
    .select('*')
    .eq('business_id', businessId)
    .maybeSingle();

  const focusHistory = (current?.focus_history || []) as any[];
  focusHistory.push({
    from: current?.current_focus || 'ventas',
    to: newFocus,
    reason: reason || 'user_changed',
    at: new Date().toISOString(),
  });

  // Keep last 10 changes
  const trimmedHistory = focusHistory.slice(-10);

  const { error } = await supabase
    .from('business_focus_config')
    .upsert({
      business_id: businessId,
      current_focus: newFocus,
      focus_history: trimmedHistory,
      updated_at: new Date().toISOString(),
    }, {
      onConflict: 'business_id',
    });

  return !error;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const action = body.action || 'prioritize';

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    switch (action) {
      case 'prioritize': {
        const { businessId } = body;
        if (!businessId) {
          return new Response(
            JSON.stringify({ error: "businessId is required" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const result = await prioritizeForBusiness(supabase, businessId);
        return new Response(
          JSON.stringify(result),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case 'top_recommendations': {
        const { businessId, limit } = body;
        if (!businessId) {
          return new Response(
            JSON.stringify({ error: "businessId is required" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const recommendations = await getTopRecommendations(supabase, businessId, limit || 3);
        return new Response(
          JSON.stringify({ recommendations }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case 'update_focus': {
        const { businessId, newFocus, reason } = body;
        if (!businessId || !newFocus) {
          return new Response(
            JSON.stringify({ error: "businessId and newFocus are required" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const validFocuses = ['ventas', 'reputacion', 'eficiencia', 'marketing'];
        if (!validFocuses.includes(newFocus)) {
          return new Response(
            JSON.stringify({ error: `Invalid focus. Must be one of: ${validFocuses.join(', ')}` }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const success = await updateFocus(supabase, businessId, newFocus, reason);
        return new Response(
          JSON.stringify({ success }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case 'get_config': {
        const { businessId } = body;
        if (!businessId) {
          return new Response(
            JSON.stringify({ error: "businessId is required" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const { data: focusConfig } = await supabase
          .from('business_focus_config')
          .select('*')
          .eq('business_id', businessId)
          .maybeSingle();

        return new Response(
          JSON.stringify({ config: focusConfig || { current_focus: 'ventas', focus_weights: DEFAULT_FOCUS_WEIGHTS } }),
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
    console.error("[brain-focus-engine] Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
