import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface HealthDimension {
  score: number;
  confidence: 'high' | 'medium' | 'low';
  rationale: string;
}

interface HealthAnalysis {
  totalScore: number;
  dimensions: {
    reputation: HealthDimension;
    profitability: HealthDimension;
    finances: HealthDimension;
    efficiency: HealthDimension;
    traffic: HealthDimension;
    team: HealthDimension;
    growth: HealthDimension;
  };
  strengths: string[];
  weaknesses: string[];
  dataQuality: number;
  certaintyPct: number;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { businessId, setupData, googleData, brainData, integrationsData, signalsData } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!LOVABLE_API_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Missing required environment variables");
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Calculate data completeness for certainty
    const dataCompleteness = calculateDataCompleteness({
      setupData,
      googleData,
      brainData,
      integrationsData,
      signalsData
    });

    // Build context for AI analysis with ALL data sources
    const analysisContext = buildHealthContext({
      setupData,
      googleData,
      brainData,
      integrationsData,
      signalsData,
      dataCompleteness
    });
    
    console.log("[analyze-health-score] Analyzing business:", businessId);
    console.log("[analyze-health-score] Data completeness:", dataCompleteness);
    console.log("[analyze-health-score] Setup mode:", setupData?.setupMode);
    console.log("[analyze-health-score] Brain signals:", brainData?.total_signals || 0);
    console.log("[analyze-health-score] Integrations:", integrationsData?.length || 0);

    // Call AI for intelligent health score analysis
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: `Eres un analista experto en negocios gastronómicos con 20 años de experiencia. Tu trabajo es evaluar la salud de un negocio basándote en TODOS los datos disponibles: setup inicial, respuestas del cuestionario, integraciones, señales del "cerebro" del negocio, historial de acciones, etc.

DEBES responder con JSON válido en este formato EXACTO:
{
  "totalScore": 0-100,
  "dimensions": {
    "reputation": { "score": 0-100, "confidence": "high|medium|low", "rationale": "razón corta" },
    "profitability": { "score": 0-100, "confidence": "high|medium|low", "rationale": "razón corta" },
    "finances": { "score": 0-100, "confidence": "high|medium|low", "rationale": "razón corta" },
    "efficiency": { "score": 0-100, "confidence": "high|medium|low", "rationale": "razón corta" },
    "traffic": { "score": 0-100, "confidence": "high|medium|low", "rationale": "razón corta" },
    "team": { "score": 0-100, "confidence": "high|medium|low", "rationale": "razón corta" },
    "growth": { "score": 0-100, "confidence": "high|medium|low", "rationale": "razón corta" }
  },
  "strengths": ["fortaleza1", "fortaleza2", "fortaleza3"],
  "weaknesses": ["debilidad1", "debilidad2", "debilidad3"],
  "dataQuality": 0-100,
  "certaintyPct": 0-100
}

## FUENTES DE DATOS DISPONIBLES:
1. **Setup inicial**: Datos básicos del negocio y respuestas del cuestionario
2. **Google Business**: Rating, reviews, posicionamiento
3. **Brain del negocio**: Memoria factual, señales procesadas, patrones detectados
4. **Integraciones**: POS, delivery apps, reservas, etc.
5. **Señales**: Eventos e interacciones que el sistema ha captado

## CRITERIOS DE EVALUACIÓN POR DIMENSIÓN:

### REPUTACIÓN (reputation)
- Rating < 3.5 en Google = CRÍTICO (score 20-40)
- Rating 3.5-4.0 = BAJO (score 40-55)
- Rating 4.0-4.3 = PROMEDIO (score 55-70)
- Rating 4.3-4.6 = BUENO (score 70-85)
- Rating > 4.6 = EXCELENTE (score 85-100)
- Cantidad de reseñas importa: pocas reseñas = menos confianza
- Sin datos de Google = score bajo (30) con confianza low

### RENTABILIDAD (profitability)
- Food cost > 40% = CRÍTICO (score 20-40)
- Food cost 35-40% = BAJO (score 40-55)
- Food cost 30-35% = PROMEDIO (score 55-70)
- Food cost 25-30% = BUENO (score 70-85)
- Food cost < 25% = EXCELENTE (score 85-100)
- Considera integración con POS para datos reales
- Sin datos = score neutro (45) con confianza low

### FINANZAS (finances)
- Conoce costos + ventas + márgenes + tiene POS = EXCELENTE
- Conoce costos + ventas + márgenes = BUENO
- Solo conoce ventas = PROMEDIO
- No conoce costos = BAJO

### EFICIENCIA (efficiency)
- Control de inventario + tiempos + checkins = BUENO
- Alto desperdicio declarado = BAJO
- Sin control de inventario = CRÍTICO
- Señales de operación en brain = bonus

### TRÁFICO (traffic)
- Múltiples canales activos = BUENO
- Solo un canal = PROMEDIO
- Alto % delivery apps (>50%) = riesgo de dependencia
- Integración con reservas = bonus

### EQUIPO (team)
- Dificultad contratación alta = BAJO
- Team estable declarado = BUENO
- Solo owner = neutro (depende del modelo)
- Señales de rotación en brain = impacta

### CRECIMIENTO (growth)
- Múltiples oportunidades detectadas = BUENO
- Misiones activas y completadas = BUENO
- Mercado saturado = BAJO

## CÁLCULO DE CERTEZA (certaintyPct):
- Base: según el nivel de datos disponibles proporcionado
- Aumenta con: integraciones activas (+5% c/u), señales procesadas (+1% por 10 señales), brain poblado
- Máximo realista sin integraciones completas: 65%
- Con Google + 2 integraciones: puede llegar a 80%
- Con 4+ integraciones y >50 señales: puede llegar a 95%

## REGLAS IMPORTANTES:
1. Si hay POCOS datos, da scores conservadores y confianza "low"
2. Sé REALISTA y CRÍTICO. Un rating de 3.1 en Google es MALO
3. Las fortalezas/debilidades deben ser ESPECÍFICAS y ACCIONABLES
4. certaintyPct DEBE reflejar cuántos datos reales tenemos
5. Siempre da 3 fortalezas y 3 debilidades basadas en los datos`
          },
          {
            role: "user",
            content: analysisContext
          }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[analyze-health-score] AI error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded" }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required" }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const aiData = await response.json();
    const aiMessage = aiData.choices?.[0]?.message?.content;

    if (!aiMessage) {
      throw new Error("No response from AI");
    }

    console.log("[analyze-health-score] AI response received");

    // Parse AI response
    let analysis: HealthAnalysis;
    try {
      const jsonMatch = aiMessage.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysis = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON found in response");
      }
    } catch (e) {
      console.error("[analyze-health-score] Parse error:", e, aiMessage);
      // Fallback to basic calculation
      analysis = createFallbackAnalysis({ setupData, googleData, brainData, integrationsData, signalsData, dataCompleteness });
    }

    // Validate and normalize scores
    analysis = normalizeAnalysis(analysis, dataCompleteness);

    console.log("[analyze-health-score] Final analysis:", {
      totalScore: analysis.totalScore,
      certaintyPct: analysis.certaintyPct,
      dimensions: Object.entries(analysis.dimensions).map(([k, v]) => `${k}: ${v?.score ?? 'null'}`),
      dataQuality: analysis.dataQuality
    });

    // Save snapshot to database
    const dimensionsForDb: Record<string, number | null> = {};
    for (const [key, dim] of Object.entries(analysis.dimensions)) {
      dimensionsForDb[key] = dim?.score ?? null;
    }
    
    const { error: snapshotError } = await supabase.from("snapshots").insert({
      business_id: businessId,
      source: "ai_analysis",
      total_score: analysis.totalScore,
      dimensions_json: {
        ...dimensionsForDb,
        _meta: {
          analyzed_at: new Date().toISOString(),
          data_quality: analysis.dataQuality,
          certainty_pct: analysis.certaintyPct,
          setup_mode: setupData?.setupMode,
          model: "gemini-2.5-flash",
          data_sources: {
            google: !!googleData?.placeId,
            brain: !!brainData?.id,
            integrations: integrationsData?.length || 0,
            signals: signalsData?.length || 0,
          }
        }
      },
      strengths: analysis.strengths,
      weaknesses: analysis.weaknesses,
    });

    if (snapshotError) {
      console.error("[analyze-health-score] Snapshot save error:", snapshotError);
    }

    return new Response(
      JSON.stringify({
        success: true,
        analysis,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("[analyze-health-score] Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

interface DataSources {
  setupData: any;
  googleData: any;
  brainData: any;
  integrationsData: any[];
  signalsData: any[];
}

function calculateDataCompleteness(sources: Partial<DataSources>): number {
  let completeness = 0;
  const weights = {
    setupBasic: 15,      // Business type, country
    setupAnswers: 25,    // Questionnaire responses
    google: 20,          // Google Business connected
    brain: 15,           // Brain memory populated
    integrations: 15,    // Active integrations
    signals: 10,         // Processed signals
  };

  // Setup basic info
  if (sources.setupData?.businessTypeId) completeness += weights.setupBasic * 0.5;
  if (sources.setupData?.countryCode) completeness += weights.setupBasic * 0.5;

  // Setup answers
  const answersCount = Object.keys(sources.setupData?.answers || {}).length;
  const answersScore = Math.min(1, answersCount / 15); // Max contribution at 15+ answers
  completeness += weights.setupAnswers * answersScore;

  // Google connected
  if (sources.googleData?.placeId) {
    completeness += weights.google;
  }

  // Brain data
  if (sources.brainData?.id) {
    const hasFactualMemory = Object.keys(sources.brainData.factual_memory || {}).length > 0;
    const hasDynamicMemory = Object.keys(sources.brainData.dynamic_memory || {}).length > 0;
    if (hasFactualMemory) completeness += weights.brain * 0.6;
    if (hasDynamicMemory) completeness += weights.brain * 0.4;
  }

  // Integrations
  const integrationsCount = sources.integrationsData?.filter(i => i.status === 'active').length || 0;
  const integrationsScore = Math.min(1, integrationsCount / 3); // Max at 3 integrations
  completeness += weights.integrations * integrationsScore;

  // Signals
  const signalsCount = sources.signalsData?.length || 0;
  const signalsScore = Math.min(1, signalsCount / 20); // Max at 20 signals
  completeness += weights.signals * signalsScore;

  return Math.round(completeness);
}

function buildHealthContext(data: DataSources & { dataCompleteness: number }): string {
  const { setupData, googleData, brainData, integrationsData, signalsData, dataCompleteness } = data;
  const answers = setupData?.answers || {};
  const mode = setupData?.setupMode || 'quick';
  
  let context = `## DATOS DEL NEGOCIO PARA ANALIZAR
## Nivel de datos disponibles: ${dataCompleteness}% (usar esto para calcular certaintyPct)

### Información básica
- Nombre: ${setupData?.businessName || 'No especificado'}
- País: ${setupData?.countryCode || 'No especificado'}
- Tipo de negocio: ${setupData?.businessTypeLabel || setupData?.businessTypeId || 'No especificado'}
- Modo de setup: ${mode === 'complete' ? 'COMPLETO (más datos)' : 'RÁPIDO (datos limitados)'}

### Google Business Profile
`;

  if (googleData?.placeId) {
    context += `- Conectado: SÍ ✓
- Rating: ${googleData.rating || 'N/A'} estrellas
- Cantidad de reseñas: ${googleData.reviewCount || 'N/A'}
- Dirección: ${setupData?.googleAddress || 'N/A'}
`;
  } else {
    context += `- Conectado: NO (sin datos de reputación online)
`;
  }

  // Brain memory
  context += `\n### Cerebro del Negocio (Brain)\n`;
  if (brainData?.id) {
    context += `- Estado: Activo
- Foco actual: ${brainData.current_focus || 'ventas'}
- Señales totales procesadas: ${brainData.total_signals || 0}
- Confianza del modelo: ${brainData.confidence_score || 0}%
- MVP completado: ${brainData.mvc_completion_pct || 0}%
`;
    
    // Factual memory
    const factual = brainData.factual_memory || {};
    if (Object.keys(factual).length > 0) {
      context += `- Memoria factual: ${JSON.stringify(factual)}\n`;
    }
    
    // Dynamic memory (recent patterns)
    const dynamic = brainData.dynamic_memory || {};
    if (Object.keys(dynamic).length > 0) {
      context += `- Patrones detectados: ${JSON.stringify(dynamic)}\n`;
    }
    
    // MVP gaps (what's missing)
    const gaps = brainData.mvc_gaps || [];
    if (Array.isArray(gaps) && gaps.length > 0) {
      context += `- Datos faltantes críticos: ${gaps.slice(0, 5).join(', ')}\n`;
    }
  } else {
    context += `- Estado: No inicializado\n`;
  }

  // Integrations
  context += `\n### Integraciones\n`;
  if (integrationsData && integrationsData.length > 0) {
    const activeIntegrations = integrationsData.filter(i => i.status === 'active');
    const pendingIntegrations = integrationsData.filter(i => i.status === 'pending');
    
    context += `- Activas: ${activeIntegrations.length}\n`;
    activeIntegrations.forEach(int => {
      context += `  - ${int.integration_type} (última sincronización: ${int.last_sync_at || 'nunca'})\n`;
    });
    
    if (pendingIntegrations.length > 0) {
      context += `- Pendientes de conexión: ${pendingIntegrations.map(i => i.integration_type).join(', ')}\n`;
    }
  } else {
    context += `- Sin integraciones configuradas\n`;
  }

  // Recent signals
  context += `\n### Señales recientes\n`;
  if (signalsData && signalsData.length > 0) {
    context += `- Total de señales: ${signalsData.length}\n`;
    const recentSignals = signalsData.slice(0, 10);
    recentSignals.forEach(signal => {
      context += `  - [${signal.signal_type}] ${signal.raw_text?.substring(0, 100) || JSON.stringify(signal.content).substring(0, 100)}\n`;
    });
  } else {
    context += `- Sin señales registradas\n`;
  }

  // Questionnaire answers
  context += `\n### Respuestas del cuestionario (${Object.keys(answers).length} preguntas):\n`;

  // Categorize answers for better analysis
  const categories: Record<string, Record<string, any>> = {
    operacion: {},
    ventas: {},
    costos: {},
    equipo: {},
    marketing: {},
    otros: {}
  };

  for (const [key, value] of Object.entries(answers)) {
    if (value === undefined || value === null || value === '' || (Array.isArray(value) && value.length === 0)) {
      continue;
    }
    
    let category = 'otros';
    const keyLower = key.toLowerCase();
    if (keyLower.includes('channel') || keyLower.includes('peak') || keyLower.includes('capacity') || keyLower.includes('service')) category = 'operacion';
    else if (keyLower.includes('revenue') || keyLower.includes('ticket') || keyLower.includes('price') || keyLower.includes('sales')) category = 'ventas';
    else if (keyLower.includes('cost') || keyLower.includes('margin') || keyLower.includes('food_cost') || keyLower.includes('expense')) category = 'costos';
    else if (keyLower.includes('team') || keyLower.includes('staff') || keyLower.includes('hiring') || keyLower.includes('employee')) category = 'equipo';
    else if (keyLower.includes('social') || keyLower.includes('review') || keyLower.includes('marketing') || keyLower.includes('promo')) category = 'marketing';
    
    categories[category][key] = value;
  }

  for (const [cat, catAnswers] of Object.entries(categories)) {
    if (Object.keys(catAnswers).length === 0) continue;
    
    context += `\n[${cat.toUpperCase()}]\n`;
    for (const [key, value] of Object.entries(catAnswers)) {
      const displayValue = Array.isArray(value) ? value.join(', ') : value;
      context += `- ${key}: ${displayValue}\n`;
    }
  }

  // Add integrations profile from setup
  const integrations = setupData?.integrationsProfiled || {};
  const totalIntegrations = Object.values(integrations).flat().length;
  
  if (totalIntegrations > 0) {
    context += `\n### Plataformas declaradas en setup (${totalIntegrations} total):\n`;
    for (const [type, list] of Object.entries(integrations)) {
      if (Array.isArray(list) && list.length > 0) {
        context += `- ${type}: ${list.join(', ')}\n`;
      }
    }
  }

  return context;
}

function createFallbackAnalysis(data: DataSources & { dataCompleteness: number }): HealthAnalysis {
  const { setupData, googleData, brainData, integrationsData, signalsData, dataCompleteness } = data;
  const hasGoogle = !!googleData?.placeId;
  const rating = googleData?.rating;
  const answers = setupData?.answers || {};
  const answersCount = Object.keys(answers).length;
  
  // Calculate reputation based on Google rating
  let reputationScore = 30; // Default low if no data
  let reputationConfidence: 'high' | 'medium' | 'low' = 'low';
  if (rating) {
    if (rating < 3.5) reputationScore = Math.round(20 + (rating / 3.5) * 20);
    else if (rating < 4.0) reputationScore = Math.round(40 + ((rating - 3.5) / 0.5) * 15);
    else if (rating < 4.3) reputationScore = Math.round(55 + ((rating - 4.0) / 0.3) * 15);
    else if (rating < 4.6) reputationScore = Math.round(70 + ((rating - 4.3) / 0.3) * 15);
    else reputationScore = Math.round(85 + ((rating - 4.6) / 0.4) * 15);
    reputationConfidence = 'high';
  }

  // Food cost analysis
  let profitabilityScore = 45;
  let profitabilityConfidence: 'high' | 'medium' | 'low' = 'low';
  const foodCost = answers.Q_FOOD_COST || answers.food_cost;
  if (foodCost) {
    if (foodCost > 40) profitabilityScore = Math.round(20 + ((50 - foodCost) / 10) * 20);
    else if (foodCost > 35) profitabilityScore = Math.round(40 + ((40 - foodCost) / 5) * 15);
    else if (foodCost > 30) profitabilityScore = Math.round(55 + ((35 - foodCost) / 5) * 15);
    else if (foodCost > 25) profitabilityScore = Math.round(70 + ((30 - foodCost) / 5) * 15);
    else profitabilityScore = Math.round(85 + ((25 - foodCost) / 10) * 15);
    profitabilityConfidence = 'medium';
  }

  // Calculate other dimensions based on available data
  const hasChannels = answers.Q_CHANNELS?.length > 0 || answers.channels?.length > 0;
  const hasPeaks = answers.Q_PEAKS?.length > 0 || answers.peak_hours?.length > 0;
  const hasTeamData = answers.Q_TEAM_SIZE || answers.team_size || answers.Q_HIRING_DIFFICULTY;
  const hasFinanceData = answers.Q_MONTHLY_REVENUE || answers.monthly_revenue || answers.Q_KNOWS_COSTS;
  const hasIntegrations = (integrationsData?.filter(i => i.status === 'active').length || 0) > 0;
  const hasSignals = (signalsData?.length || 0) > 0;
  const hasBrain = !!brainData?.id;

  const strengths: string[] = [];
  const weaknesses: string[] = [];

  if (rating && rating >= 4.3) strengths.push(`Buena reputación en Google (${rating}★)`);
  if (rating && rating < 3.5) weaknesses.push(`Rating bajo en Google (${rating}★) requiere atención urgente`);
  if (foodCost && foodCost < 30) strengths.push(`Buen control de food cost (${foodCost}%)`);
  if (foodCost && foodCost > 40) weaknesses.push(`Food cost elevado (${foodCost}%) afecta rentabilidad`);
  if (!hasGoogle) weaknesses.push('Sin presencia verificada en Google');
  if (hasIntegrations) strengths.push('Integraciones activas mejoran visibilidad de datos');
  if (!hasIntegrations) weaknesses.push('Sin integraciones conectadas para datos en tiempo real');
  if (answersCount < 10) weaknesses.push('Completar más preguntas del cuestionario para análisis profundo');
  if (hasSignals) strengths.push(`${signalsData?.length} señales procesadas enriquecen el análisis`);
  
  // Ensure we have 3 of each
  while (strengths.length < 3) strengths.push('Negocio operativo y en funcionamiento');
  while (weaknesses.length < 3) weaknesses.push('Se recomienda completar más datos para mejor precisión');

  // Calculate certainty based on data completeness
  const certaintyPct = dataCompleteness;

  // Calculate total score from available dimensions with weights
  const dimensionScores = [
    { score: reputationScore, weight: 0.20 },
    { score: profitabilityScore, weight: 0.18 },
    { score: hasFinanceData ? 55 : 40, weight: 0.15 },
    { score: hasChannels ? 55 : 40, weight: 0.12 },
    { score: hasPeaks ? 55 : 40, weight: 0.12 },
    { score: hasTeamData ? 55 : 45, weight: 0.12 },
    { score: 50, weight: 0.11 },
  ];
  
  const totalScore = Math.round(
    dimensionScores.reduce((acc, d) => acc + d.score * d.weight, 0)
  );

  return {
    totalScore,
    dimensions: {
      reputation: { score: reputationScore, confidence: reputationConfidence, rationale: hasGoogle ? `Rating ${rating}/5 en Google` : 'Sin datos de Google conectado' },
      profitability: { score: profitabilityScore, confidence: profitabilityConfidence, rationale: foodCost ? `Food cost declarado ${foodCost}%` : 'Sin datos de costos' },
      finances: { score: hasFinanceData ? 55 : 40, confidence: hasFinanceData ? 'medium' : 'low', rationale: hasFinanceData ? 'Conoce ventas y costos' : 'Datos financieros limitados' },
      efficiency: { score: hasChannels ? 55 : 40, confidence: hasChannels ? 'medium' : 'low', rationale: hasChannels ? 'Canales definidos' : 'Datos operativos limitados' },
      traffic: { score: hasPeaks ? 55 : 40, confidence: hasPeaks ? 'medium' : 'low', rationale: hasPeaks ? 'Franjas horarias definidas' : 'Sin datos de tráfico' },
      team: { score: hasTeamData ? 55 : 45, confidence: hasTeamData ? 'medium' : 'low', rationale: hasTeamData ? 'Datos de equipo disponibles' : 'Datos de equipo limitados' },
      growth: { score: 50, confidence: 'low', rationale: 'Requiere más datos para evaluar crecimiento' },
    },
    strengths: strengths.slice(0, 3),
    weaknesses: weaknesses.slice(0, 3),
    dataQuality: dataCompleteness,
    certaintyPct,
  };
}

function normalizeAnalysis(analysis: HealthAnalysis, dataCompleteness: number): HealthAnalysis {
  // Ensure all scores are within 0-100
  for (const key of Object.keys(analysis.dimensions) as (keyof typeof analysis.dimensions)[]) {
    const dim = analysis.dimensions[key];
    if (dim && typeof dim.score === 'number') {
      dim.score = Math.max(0, Math.min(100, Math.round(dim.score)));
    }
  }
  
  analysis.totalScore = Math.max(0, Math.min(100, Math.round(analysis.totalScore)));
  analysis.dataQuality = Math.max(0, Math.min(100, Math.round(analysis.dataQuality || dataCompleteness)));
  
  // Ensure certainty is based on data completeness with some AI adjustment
  const aiCertainty = analysis.certaintyPct || dataCompleteness;
  // Average between data completeness and AI estimate, weighted toward data completeness
  analysis.certaintyPct = Math.round((dataCompleteness * 0.6 + aiCertainty * 0.4));
  analysis.certaintyPct = Math.max(5, Math.min(95, analysis.certaintyPct));
  
  // Ensure arrays exist and have content
  analysis.strengths = (analysis.strengths || []).slice(0, 3);
  analysis.weaknesses = (analysis.weaknesses || []).slice(0, 3);
  
  while (analysis.strengths.length < 3) analysis.strengths.push('Negocio en operación');
  while (analysis.weaknesses.length < 3) analysis.weaknesses.push('Completar más datos para mejor análisis');
  
  return analysis;
}
