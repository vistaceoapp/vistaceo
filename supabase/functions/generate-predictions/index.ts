import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Horizon definitions
const HORIZON_RINGS = {
  H0: { label: '30 días', days: 30, type: 'tactical' },
  H1: { label: '90 días', days: 90, type: 'tactical' },
  H2: { label: '6 meses', days: 180, type: 'tactical' },
  H3: { label: '12 meses', days: 365, type: 'strategic' },
  H4: { label: '3 años', days: 1095, type: 'strategic' },
  H5: { label: '5 años', days: 1825, type: 'long_term' },
  H6: { label: '7 años', days: 2555, type: 'long_term' },
  H7: { label: '10 años', days: 3650, type: 'long_term' },
};

const DOMAIN_LABELS: Record<string, string> = {
  cashflow: 'Caja',
  demand: 'Demanda',
  operations: 'Operaciones',
  customer: 'Cliente',
  competition: 'Competencia',
  risk: 'Riesgo',
  strategy: 'Estrategia',
  pricing: 'Precios',
  inventory: 'Inventario',
  sales: 'Ventas',
  marketing: 'Marketing',
  team: 'Equipo',
  tech: 'Tecnología',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const { business_id, horizons = ['H0', 'H1', 'H2', 'H3'], domains = ['cashflow', 'demand', 'operations', 'customer', 'sales'] } = await req.json();

    if (!business_id) {
      throw new Error('business_id is required');
    }

    // Fetch business context
    const [businessRes, brainRes, blueprintRes, setupRes] = await Promise.all([
      fetch(`${SUPABASE_URL}/rest/v1/businesses?id=eq.${business_id}&select=*`, {
        headers: { 'apikey': SUPABASE_SERVICE_ROLE_KEY, 'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}` },
      }),
      fetch(`${SUPABASE_URL}/rest/v1/business_brains?business_id=eq.${business_id}&select=*`, {
        headers: { 'apikey': SUPABASE_SERVICE_ROLE_KEY, 'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}` },
      }),
      fetch(`${SUPABASE_URL}/rest/v1/causal_blueprints?is_active=eq.true&select=*&limit=1`, {
        headers: { 'apikey': SUPABASE_SERVICE_ROLE_KEY, 'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}` },
      }),
      fetch(`${SUPABASE_URL}/rest/v1/business_setup_progress?business_id=eq.${business_id}&select=*`, {
        headers: { 'apikey': SUPABASE_SERVICE_ROLE_KEY, 'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}` },
      }),
    ]);

    const [businesses, brains, blueprints, setupProgress] = await Promise.all([
      businessRes.json(),
      brainRes.json(),
      blueprintRes.json(),
      setupRes.json(),
    ]);

    const business = businesses?.[0];
    const brain = brains?.[0];
    const blueprint = blueprints?.[0];
    const setup = setupProgress?.[0];

    if (!business) {
      throw new Error('Business not found');
    }

    // Build context for AI
    const contextBundle = {
      business_profile: {
        name: business.name,
        country: business.country,
        category: business.category,
        currency: business.currency || 'USD',
        avg_ticket_range: business.avg_ticket_range,
        monthly_revenue_range: business.monthly_revenue_range,
        channel_mix: business.channel_mix,
        service_model: business.service_model,
      },
      brain_state: brain ? {
        primary_business_type: brain.primary_business_type,
        current_focus: brain.current_focus,
        factual_memory: brain.factual_memory,
        dynamic_memory: brain.dynamic_memory,
        decisions_memory: brain.decisions_memory,
        confidence_score: brain.confidence_score,
        mvc_completion_pct: brain.mvc_completion_pct,
        locale_profile: brain.locale_profile,
      } : null,
      blueprint: blueprint ? {
        business_type: blueprint.business_type,
        sector: blueprint.sector,
        causal_graph: blueprint.causal_graph,
        native_metrics: blueprint.native_metrics,
        leading_indicators: blueprint.leading_indicators,
        seasonality_pattern: blueprint.seasonality_pattern,
        structural_risks: blueprint.structural_risks,
      } : null,
      setup_data: setup?.setup_data || {},
      requested_horizons: horizons,
      requested_domains: domains,
      current_date: new Date().toISOString().split('T')[0],
    };

    // System prompt for prediction generation
    const systemPrompt = `Sos el "Motor de Predicciones Planetario" de VistaCEO. Tu misión es generar predicciones de negocio ultra-personalizadas, auditables y accionables.

PRINCIPIOS INNEGOCIABLES:
1. CERO INVENTO: Nunca afirmes como "Confirmada" (Level A) lo que no tenga evidencia suficiente.
2. Probabilidad ≠ Confianza: Probabilidad = chance de que ocurra. Confianza = calidad del modelo/evidencia.
3. Hiper-personalización: Cada predicción debe estar explicada por el contexto del negocio.
4. Acción y ventana: Toda predicción incluye ventana de acción o declara si no hay palanca controlable.

NIVELES DE PUBLICACIÓN (GATES ANTI-INVENTO):
- Level A ("Confirmada"): Evidencia interna suficiente + cadena causal explicable + calibración histórica
- Level B ("Probable"): Evidencia parcial + drivers fuertes + rango amplio
- Level C ("En Bruma"): Evidencia baja, exploratoria, requiere calibración

DOMINIOS DISPONIBLES: ${Object.entries(DOMAIN_LABELS).map(([k, v]) => `${k}=${v}`).join(', ')}

HORIZONTES DISPONIBLES: ${Object.entries(HORIZON_RINGS).map(([k, v]) => `${k}=${v.label}`).join(', ')}

REGLAS POR HORIZONTE:
- H0-H1 (30-90d): Predicción Táctica. Requiere señales operativas fuertes. Ventana de acción exacta.
- H2-H3 (6-12m): Predicción Planificable. Rangos low/base/high + escenarios.
- H4-H5 (3-5y): Predicción Estratégica. Rutas probables, no certezas. Drivers dominantes + checkpoints.
- H6-H7 (7-10y): Escenarios de Largo Plazo. 2-4 futuros plausibles, NO predicción dura.

RESPONDE SIEMPRE con un JSON array de predicciones siguiendo este schema exacto:
{
  "predictions": [
    {
      "domain": "cashflow|demand|operations|customer|competition|risk|strategy|pricing|inventory|sales|marketing|team|tech",
      "horizon_ring": "H0|H1|H2|H3|H4|H5|H6|H7",
      "title": "string (1 línea clara)",
      "summary": "string (máx 2 líneas)",
      "publication_level": "A|B|C",
      "probability": 0.0-1.0,
      "confidence": 0.0-1.0,
      "uncertainty_band": {
        "metric": "revenue|cash|margin|conversion|churn|capacity|sla|inventory|other",
        "unit": "USD|PERCENT|COUNT|DAYS",
        "low": number,
        "base": number,
        "high": number
      },
      "time_window": {
        "start": "YYYY-MM-DD",
        "end": "YYYY-MM-DD",
        "action_window": {"start":"YYYY-MM-DD","end":"YYYY-MM-DD"}
      },
      "estimated_impact": {
        "primary_metric": {"name":"...", "unit":"USD|PERCENT|COUNT|DAYS", "value": number, "range":[low,high]}
      },
      "evidence": {
        "evidence_strength": "low|medium|high",
        "signals_internal_top": [{"signal_id":"sig_...", "name":"...", "source":"internal|ops|external", "trend":"up|down|stable", "latest_value": "...", "unit":"...", "why_it_matters":"..."}],
        "signals_external_top": [],
        "assumptions": ["..."],
        "data_gaps": ["..."]
      },
      "causal_chain": {
        "nodes": ["driver1", "effect1", "outcome"],
        "edges": [{"from":"driver1","to":"effect1","sign":"+","lag":"H0","strength":0.7}]
      },
      "is_breakpoint": false,
      "recommended_actions": [
        {"tier":"48h|14d|90d", "action":"...", "why":"...", "kpi":"...", "expected_effect":"..."}
      ],
      "available_actions": {
        "convert_to_mission": {
          "mission_title":"...",
          "objective":"...",
          "steps":["paso 1", "paso 2"],
          "kpi_targets":["..."],
          "deadline":"YYYY-MM-DD"
        }
      },
      "visual_payload": {
        "bubble": {"x_prob":0.0-1.0,"y_impact":0-100,"size":10-50,"urgency":0-1,"glow":0-1}
      }
    }
  ],
  "calibration_events": [
    {
      "priority": 1-5,
      "reason": "qué predicción mejora y por qué",
      "improves": [{"prediction_id":"temp_1", "delta_confidence":0.1, "delta_uncertainty_reduction":0.15}],
      "input_type": "tap|slider|minmax|quick_number|select",
      "question": "pregunta corta",
      "unit": "USD|PERCENT|COUNT",
      "options": [{"label":"...", "value":"..."}],
      "min": null,
      "max": null,
      "default_value": null
    }
  ]
}

Genera entre 3-8 predicciones relevantes según el contexto del negocio. Incluye 1-3 eventos de calibración si faltan datos críticos.`;

    const userPrompt = `Contexto del negocio:
${JSON.stringify(contextBundle, null, 2)}

Genera predicciones para los horizontes ${horizons.join(', ')} en los dominios ${domains.join(', ')}.
Personaliza según el tipo de negocio "${brain?.primary_business_type || business.category}" en "${business.country}".
Si faltan datos críticos, usa Level C (En Bruma) y genera CalibrationEvents.`;

    // Call Lovable AI
    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.3,
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('[generate-predictions] AI error:', aiResponse.status, errorText);
      throw new Error(`AI gateway error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const content = aiData.choices?.[0]?.message?.content || '';

    // Parse JSON from response
    let parsedContent;
    try {
      // Extract JSON from markdown code blocks if present
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
      const jsonStr = jsonMatch ? jsonMatch[1].trim() : content.trim();
      parsedContent = JSON.parse(jsonStr);
    } catch (parseError) {
      console.error('[generate-predictions] Failed to parse AI response:', content);
      throw new Error('Failed to parse AI prediction response');
    }

    const predictions = parsedContent.predictions || [];
    const calibrationEvents = parsedContent.calibration_events || [];

    // Insert predictions into database
    const now = new Date().toISOString();
    const predictionsToInsert = predictions.map((pred: any, idx: number) => ({
      business_id,
      brain_id: brain?.id || null,
      domain: pred.domain,
      horizon_ring: pred.horizon_ring,
      title: pred.title,
      summary: pred.summary,
      publication_level: pred.publication_level || 'C',
      probability: pred.probability || 0.5,
      confidence: pred.confidence || 0.5,
      uncertainty_band: pred.uncertainty_band || { metric: 'other', unit: 'PERCENT', low: 0, base: 0, high: 0 },
      time_window: pred.time_window || {},
      estimated_impact: pred.estimated_impact || {},
      evidence: pred.evidence || { evidence_strength: 'low', signals_internal_top: [], signals_external_top: [], assumptions: [], data_gaps: [] },
      causal_chain: pred.causal_chain || { nodes: [], edges: [] },
      is_breakpoint: pred.is_breakpoint || false,
      breakpoint_thresholds: pred.breakpoint_thresholds || null,
      recommended_actions: pred.recommended_actions || [],
      available_actions: pred.available_actions || {},
      visual_payload: pred.visual_payload || { bubble: { x_prob: pred.probability || 0.5, y_impact: 50, size: 20, urgency: 0.5, glow: 0.5 } },
      status: 'active',
      created_at: now,
      updated_at: now,
    }));

    if (predictionsToInsert.length > 0) {
      const insertRes = await fetch(`${SUPABASE_URL}/rest/v1/predictions`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_SERVICE_ROLE_KEY,
          'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation',
        },
        body: JSON.stringify(predictionsToInsert),
      });

      if (!insertRes.ok) {
        const errText = await insertRes.text();
        console.error('[generate-predictions] Insert error:', errText);
      }
    }

    // Insert calibration events
    const calibrationsToInsert = calibrationEvents.map((cal: any) => ({
      business_id,
      priority: cal.priority || 3,
      reason: cal.reason,
      improves: cal.improves || [],
      input_type: cal.input_type || 'select',
      question: cal.question,
      unit: cal.unit || null,
      options: cal.options || null,
      min_value: cal.min || null,
      max_value: cal.max || null,
      default_value: cal.default_value || null,
      status: 'pending',
      created_at: now,
      updated_at: now,
    }));

    if (calibrationsToInsert.length > 0) {
      await fetch(`${SUPABASE_URL}/rest/v1/prediction_calibrations`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_SERVICE_ROLE_KEY,
          'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(calibrationsToInsert),
      });
    }

    console.log(`[generate-predictions] Generated ${predictions.length} predictions and ${calibrationEvents.length} calibrations for business ${business_id}`);

    return new Response(JSON.stringify({
      success: true,
      predictions_count: predictions.length,
      calibrations_count: calibrationEvents.length,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('[generate-predictions] Error:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
