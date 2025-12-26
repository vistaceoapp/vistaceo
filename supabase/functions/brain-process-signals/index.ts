import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Entity types we extract
const ENTITY_TYPES = ['product', 'issue', 'channel', 'segment', 'process'] as const;

// Common issue patterns (Spanish focused for LATAM)
const ISSUE_PATTERNS: Record<string, string[]> = {
  'demora_servicio': ['lento', 'tardó', 'demora', 'espera', 'esperé', 'tardaron', 'demorado'],
  'mala_atencion': ['mala atención', 'mal servicio', 'grosero', 'antipático', 'descortés', 'ignoraron'],
  'precio_alto': ['caro', 'costoso', 'precio alto', 'muy caro', 'excesivo'],
  'calidad_baja': ['frío', 'crudo', 'quemado', 'mal preparado', 'viejo', 'rancio', 'feo'],
  'limpieza': ['sucio', 'sucia', 'mugre', 'cucaracha', 'mosca', 'olor'],
  'porcion_pequeña': ['poco', 'pequeña porción', 'porción chica', 'escaso'],
  'ruido': ['ruidoso', 'mucho ruido', 'no se puede hablar'],
  'temperatura': ['calor', 'frío el lugar', 'aire acondicionado'],
};

// Common positive patterns
const POSITIVE_PATTERNS: Record<string, string[]> = {
  'buena_atencion': ['excelente atención', 'amable', 'muy atento', 'buena onda', 'simpático'],
  'buena_calidad': ['delicioso', 'rico', 'exquisito', 'fresco', 'casero', 'bien preparado'],
  'buen_precio': ['buen precio', 'accesible', 'vale la pena', 'económico'],
  'rapido': ['rápido', 'enseguida', 'al toque', 'inmediato'],
  'ambiente': ['lindo lugar', 'acogedor', 'buena música', 'tranquilo', 'cómodo'],
};

// Product patterns by business type
const PRODUCT_PATTERNS: Record<string, string[]> = {
  'cafe': ['café', 'cortado', 'cappuccino', 'latte', 'espresso', 'americano', 'flat white'],
  'medialunas': ['medialunas', 'medialuna', 'croissant', 'facturas', 'tortitas'],
  'tostado': ['tostado', 'sandwich', 'sandwiches', 'tostada'],
  'torta': ['torta', 'cheesecake', 'brownie', 'alfajor', 'postre'],
  'pizza': ['pizza', 'pizzas', 'muzza', 'napolitana', 'fugazzeta'],
  'empanadas': ['empanada', 'empanadas'],
  'hamburguesa': ['hamburguesa', 'burger', 'hamburguesaS'],
  'helado': ['helado', 'helados', 'cucurucho', 'kilo'],
  'cerveza': ['cerveza', 'birra', 'pinta', 'chopp', 'tirada'],
  'coctel': ['trago', 'cocktail', 'fernet', 'gin', 'mojito', 'negroni'],
};

interface ProcessResult {
  signalsCreated: number;
  entitiesFound: number;
  entitiesCreated: number;
  mentionsCreated: number;
}

// Extract entities from text
function extractEntities(text: string, businessType: string): Array<{ type: string; name: string; sentiment: number }> {
  const normalizedText = text.toLowerCase();
  const entities: Array<{ type: string; name: string; sentiment: number }> = [];

  // Extract issues (negative)
  for (const [issueName, patterns] of Object.entries(ISSUE_PATTERNS)) {
    for (const pattern of patterns) {
      if (normalizedText.includes(pattern.toLowerCase())) {
        entities.push({ type: 'issue', name: issueName, sentiment: -0.7 });
        break;
      }
    }
  }

  // Extract positive aspects
  for (const [positiveName, patterns] of Object.entries(POSITIVE_PATTERNS)) {
    for (const pattern of patterns) {
      if (normalizedText.includes(pattern.toLowerCase())) {
        entities.push({ type: 'issue', name: positiveName, sentiment: 0.8 });
        break;
      }
    }
  }

  // Extract products
  for (const [productName, patterns] of Object.entries(PRODUCT_PATTERNS)) {
    for (const pattern of patterns) {
      if (normalizedText.includes(pattern.toLowerCase())) {
        entities.push({ type: 'product', name: productName, sentiment: 0 });
        break;
      }
    }
  }

  // Extract channels
  const channelPatterns: Record<string, string[]> = {
    'google': ['google', 'maps', 'busqué en google'],
    'instagram': ['instagram', 'ig', 'insta', 'vi en instagram'],
    'whatsapp': ['whatsapp', 'wpp', 'mensaje'],
    'delivery': ['pedidos ya', 'rappi', 'delivery', 'uber eats'],
    'presencial': ['fui', 'visité', 'estuve', 'vine'],
  };

  for (const [channelName, patterns] of Object.entries(channelPatterns)) {
    for (const pattern of patterns) {
      if (normalizedText.includes(pattern.toLowerCase())) {
        entities.push({ type: 'channel', name: channelName, sentiment: 0 });
        break;
      }
    }
  }

  return entities;
}

// Process external_data and convert to signals
async function processExternalData(supabase: any, businessId: string): Promise<ProcessResult> {
  const result: ProcessResult = {
    signalsCreated: 0,
    entitiesFound: 0,
    entitiesCreated: 0,
    mentionsCreated: 0,
  };

  // Get brain for this business
  const { data: brain } = await supabase
    .from('business_brains')
    .select('id, primary_business_type')
    .eq('business_id', businessId)
    .maybeSingle();

  const businessType = brain?.primary_business_type || 'restaurant';

  // Get unprocessed external_data
  const { data: externalData, error } = await supabase
    .from('external_data')
    .select('*')
    .eq('business_id', businessId)
    .is('processed_at', null)
    .order('created_at', { ascending: true })
    .limit(100);

  if (error || !externalData?.length) {
    console.log('No unprocessed external data found');
    return result;
  }

  console.log(`Processing ${externalData.length} external data items`);

  for (const item of externalData) {
    try {
      // Extract text content based on data type
      let rawText = '';
      const content = item.content as Record<string, any>;

      if (item.data_type === 'google_review' || item.data_type === 'review') {
        rawText = content.comment || content.text || '';
      } else if (item.data_type === 'metric') {
        rawText = `${content.metric_type}: ${content.value}`;
      } else if (item.data_type === 'transaction') {
        rawText = `Transacción ${content.status}: ${content.amount} ${content.currency}`;
      }

      // Extract entities from text
      const extractedEntities = extractEntities(rawText, businessType);
      result.entitiesFound += extractedEntities.length;

      // Determine signal type based on data type
      let signalType = 'integration_data';
      if (item.data_type.includes('review')) {
        signalType = 'feedback';
      }

      // Create signal
      const { data: signal, error: signalError } = await supabase
        .from('signals')
        .insert({
          business_id: businessId,
          brain_id: brain?.id,
          signal_type: signalType,
          source: item.data_type,
          content: {
            ...content,
            external_data_id: item.id,
            integration_id: item.integration_id,
          },
          raw_text: rawText,
          confidence: 'high',
          importance: item.importance || 5,
          entities: extractedEntities,
        })
        .select('id')
        .single();

      if (!signalError && signal) {
        result.signalsCreated++;

        // Process entities - create or update canonical entities
        for (const entity of extractedEntities) {
          const { data: existingEntity } = await supabase
            .from('canonical_entities')
            .select('id, mention_count, synonyms')
            .eq('business_id', businessId)
            .eq('entity_type', entity.type)
            .eq('canonical_name', entity.name)
            .maybeSingle();

          let entityId: string;

          if (existingEntity) {
            // Update existing entity
            await supabase
              .from('canonical_entities')
              .update({
                mention_count: (existingEntity.mention_count || 0) + 1,
                last_seen_at: new Date().toISOString(),
              })
              .eq('id', existingEntity.id);
            entityId = existingEntity.id;
          } else {
            // Create new entity
            const { data: newEntity } = await supabase
              .from('canonical_entities')
              .insert({
                business_id: businessId,
                entity_type: entity.type,
                canonical_name: entity.name,
                display_name: entity.name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
                synonyms: [],
                mention_count: 1,
                last_seen_at: new Date().toISOString(),
                confidence: 0.7,
              })
              .select('id')
              .single();

            if (newEntity) {
              entityId = newEntity.id;
              result.entitiesCreated++;
            } else {
              continue;
            }
          }

          // Create entity mention
          await supabase
            .from('entity_mentions')
            .insert({
              business_id: businessId,
              entity_id: entityId,
              source_type: 'external_data',
              source_id: item.id,
              raw_text: rawText,
              context: rawText.substring(0, 500),
              sentiment: entity.sentiment,
            });
          result.mentionsCreated++;
        }
      }

      // Mark external_data as processed
      await supabase
        .from('external_data')
        .update({ processed_at: new Date().toISOString() })
        .eq('id', item.id);

    } catch (itemError) {
      console.error(`Error processing external_data ${item.id}:`, itemError);
    }
  }

  // Update brain signal count
  if (brain?.id && result.signalsCreated > 0) {
    const { data: currentBrain } = await supabase
      .from('business_brains')
      .select('total_signals')
      .eq('id', brain.id)
      .single();

    await supabase
      .from('business_brains')
      .update({
        total_signals: (currentBrain?.total_signals || 0) + result.signalsCreated,
        last_learning_at: new Date().toISOString(),
      })
      .eq('id', brain.id);
  }

  return result;
}

// Create/update metrics timeseries from signals
async function updateMetricsTimeseries(supabase: any, businessId: string): Promise<number> {
  let metricsUpdated = 0;
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);

  // Calculate review metrics for today
  const { data: todayReviews } = await supabase
    .from('external_data')
    .select('sentiment_score, content')
    .eq('business_id', businessId)
    .in('data_type', ['google_review', 'review'])
    .gte('synced_at', todayStart.toISOString())
    .lt('synced_at', todayEnd.toISOString());

  if (todayReviews && todayReviews.length > 0) {
    const avgSentiment = todayReviews.reduce((sum: number, r: any) => sum + (r.sentiment_score || 0), 0) / todayReviews.length;

    // Upsert review count metric
    await supabase
      .from('metrics_timeseries')
      .upsert({
        business_id: businessId,
        metric_name: 'review_count',
        metric_source: 'integrations',
        value: todayReviews.length,
        period_start: todayStart.toISOString(),
        period_end: todayEnd.toISOString(),
        granularity: 'daily',
      }, {
        onConflict: 'business_id,metric_name,metric_source,period_start,granularity'
      });
    metricsUpdated++;

    // Upsert avg sentiment metric
    await supabase
      .from('metrics_timeseries')
      .upsert({
        business_id: businessId,
        metric_name: 'sentiment_avg',
        metric_source: 'integrations',
        value: avgSentiment,
        period_start: todayStart.toISOString(),
        period_end: todayEnd.toISOString(),
        granularity: 'daily',
      }, {
        onConflict: 'business_id,metric_name,metric_source,period_start,granularity'
      });
    metricsUpdated++;
  }

  // Get entity mention counts for today
  const { data: topIssues } = await supabase
    .from('canonical_entities')
    .select('canonical_name, mention_count')
    .eq('business_id', businessId)
    .eq('entity_type', 'issue')
    .order('mention_count', { ascending: false })
    .limit(5);

  if (topIssues && topIssues.length > 0) {
    await supabase
      .from('metrics_timeseries')
      .upsert({
        business_id: businessId,
        metric_name: 'top_issues',
        metric_source: 'entity_resolution',
        value: topIssues.length,
        period_start: todayStart.toISOString(),
        period_end: todayEnd.toISOString(),
        granularity: 'daily',
        metadata: { issues: topIssues },
      }, {
        onConflict: 'business_id,metric_name,metric_source,period_start,granularity'
      });
    metricsUpdated++;
  }

  return metricsUpdated;
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

    console.log(`[brain-process-signals] Processing for business: ${businessId}`);

    // Process external data into signals
    const processResult = await processExternalData(supabase, businessId);
    console.log(`[brain-process-signals] Process result:`, processResult);

    // Update metrics timeseries
    const metricsUpdated = await updateMetricsTimeseries(supabase, businessId);
    console.log(`[brain-process-signals] Metrics updated: ${metricsUpdated}`);

    return new Response(
      JSON.stringify({
        success: true,
        ...processResult,
        metricsUpdated,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("[brain-process-signals] Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
