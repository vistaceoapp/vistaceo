import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface MVCField {
  field: string;
  required: boolean;
  category: string;
  question: string;
  type: string;
  options?: string[];
  max?: number;
}

interface DataGap {
  gap_type: string;
  category: string;
  field_name: string;
  reason: string;
  unlocks: string;
  questions: any[];
  priority: number;
}

// Analyze what data is missing for a business to be specific
async function analyzeGaps(supabase: any, businessId: string): Promise<{
  gaps: DataGap[];
  mvcCompletion: number;
  canGenerateSpecific: boolean;
}> {
  // Get business with brain
  const { data: business, error: bizError } = await supabase
    .from('businesses')
    .select('*, business_brains(*)')
    .eq('id', businessId)
    .maybeSingle();

  if (bizError || !business) {
    console.error('Error fetching business:', bizError);
    return { gaps: [], mvcCompletion: 0, canGenerateSpecific: false };
  }

  // Get or create brain
  let brain = business.business_brains?.[0];
  if (!brain) {
    const { data: newBrain, error: brainError } = await supabase
      .from('business_brains')
      .insert({
        business_id: businessId,
        primary_business_type: business.category || 'restaurant',
        current_focus: 'ventas',
      })
      .select()
      .single();
    
    if (brainError) {
      console.error('Error creating brain:', brainError);
      return { gaps: [], mvcCompletion: 0, canGenerateSpecific: false };
    }
    brain = newBrain;
  }

  // Get MVC config for this business type
  const { data: typeConfig, error: typeError } = await supabase
    .from('business_type_configs')
    .select('*')
    .eq('business_type', brain.primary_business_type)
    .maybeSingle();

  if (typeError || !typeConfig) {
    console.error('Error fetching type config:', typeError);
    // Use default restaurant config
    return { gaps: [], mvcCompletion: 50, canGenerateSpecific: false };
  }

  const mvcFields: MVCField[] = typeConfig.mvc_fields || [];
  const requiredFields = mvcFields.filter(f => f.required);
  
  // Get existing insights to check what we already know
  const { data: insights } = await supabase
    .from('business_insights')
    .select('*')
    .eq('business_id', businessId);

  const insightsByCategory: Record<string, any[]> = {};
  (insights || []).forEach((insight: any) => {
    if (!insightsByCategory[insight.category]) {
      insightsByCategory[insight.category] = [];
    }
    insightsByCategory[insight.category].push(insight);
  });

  // Check what data we have from various sources
  const factualMemory = brain.factual_memory || {};
  const dynamicMemory = brain.dynamic_memory || {};

  // Analyze gaps
  const gaps: DataGap[] = [];
  let filledRequired = 0;

  for (const field of requiredFields) {
    const hasInFactual = factualMemory[field.field] !== undefined;
    const hasInDynamic = dynamicMemory[field.field] !== undefined;
    const hasInsight = insightsByCategory[field.category]?.some(
      i => i.question.toLowerCase().includes(field.field.replace(/_/g, ' '))
    );

    if (!hasInFactual && !hasInDynamic && !hasInsight) {
      // This is a gap
      gaps.push({
        gap_type: 'mvc_required',
        category: field.category,
        field_name: field.field,
        reason: `Necesito saber ${field.question.toLowerCase()} para darte recomendaciones específicas`,
        unlocks: getUnlockDescription(field.field, brain.current_focus),
        questions: [{
          question: field.question,
          type: field.type,
          options: field.options,
          max: field.max
        }],
        priority: getFieldPriority(field.field, brain.current_focus)
      });
    } else {
      filledRequired++;
    }
  }

  // Calculate MVC completion
  const mvcCompletion = requiredFields.length > 0 
    ? Math.round((filledRequired / requiredFields.length) * 100)
    : 100;

  // Can generate specific if we have at least 60% of required data
  const canGenerateSpecific = mvcCompletion >= 60;

  // Sort gaps by priority
  gaps.sort((a, b) => b.priority - a.priority);

  // Update brain with MVC status
  await supabase
    .from('business_brains')
    .update({
      mvc_completion_pct: mvcCompletion,
      mvc_gaps: gaps.slice(0, 5) // Store top 5 gaps
    })
    .eq('id', brain.id);

  return { gaps, mvcCompletion, canGenerateSpecific };
}

function getUnlockDescription(field: string, focus: string): string {
  const unlocks: Record<string, string> = {
    peak_hours: 'Misiones de optimización de turnos y personal',
    top_products: 'Estrategias de upselling y promociones específicas',
    avg_ticket_range: 'Metas de venta realistas y estrategias de ticket',
    service_modality: 'Optimización de flujo de clientes y layout',
    seating_capacity: 'Metas de ocupación y gestión de reservas',
    service_times: 'Estrategias por servicio (almuerzo vs cena)',
    cuisine_type: 'Tendencias y oportunidades de menú',
    top_dishes: 'Ingeniería de menú y promociones',
    peak_nights: 'Estrategias de marketing nocturno',
    bar_type: 'Posicionamiento y eventos temáticos',
    platforms: 'Optimización de presencia en apps',
    prep_time_avg: 'Mejora de tiempos y eficiencia',
    orders_per_day: 'Metas de crecimiento realistas',
    flavor_count: 'Gestión de variedad y rotación',
    production: 'Estrategias de diferenciación',
    production_start: 'Optimización de producción y stock',
    product_types: 'Mix de productos y márgenes',
    b2b_sales: 'Estrategias de crecimiento B2B',
    delivery_zones: 'Expansión de cobertura',
    multi_brand: 'Optimización multi-marca'
  };
  return unlocks[field] || 'Recomendaciones más precisas para tu negocio';
}

function getFieldPriority(field: string, focus: string): number {
  // Higher priority for fields related to current focus
  const focusPriorities: Record<string, string[]> = {
    ventas: ['avg_ticket_range', 'top_products', 'top_dishes', 'orders_per_day'],
    reputacion: ['service_modality', 'peak_hours', 'prep_time_avg'],
    eficiencia: ['peak_hours', 'prep_time_avg', 'production_start', 'staff_count'],
    marketing: ['top_products', 'cuisine_type', 'bar_type', 'peak_nights']
  };

  const priorityFields = focusPriorities[focus] || [];
  if (priorityFields.includes(field)) {
    return 10;
  }
  return 5;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { businessId } = await req.json();

    if (!businessId) {
      return new Response(
        JSON.stringify({ error: "businessId is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const result = await analyzeGaps(supabase, businessId);

    // If there are gaps, store them
    if (result.gaps.length > 0) {
      // Clear old pending gaps for this business
      await supabase
        .from('data_gaps')
        .delete()
        .eq('business_id', businessId)
        .eq('status', 'pending');

      // Insert new gaps (top 3 only to avoid overwhelming)
      const gapsToInsert = result.gaps.slice(0, 3).map(gap => ({
        business_id: businessId,
        ...gap
      }));

      await supabase
        .from('data_gaps')
        .insert(gapsToInsert);
    }

    return new Response(
      JSON.stringify({
        gaps: result.gaps.slice(0, 3),
        mvcCompletion: result.mvcCompletion,
        canGenerateSpecific: result.canGenerateSpecific,
        message: result.canGenerateSpecific 
          ? 'Tengo suficiente contexto para ser específico'
          : 'Necesito más información para darte recomendaciones precisas'
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in brain-analyze-gaps:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
