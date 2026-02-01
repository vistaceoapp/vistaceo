import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

// Horizon definitions
const HORIZON_RINGS = {
  H0: { label: '30 días', days: 30, type: 'tactical', certainty: 'high' },
  H1: { label: '90 días', days: 90, type: 'tactical', certainty: 'high' },
  H2: { label: '6 meses', days: 180, type: 'tactical', certainty: 'medium' },
  H3: { label: '12 meses', days: 365, type: 'strategic', certainty: 'medium' },
  H4: { label: '3 años', days: 1095, type: 'strategic', certainty: 'low' },
  H5: { label: '5 años', days: 1825, type: 'long_term', certainty: 'speculative' },
  H6: { label: '7 años', days: 2555, type: 'long_term', certainty: 'speculative' },
  H7: { label: '10 años', days: 3650, type: 'long_term', certainty: 'speculative' },
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

// Sector-specific prediction contexts for 180+ business types
const SECTOR_PREDICTION_CONTEXTS: Record<string, {
  key_drivers: string[];
  leading_indicators: string[];
  common_risks: string[];
  seasonality_factors: string[];
  typical_horizons: string[];
  native_metrics: string[];
}> = {
  // GASTRONOMY
  restaurant: {
    key_drivers: ['ticket promedio', 'rotación de mesas', 'costo de alimentos', 'ocupación por turno'],
    leading_indicators: ['reservas anticipadas', 'tendencia de reseñas', 'menciones en redes', 'tráfico peatonal'],
    common_risks: ['inflación de insumos', 'rotación de personal', 'competencia delivery', 'estacionalidad'],
    seasonality_factors: ['feriados', 'eventos deportivos', 'clima', 'temporada turística'],
    typical_horizons: ['H0', 'H1', 'H2'],
    native_metrics: ['covers/hora', 'food cost %', 'ticket promedio', 'rating promedio'],
  },
  cafeteria: {
    key_drivers: ['transacciones/hora', 'ticket promedio', 'horario pico', 'mix bebidas/alimentos'],
    leading_indicators: ['clima', 'tráfico oficinas cercanas', 'tendencias café especialidad'],
    common_risks: ['precio del café', 'competencia cadenas', 'cambio hábitos trabajo remoto'],
    seasonality_factors: ['invierno/verano', 'vuelta a clases', 'home office'],
    typical_horizons: ['H0', 'H1'],
    native_metrics: ['bebidas/día', 'ticket promedio', 'repeat customers'],
  },
  bar: {
    key_drivers: ['consumo promedio', 'ocupación nocturna', 'eventos especiales', 'mix bebidas'],
    leading_indicators: ['eventos ciudad', 'clima fin de semana', 'actividad redes'],
    common_risks: ['regulaciones alcohol', 'ruido/vecinos', 'seguridad'],
    seasonality_factors: ['fin de semana', 'verano', 'eventos deportivos', 'fiestas'],
    typical_horizons: ['H0', 'H1', 'H2'],
    native_metrics: ['consumo promedio', 'ocupación %', 'ticket promedio'],
  },
  pizzeria: {
    key_drivers: ['delivery vs local', 'tiempo de preparación', 'costo harina/queso', 'rating apps'],
    leading_indicators: ['rating delivery apps', 'tiempo respuesta', 'reseñas'],
    common_risks: ['comisiones apps', 'competencia cadenas', 'inflación insumos'],
    seasonality_factors: ['fines de semana', 'partidos', 'mal clima'],
    typical_horizons: ['H0', 'H1'],
    native_metrics: ['pizzas/día', 'tiempo preparación', '% delivery'],
  },
  // HEALTH
  consultorio: {
    key_drivers: ['pacientes/día', 'ticket consulta', 'tasa retorno', 'obras sociales'],
    leading_indicators: ['agenda anticipada', 'cancelaciones', 'referencias'],
    common_risks: ['cambios obras sociales', 'competencia', 'burnout'],
    seasonality_factors: ['invierno (gripes)', 'vuelta vacaciones', 'fin de año'],
    typical_horizons: ['H0', 'H1', 'H2', 'H3'],
    native_metrics: ['pacientes/semana', 'tasa retorno', 'ticket promedio'],
  },
  odontologia: {
    key_drivers: ['procedimientos/mes', 'mix tratamientos', 'materiales', 'financiación'],
    leading_indicators: ['consultas agendadas', 'tratamientos en curso', 'referencias'],
    common_risks: ['costo materiales importados', 'devaluación', 'competencia cadenas'],
    seasonality_factors: ['pre-vacaciones', 'fin de año', 'vuelta clases'],
    typical_horizons: ['H0', 'H1', 'H2', 'H3'],
    native_metrics: ['procedimientos/mes', 'ticket promedio', 'tasa finalización tratamientos'],
  },
  gimnasio: {
    key_drivers: ['membresías activas', 'retención', 'clases grupales', 'personal trainers'],
    leading_indicators: ['visitas/semana', 'asistencia clases', 'renovaciones anticipadas'],
    common_risks: ['estacionalidad', 'competencia apps', 'deserción post-verano'],
    seasonality_factors: ['enero (propósitos)', 'pre-verano', 'post-vacaciones'],
    typical_horizons: ['H0', 'H1', 'H2', 'H3'],
    native_metrics: ['membresías activas', 'churn mensual', 'visitas/miembro'],
  },
  spa: {
    key_drivers: ['servicios/día', 'ticket promedio', 'paquetes', 'productos retail'],
    leading_indicators: ['reservas anticipadas', 'gift cards', 'eventos especiales'],
    common_risks: ['estacionalidad', 'personal especializado', 'productos importados'],
    seasonality_factors: ['día madre', 'san valentín', 'fiestas', 'pre-verano'],
    typical_horizons: ['H0', 'H1', 'H2'],
    native_metrics: ['servicios/día', 'ticket promedio', 'retail/servicio'],
  },
  // RETAIL
  boutique: {
    key_drivers: ['ticket promedio', 'conversión', 'rotación inventario', 'mix categorías'],
    leading_indicators: ['tráfico tienda', 'engagement redes', 'devoluciones'],
    common_risks: ['temporadas', 'tendencias', 'e-commerce', 'inventario obsoleto'],
    seasonality_factors: ['temporadas moda', 'fiestas', 'vuelta clases', 'liquidaciones'],
    typical_horizons: ['H0', 'H1', 'H2', 'H3'],
    native_metrics: ['unidades/transacción', 'ticket promedio', 'rotación inventario'],
  },
  ecommerce: {
    key_drivers: ['conversión', 'CAC', 'AOV', 'tasa abandono carrito'],
    leading_indicators: ['tráfico web', 'carritos abandonados', 'wishlist adds'],
    common_risks: ['competencia', 'costos envío', 'devoluciones', 'cambios algoritmos'],
    seasonality_factors: ['cyber monday', 'hot sale', 'fiestas', 'día del niño'],
    typical_horizons: ['H0', 'H1', 'H2', 'H3'],
    native_metrics: ['conversión %', 'AOV', 'CAC', 'LTV'],
  },
  // SERVICES
  peluqueria: {
    key_drivers: ['servicios/día', 'ticket promedio', 'productos retail', 'fidelización'],
    leading_indicators: ['agenda próxima semana', 'nuevos clientes', 'referencias'],
    common_risks: ['rotación estilistas', 'tendencias', 'competencia low-cost'],
    seasonality_factors: ['fiestas', 'casamientos', 'egresados', 'verano'],
    typical_horizons: ['H0', 'H1', 'H2'],
    native_metrics: ['servicios/día', 'ticket promedio', 'retención clientes'],
  },
  hotel: {
    key_drivers: ['ocupación', 'ADR', 'RevPAR', 'canales distribución'],
    leading_indicators: ['reservas futuras', 'cancelaciones', 'reviews OTAs'],
    common_risks: ['estacionalidad', 'OTAs comisiones', 'eventos ciudad', 'tipo cambio'],
    seasonality_factors: ['vacaciones', 'feriados largos', 'eventos', 'congresos'],
    typical_horizons: ['H0', 'H1', 'H2', 'H3', 'H4'],
    native_metrics: ['ocupación %', 'ADR', 'RevPAR', 'rating OTAs'],
  },
  // B2B
  agencia_marketing: {
    key_drivers: ['MRR', 'retención clientes', 'pipeline', 'utilización equipo'],
    leading_indicators: ['propuestas enviadas', 'meetings agendados', 'NPS clientes'],
    common_risks: ['concentración clientes', 'rotación talento', 'scope creep'],
    seasonality_factors: ['presupuestos Q1', 'verano lento', 'fin año'],
    typical_horizons: ['H0', 'H1', 'H2', 'H3', 'H4'],
    native_metrics: ['MRR', 'churn', 'NPS', 'utilización %'],
  },
  consultoria: {
    key_drivers: ['horas facturables', 'tarifa/hora', 'pipeline proyectos', 'retención'],
    leading_indicators: ['propuestas activas', 'referencias', 'repeat business'],
    common_risks: ['dependencia pocos clientes', 'commoditización', 'talento'],
    seasonality_factors: ['presupuestos anuales', 'verano', 'cierres fiscales'],
    typical_horizons: ['H1', 'H2', 'H3', 'H4'],
    native_metrics: ['horas facturables', 'tarifa promedio', 'pipeline $'],
  },
  estudio_contable: {
    key_drivers: ['clientes activos', 'fee mensual', 'servicios adicionales', 'retención'],
    leading_indicators: ['nuevas consultas', 'deadlines fiscales', 'upsells'],
    common_risks: ['regulaciones', 'automatización', 'competencia precio'],
    seasonality_factors: ['vencimientos AFIP', 'balances anuales', 'ganancias'],
    typical_horizons: ['H0', 'H1', 'H2', 'H3'],
    native_metrics: ['clientes activos', 'fee promedio', 'servicios/cliente'],
  },
  estudio_juridico: {
    key_drivers: ['casos activos', 'horas facturables', 'success fees', 'retainers'],
    leading_indicators: ['consultas nuevas', 'referencias', 'casos ganados'],
    common_risks: ['duración casos', 'cobro', 'reputación', 'especialización'],
    seasonality_factors: ['feria judicial', 'cierres año', 'elecciones'],
    typical_horizons: ['H1', 'H2', 'H3', 'H4'],
    native_metrics: ['casos activos', 'horas facturadas', 'tasa cobro'],
  },
  software_dev: {
    key_drivers: ['MRR/ARR', 'churn', 'velocidad desarrollo', 'NPS'],
    leading_indicators: ['trials activos', 'feature requests', 'tickets soporte'],
    common_risks: ['competencia', 'deuda técnica', 'talento', 'concentración'],
    seasonality_factors: ['presupuestos Q1', 'conferencias tech', 'verano'],
    typical_horizons: ['H1', 'H2', 'H3', 'H4', 'H5'],
    native_metrics: ['MRR', 'churn %', 'NPS', 'CAC payback'],
  },
};

// Get sector context with fallback
function getSectorContext(businessType: string): typeof SECTOR_PREDICTION_CONTEXTS['restaurant'] {
  const normalizedType = businessType.toLowerCase().replace(/[_\s-]/g, '');
  
  // Try exact match first
  if (SECTOR_PREDICTION_CONTEXTS[businessType]) {
    return SECTOR_PREDICTION_CONTEXTS[businessType];
  }
  
  // Try normalized match
  for (const [key, value] of Object.entries(SECTOR_PREDICTION_CONTEXTS)) {
    if (key.replace(/[_\s-]/g, '') === normalizedType) {
      return value;
    }
  }
  
  // Fallback based on keywords
  if (normalizedType.includes('restaurant') || normalizedType.includes('gastro') || normalizedType.includes('comida')) {
    return SECTOR_PREDICTION_CONTEXTS.restaurant;
  }
  if (normalizedType.includes('cafe') || normalizedType.includes('coffee')) {
    return SECTOR_PREDICTION_CONTEXTS.cafeteria;
  }
  if (normalizedType.includes('dental') || normalizedType.includes('odonto')) {
    return SECTOR_PREDICTION_CONTEXTS.odontologia;
  }
  if (normalizedType.includes('gym') || normalizedType.includes('fitness')) {
    return SECTOR_PREDICTION_CONTEXTS.gimnasio;
  }
  if (normalizedType.includes('hotel') || normalizedType.includes('hostel')) {
    return SECTOR_PREDICTION_CONTEXTS.hotel;
  }
  if (normalizedType.includes('ecommerce') || normalizedType.includes('tienda')) {
    return SECTOR_PREDICTION_CONTEXTS.ecommerce;
  }
  if (normalizedType.includes('marketing') || normalizedType.includes('agencia')) {
    return SECTOR_PREDICTION_CONTEXTS.agencia_marketing;
  }
  if (normalizedType.includes('software') || normalizedType.includes('tech') || normalizedType.includes('saas')) {
    return SECTOR_PREDICTION_CONTEXTS.software_dev;
  }
  if (normalizedType.includes('contable') || normalizedType.includes('contador')) {
    return SECTOR_PREDICTION_CONTEXTS.estudio_contable;
  }
  if (normalizedType.includes('juridico') || normalizedType.includes('abogado')) {
    return SECTOR_PREDICTION_CONTEXTS.estudio_juridico;
  }
  
  // Ultimate fallback
  return SECTOR_PREDICTION_CONTEXTS.restaurant;
}

// Voice localization based on country
function getLocaleVoice(country: string): { voice: string; examples: string[] } {
  const voiceMap: Record<string, { voice: string; examples: string[] }> = {
    AR: { voice: 'voseo', examples: ['vas a ver', 'tenés que', 'podés'] },
    UY: { voice: 'voseo', examples: ['vas a ver', 'tenés que', 'podés'] },
    CL: { voice: 'tuteo_cl', examples: ['vas a ver', 'tienes que', 'puedes'] },
    CO: { voice: 'tuteo', examples: ['vas a ver', 'tienes que', 'puedes'] },
    MX: { voice: 'tuteo', examples: ['vas a ver', 'tienes que', 'puedes'] },
    ES: { voice: 'tuteo_es', examples: ['vas a ver', 'tienes que', 'puedes'] },
    PE: { voice: 'tuteo', examples: ['vas a ver', 'tienes que', 'puedes'] },
    EC: { voice: 'tuteo', examples: ['vas a ver', 'tienes que', 'puedes'] },
  };
  return voiceMap[country] || voiceMap.AR;
}

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

    const { 
      business_id, 
      horizons = ['H0', 'H1', 'H2', 'H3'], 
      domains = ['cashflow', 'demand', 'operations', 'customer', 'sales', 'risk'],
      force_refresh = false
    } = await req.json();

    if (!business_id) {
      throw new Error('business_id is required');
    }

    console.log(`[generate-predictions] Starting for business ${business_id}`);

    // Fetch comprehensive business context
    const [businessRes, brainRes, blueprintRes, setupRes, actionsRes, opportunitiesRes, checkinsRes, snapshotsRes] = await Promise.all([
      fetch(`${SUPABASE_URL}/rest/v1/businesses?id=eq.${business_id}&select=*`, {
        headers: { 'apikey': SUPABASE_SERVICE_ROLE_KEY, 'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}` },
      }),
      fetch(`${SUPABASE_URL}/rest/v1/business_brains?business_id=eq.${business_id}&select=*`, {
        headers: { 'apikey': SUPABASE_SERVICE_ROLE_KEY, 'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}` },
      }),
      fetch(`${SUPABASE_URL}/rest/v1/causal_blueprints?is_active=eq.true&select=*&limit=5`, {
        headers: { 'apikey': SUPABASE_SERVICE_ROLE_KEY, 'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}` },
      }),
      fetch(`${SUPABASE_URL}/rest/v1/business_setup_progress?business_id=eq.${business_id}&select=*`, {
        headers: { 'apikey': SUPABASE_SERVICE_ROLE_KEY, 'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}` },
      }),
      fetch(`${SUPABASE_URL}/rest/v1/daily_actions?business_id=eq.${business_id}&select=id,title,status,category,created_at&order=created_at.desc&limit=10`, {
        headers: { 'apikey': SUPABASE_SERVICE_ROLE_KEY, 'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}` },
      }),
      fetch(`${SUPABASE_URL}/rest/v1/opportunities?business_id=eq.${business_id}&select=id,title,source,impact_score,is_converted&order=created_at.desc&limit=10`, {
        headers: { 'apikey': SUPABASE_SERVICE_ROLE_KEY, 'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}` },
      }),
      fetch(`${SUPABASE_URL}/rest/v1/business_checkins?business_id=eq.${business_id}&select=*&order=created_at.desc&limit=5`, {
        headers: { 'apikey': SUPABASE_SERVICE_ROLE_KEY, 'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}` },
      }),
      fetch(`${SUPABASE_URL}/rest/v1/snapshots?business_id=eq.${business_id}&select=*&order=created_at.desc&limit=3`, {
        headers: { 'apikey': SUPABASE_SERVICE_ROLE_KEY, 'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}` },
      }),
    ]);

    const [businesses, brains, blueprints, setupProgress, actions, opportunities, checkins, snapshots] = await Promise.all([
      businessRes.json(),
      brainRes.json(),
      blueprintRes.json(),
      setupRes.json(),
      actionsRes.json(),
      opportunitiesRes.json(),
      checkinsRes.json(),
      snapshotsRes.json(),
    ]);

    const business = businesses?.[0];
    const brain = brains?.[0];
    const setup = setupProgress?.[0];
    const latestSnapshot = snapshots?.[0];

    if (!business) {
      throw new Error('Business not found');
    }

    const businessType = brain?.primary_business_type || business.category || 'restaurant';
    const sectorContext = getSectorContext(businessType);
    const localeVoice = getLocaleVoice(business.country || 'AR');
    
    // Find matching blueprint
    const matchingBlueprint = blueprints?.find((bp: any) => 
      bp.business_type === businessType || bp.sector === business.category
    ) || blueprints?.[0];

    // Calculate data quality score
    const dataQuality = {
      hasRevenue: !!business.monthly_revenue_range,
      hasTicket: !!business.avg_ticket_range,
      hasChannelMix: !!business.channel_mix,
      hasBrain: !!brain,
      hasCheckins: (checkins?.length || 0) > 0,
      hasSnapshots: (snapshots?.length || 0) > 0,
      hasActions: (Array.isArray(actions) ? actions.length : 0) > 0,
      factualMemorySize: Object.keys(brain?.factual_memory || {}).length,
      brainConfidence: brain?.confidence_score || 0,
      overallScore: 0,
    };
    dataQuality.overallScore = (
      (dataQuality.hasRevenue ? 15 : 0) +
      (dataQuality.hasTicket ? 10 : 0) +
      (dataQuality.hasChannelMix ? 10 : 0) +
      (dataQuality.hasBrain ? 15 : 0) +
      (dataQuality.hasCheckins ? 10 : 0) +
      (dataQuality.hasSnapshots ? 10 : 0) +
      (dataQuality.hasActions ? 5 : 0) +
      Math.min(dataQuality.factualMemorySize * 2, 15) +
      (dataQuality.brainConfidence * 10)
    );

    // Build ultra-contextualized prompt
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
        setup_completed: business.setup_completed,
        precision_score: business.precision_score,
      },
      brain_state: brain ? {
        primary_business_type: brain.primary_business_type,
        secondary_business_type: brain.secondary_business_type,
        current_focus: brain.current_focus,
        factual_memory: brain.factual_memory,
        dynamic_memory: brain.dynamic_memory,
        decisions_memory: brain.decisions_memory,
        preferences_memory: brain.preferences_memory,
        confidence_score: brain.confidence_score,
        mvc_completion_pct: brain.mvc_completion_pct,
        mvc_gaps: brain.mvc_gaps,
        locale_profile: brain.locale_profile,
        user_style_model: brain.user_style_model,
        success_patterns: brain.success_patterns,
      } : null,
      sector_context: sectorContext,
      blueprint: matchingBlueprint ? {
        business_type: matchingBlueprint.business_type,
        sector: matchingBlueprint.sector,
        causal_graph: matchingBlueprint.causal_graph,
        native_metrics: matchingBlueprint.native_metrics,
        leading_indicators: matchingBlueprint.leading_indicators,
        seasonality_pattern: matchingBlueprint.seasonality_pattern,
        structural_risks: matchingBlueprint.structural_risks,
        controllable_levers: matchingBlueprint.controllable_levers,
        typical_shocks: matchingBlueprint.typical_shocks,
      } : null,
      setup_data: setup?.setup_data || {},
      latest_health: latestSnapshot ? {
        total_score: latestSnapshot.total_score,
        dimensions: latestSnapshot.dimensions_json,
        strengths: latestSnapshot.strengths,
        weaknesses: latestSnapshot.weaknesses,
      } : null,
      recent_activity: {
        actions_active: Array.isArray(actions) ? actions.filter((a: any) => a.status === 'pending').length : 0,
        actions_completed: Array.isArray(actions) ? actions.filter((a: any) => a.status === 'completed').length : 0,
        opportunities_pending: Array.isArray(opportunities) ? opportunities.filter((o: any) => !o.is_converted).length : 0,
        last_checkin: checkins?.[0]?.created_at || null,
      },
      data_quality: dataQuality,
      locale: localeVoice,
      requested_horizons: horizons,
      requested_domains: domains,
      current_date: new Date().toISOString().split('T')[0],
    };

    // Ultra-personalized system prompt
    const systemPrompt = `Sos el "Motor de Predicciones Planetario" de VistaCEO para ${business.name}, un/a ${businessType} en ${business.country}.

## CONTEXTO ESPECÍFICO DEL SECTOR: ${businessType.toUpperCase()}
- Drivers clave: ${sectorContext.key_drivers.join(', ')}
- Indicadores adelantados: ${sectorContext.leading_indicators.join(', ')}
- Riesgos comunes: ${sectorContext.common_risks.join(', ')}
- Factores estacionales: ${sectorContext.seasonality_factors.join(', ')}
- Métricas nativas: ${sectorContext.native_metrics.join(', ')}

## ESTADO DEL BRAIN (Conocimiento del negocio)
${brain ? `- Tipo primario: ${brain.primary_business_type}
- Foco actual: ${brain.current_focus}
- Confianza del modelo: ${Math.round((brain.confidence_score || 0) * 100)}%
- Completitud MVC: ${brain.mvc_completion_pct || 0}%
- Gaps detectados: ${JSON.stringify(brain.mvc_gaps || [])}
- Memoria factual: ${Object.keys(brain.factual_memory || {}).length} datos
- Patrones de éxito: ${JSON.stringify(brain.success_patterns || [])}` : '⚠️ Sin Brain configurado - usar Level C para todas las predicciones'}

## CALIDAD DE DATOS: ${dataQuality.overallScore}/100
${dataQuality.overallScore < 30 ? '⚠️ DATOS INSUFICIENTES: Generar solo predicciones Level C y muchos CalibrationEvents' : 
  dataQuality.overallScore < 60 ? '⚡ DATOS PARCIALES: Mezclar Level B y C, incluir CalibrationEvents específicos' :
  '✅ DATOS SUFICIENTES: Permitir Level A para predicciones tácticas bien fundamentadas'}

## SALUD ACTUAL DEL NEGOCIO
${latestSnapshot ? `- Score total: ${latestSnapshot.total_score}/100
- Fortalezas: ${JSON.stringify(latestSnapshot.strengths)}
- Debilidades: ${JSON.stringify(latestSnapshot.weaknesses)}` : 'Sin snapshot reciente'}

## LOCALIZACIÓN
- País: ${business.country}
- Voz: ${localeVoice.voice} (ej: "${localeVoice.examples.join('", "')}")
- Moneda: ${business.currency || 'USD'}
- SIEMPRE usar segunda persona (${localeVoice.voice === 'voseo' ? 'vos' : 'tú'})

## PRINCIPIOS INNEGOCIABLES
1. CERO INVENTO: Level A solo con evidencia sólida del Brain/Setup
2. Hiper-personalización: Cada predicción DEBE mencionar datos específicos de ESTE negocio
3. Cadena causal: Explicar el "por qué" con lógica del sector
4. Ventana de acción: Cuándo actuar y qué hacer específicamente
5. Sorprendente: Revelar insights no obvios que el dueño no esperaría

## NIVELES DE PUBLICACIÓN
- Level A ("Confirmada"): Solo si tenés datos internos que lo respalden + calibración histórica
- Level B ("Probable"): Evidencia parcial + patrones del sector + rangos amplios
- Level C ("En Bruma"): Hipótesis basada en sector, requiere calibración

## RESPUESTA JSON OBLIGATORIA
{
  "predictions": [
    {
      "domain": "cashflow|demand|operations|customer|competition|risk|strategy|pricing|inventory|sales|marketing|team|tech",
      "horizon_ring": "H0|H1|H2|H3|H4|H5|H6|H7",
      "title": "Título claro y específico para ${business.name}",
      "summary": "Máx 2 líneas explicando el insight único",
      "publication_level": "A|B|C",
      "probability": 0.0-1.0,
      "confidence": 0.0-1.0,
      "uncertainty_band": {
        "metric": "revenue|cash|margin|conversion|churn|capacity|sla|inventory|other",
        "unit": "USD|${business.currency || 'ARS'}|PERCENT|COUNT|DAYS",
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
        "primary_metric": {"name":"...", "unit":"...", "value": number, "range":[low,high]}
      },
      "evidence": {
        "evidence_strength": "low|medium|high",
        "signals_internal_top": [{"signal_id":"sig_...", "name":"dato específico del Brain/Setup", "source":"internal", "trend":"up|down|stable", "latest_value":"...", "unit":"...", "why_it_matters":"..."}],
        "signals_external_top": [{"signal_id":"sig_...", "name":"tendencia sector", "source":"external", "trend":"...", "why_it_matters":"..."}],
        "assumptions": ["supuestos explícitos"],
        "data_gaps": ["qué falta para subir nivel"]
      },
      "causal_chain": {
        "nodes": ["driver específico del negocio", "efecto intermedio", "resultado"],
        "edges": [{"from":"...", "to":"...", "sign":"+|-", "lag":"H0|H1", "strength":0.0-1.0}]
      },
      "is_breakpoint": false,
      "recommended_actions": [
        {"tier":"48h|14d|90d", "action":"acción concreta para ${business.name}", "why":"razón específica", "kpi":"métrica a medir", "expected_effect":"resultado esperado"}
      ],
      "available_actions": {
        "convert_to_mission": {
          "mission_title": "Misión clara",
          "objective": "Objetivo SMART",
          "steps": ["paso 1 específico", "paso 2"],
          "kpi_targets": ["meta medible"],
          "deadline": "YYYY-MM-DD"
        }
      },
      "visual_payload": {
        "bubble": {"x_prob":0.0-1.0, "y_impact":0-100, "size":10-50, "urgency":0-1, "glow":0-1}
      }
    }
  ],
  "calibration_events": [
    {
      "priority": 1-5,
      "reason": "Por qué este dato mejora las predicciones de ${business.name}",
      "improves": [{"prediction_domain":"...", "delta_confidence":0.1-0.3}],
      "input_type": "tap|slider|select|quick_number",
      "question": "Pregunta en ${localeVoice.voice} sobre ${businessType}",
      "unit": "...",
      "options": [{"label":"opción relevante", "value":"..."}]
    }
  ]
}

Genera 4-8 predicciones ULTRA-PERSONALIZADAS. Incluye 2-4 CalibrationEvents si hay gaps críticos.`;

    const userPrompt = `CONTEXTO COMPLETO:
${JSON.stringify(contextBundle, null, 2)}

INSTRUCCIONES:
1. Analiza el contexto del negocio "${business.name}" (${businessType} en ${business.country})
2. Genera predicciones para horizontes: ${horizons.join(', ')}
3. Cubre dominios: ${domains.join(', ')}
4. Personaliza según el Brain state y sector context
5. Si faltan datos críticos, usa Level C y crea CalibrationEvents
6. Sé SORPRENDENTE: revela insights que el dueño no esperaría
7. Usa siempre ${localeVoice.voice} y moneda ${business.currency || 'USD'}`;

    console.log(`[generate-predictions] Calling AI with ${dataQuality.overallScore}/100 data quality`);

    // Call Lovable AI with optimized model
    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-pro',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.25,
        max_tokens: 8000,
      }),
    });

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limits exceeded, please try again later' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (aiResponse.status === 402) {
        return new Response(JSON.stringify({ error: 'Payment required' }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      const errorText = await aiResponse.text();
      console.error('[generate-predictions] AI error:', aiResponse.status, errorText);
      throw new Error(`AI gateway error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const content = aiData.choices?.[0]?.message?.content || '';

    // Parse JSON from response
    let parsedContent;
    try {
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
      const jsonStr = jsonMatch ? jsonMatch[1].trim() : content.trim();
      parsedContent = JSON.parse(jsonStr);
    } catch (parseError) {
      console.error('[generate-predictions] Failed to parse AI response:', content.substring(0, 500));
      throw new Error('Failed to parse AI prediction response');
    }

    const predictions = parsedContent.predictions || [];
    const calibrationEvents = parsedContent.calibration_events || [];

    console.log(`[generate-predictions] Generated ${predictions.length} predictions, ${calibrationEvents.length} calibrations`);

    // Insert predictions into database
    const now = new Date().toISOString();
    const predictionsToInsert = predictions.map((pred: any) => ({
      business_id,
      brain_id: brain?.id || null,
      domain: pred.domain,
      horizon_ring: pred.horizon_ring,
      title: pred.title,
      summary: pred.summary,
      publication_level: pred.publication_level || 'C',
      probability: Math.max(0, Math.min(1, pred.probability || 0.5)),
      confidence: Math.max(0, Math.min(1, pred.confidence || 0.5)),
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
      } else {
        console.log(`[generate-predictions] Inserted ${predictionsToInsert.length} predictions`);
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
      console.log(`[generate-predictions] Inserted ${calibrationsToInsert.length} calibrations`);
    }

    return new Response(JSON.stringify({
      success: true,
      predictions_count: predictions.length,
      calibrations_count: calibrationEvents.length,
      data_quality_score: dataQuality.overallScore,
      business_type: businessType,
      sector_context_used: true,
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
