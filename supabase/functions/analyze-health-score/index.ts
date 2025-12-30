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
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { businessId, setupData, googleData } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!LOVABLE_API_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Missing required environment variables");
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Build context for AI analysis
    const analysisContext = buildHealthContext(setupData, googleData);
    
    console.log("[analyze-health-score] Analyzing business:", businessId);
    console.log("[analyze-health-score] Setup mode:", setupData?.setupMode);
    console.log("[analyze-health-score] Answers count:", Object.keys(setupData?.answers || {}).length);

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
            content: `Eres un analista experto en negocios gastronómicos con 20 años de experiencia. Tu trabajo es evaluar la salud de un negocio basándote en datos reales.

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
  "strengths": ["fortaleza1", "fortaleza2"],
  "weaknesses": ["debilidad1", "debilidad2"],
  "dataQuality": 0-100
}

## CRITERIOS DE EVALUACIÓN POR DIMENSIÓN:

### REPUTACIÓN (reputation)
- Rating < 3.5 en Google = CRÍTICO (score 20-40)
- Rating 3.5-4.0 = BAJO (score 40-55)
- Rating 4.0-4.3 = PROMEDIO (score 55-70)
- Rating 4.3-4.6 = BUENO (score 70-85)
- Rating > 4.6 = EXCELENTE (score 85-100)
- Cantidad de reseñas importa: pocas reseñas = menos confianza
- Sin datos de Google = score null (no estimable)

### RENTABILIDAD (profitability)
- Food cost > 40% = CRÍTICO (score 20-40)
- Food cost 35-40% = BAJO (score 40-55)
- Food cost 30-35% = PROMEDIO (score 55-70)
- Food cost 25-30% = BUENO (score 70-85)
- Food cost < 25% = EXCELENTE (score 85-100)
- Sin datos de food cost = score null

### FINANZAS (finances)
- Conoce costos + ventas + márgenes = BUENO
- Solo conoce ventas = PROMEDIO
- No conoce costos = BAJO
- Integración con POS = bonus

### EFICIENCIA (efficiency)
- Control de inventario + tiempos = BUENO
- Alto desperdicio declarado = BAJO
- Sin control de inventario = CRÍTICO

### TRÁFICO (traffic)
- Múltiples canales activos = BUENO
- Solo un canal = PROMEDIO
- Alto % delivery apps (>50%) = riesgo de dependencia

### EQUIPO (team)
- Dificultad contratación alta = BAJO
- Team estable declarado = BUENO
- Solo owner = neutro (depende del modelo)

### CRECIMIENTO (growth)
- Múltiples oportunidades detectadas = BUENO
- Mercado saturado = BAJO
- Sin datos suficientes = neutro (50)

## REGLAS IMPORTANTES:
1. Si NO hay datos para una dimensión, el score debe ser null y confidence "low"
2. Sé REALISTA y CRÍTICO. Un rating de 3.1 en Google es MALO, no promedio.
3. Un negocio con setup rápido tendrá muchos scores null - eso está bien
4. Las fortalezas/debilidades deben ser ESPECÍFICAS al negocio
5. dataQuality = % de dimensiones que tienen datos suficientes para evaluar`
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
      analysis = createFallbackAnalysis(setupData, googleData);
    }

    // Validate and normalize scores
    analysis = normalizeAnalysis(analysis);

    console.log("[analyze-health-score] Final analysis:", {
      totalScore: analysis.totalScore,
      dimensions: Object.entries(analysis.dimensions).map(([k, v]) => `${k}: ${v?.score ?? 'null'}`),
      dataQuality: analysis.dataQuality
    });

    // Save snapshot to database
    const dimensionsForDb: Record<string, number | null> = {};
    for (const [key, dim] of Object.entries(analysis.dimensions)) {
      dimensionsForDb[key] = dim?.score ?? null;
    }
    dimensionsForDb['_meta'] = null; // Will be overwritten
    
    const { error: snapshotError } = await supabase.from("snapshots").insert({
      business_id: businessId,
      source: "ai_analysis",
      total_score: analysis.totalScore,
      dimensions_json: {
        ...dimensionsForDb,
        _meta: {
          analyzed_at: new Date().toISOString(),
          data_quality: analysis.dataQuality,
          setup_mode: setupData?.setupMode,
          model: "gemini-2.5-flash",
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

function buildHealthContext(setupData: any, googleData: any): string {
  const answers = setupData?.answers || {};
  const mode = setupData?.setupMode || 'quick';
  
  let context = `## DATOS DEL NEGOCIO PARA ANALIZAR

### Información básica
- Nombre: ${setupData?.businessName || 'No especificado'}
- País: ${setupData?.countryCode || 'No especificado'}
- Tipo de negocio: ${setupData?.businessTypeLabel || setupData?.businessTypeId || 'No especificado'}
- Modo de setup: ${mode === 'complete' ? 'COMPLETO (más datos)' : 'RÁPIDO (datos limitados)'}

### Google Business Profile
`;

  if (googleData?.placeId) {
    context += `- Conectado: SÍ
- Rating: ${googleData.rating || 'N/A'} estrellas
- Cantidad de reseñas: ${googleData.reviewCount || 'N/A'}
- Dirección: ${setupData?.googleAddress || 'N/A'}
`;
  } else {
    context += `- Conectado: NO (sin datos de reputación online)
`;
  }

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
    if (key.includes('CHANNEL') || key.includes('PEAK') || key.includes('CAPACITY')) category = 'operacion';
    else if (key.includes('REVENUE') || key.includes('TICKET') || key.includes('PRICE')) category = 'ventas';
    else if (key.includes('COST') || key.includes('MARGIN') || key.includes('FOOD_COST')) category = 'costos';
    else if (key.includes('TEAM') || key.includes('STAFF') || key.includes('HIRING')) category = 'equipo';
    else if (key.includes('SOCIAL') || key.includes('REVIEW') || key.includes('MARKETING')) category = 'marketing';
    
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

  // Add integrations info
  const integrations = setupData?.integrationsProfiled || {};
  const totalIntegrations = Object.values(integrations).flat().length;
  
  if (totalIntegrations > 0) {
    context += `\n### Integraciones configuradas (${totalIntegrations} total):\n`;
    for (const [type, list] of Object.entries(integrations)) {
      if (Array.isArray(list) && list.length > 0) {
        context += `- ${type}: ${list.join(', ')}\n`;
      }
    }
  } else {
    context += `\n### Integraciones: Ninguna configurada\n`;
  }

  return context;
}

function createFallbackAnalysis(setupData: any, googleData: any): HealthAnalysis {
  const hasGoogle = !!googleData?.placeId;
  const rating = googleData?.rating;
  const answers = setupData?.answers || {};
  const answersCount = Object.keys(answers).length;
  
  // Calculate reputation based on Google rating
  let reputationScore: number | null = null;
  if (rating) {
    if (rating < 3.5) reputationScore = Math.round(20 + (rating / 3.5) * 20);
    else if (rating < 4.0) reputationScore = Math.round(40 + ((rating - 3.5) / 0.5) * 15);
    else if (rating < 4.3) reputationScore = Math.round(55 + ((rating - 4.0) / 0.3) * 15);
    else if (rating < 4.6) reputationScore = Math.round(70 + ((rating - 4.3) / 0.3) * 15);
    else reputationScore = Math.round(85 + ((rating - 4.6) / 0.4) * 15);
  }

  // Food cost analysis
  let profitabilityScore: number | null = null;
  const foodCost = answers.Q_FOOD_COST;
  if (foodCost) {
    if (foodCost > 40) profitabilityScore = Math.round(20 + ((50 - foodCost) / 10) * 20);
    else if (foodCost > 35) profitabilityScore = Math.round(40 + ((40 - foodCost) / 5) * 15);
    else if (foodCost > 30) profitabilityScore = Math.round(55 + ((35 - foodCost) / 5) * 15);
    else if (foodCost > 25) profitabilityScore = Math.round(70 + ((30 - foodCost) / 5) * 15);
    else profitabilityScore = Math.round(85 + ((25 - foodCost) / 10) * 15);
  }

  // Calculate other dimensions based on available data
  const hasChannels = answers.Q_CHANNELS?.length > 0;
  const hasPeaks = answers.Q_PEAKS?.length > 0;
  const hasTeamData = answers.Q_TEAM_SIZE || answers.Q_HIRING_DIFFICULTY;
  const hasFinanceData = answers.Q_MONTHLY_REVENUE || answers.Q_KNOWS_COSTS;

  const strengths: string[] = [];
  const weaknesses: string[] = [];

  if (rating && rating >= 4.3) strengths.push('Buena reputación en Google');
  if (rating && rating < 3.5) weaknesses.push('Rating bajo en Google requiere atención urgente');
  if (foodCost && foodCost < 30) strengths.push('Buen control de food cost');
  if (foodCost && foodCost > 40) weaknesses.push('Food cost elevado afecta rentabilidad');
  if (!hasGoogle) weaknesses.push('Sin presencia verificada en Google');
  if (answersCount < 10) weaknesses.push('Datos limitados para análisis profundo');

  // Calculate data quality
  const possibleDimensions = 7;
  const dimensionsWithData = [
    reputationScore !== null,
    profitabilityScore !== null,
    hasFinanceData,
    hasChannels,
    hasPeaks,
    hasTeamData,
    answersCount > 5
  ].filter(Boolean).length;
  const dataQuality = Math.round((dimensionsWithData / possibleDimensions) * 100);

  // Calculate total score from available dimensions
  const scores = [reputationScore, profitabilityScore].filter((s): s is number => s !== null);
  const totalScore = scores.length > 0 
    ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
    : 50;

  return {
    totalScore,
    dimensions: {
      reputation: { score: reputationScore ?? 0, confidence: hasGoogle ? 'high' : 'low', rationale: hasGoogle ? `Rating ${rating}/5` : 'Sin datos de Google' },
      profitability: { score: profitabilityScore ?? 0, confidence: foodCost ? 'high' : 'low', rationale: foodCost ? `Food cost ${foodCost}%` : 'Sin datos de costos' },
      finances: { score: hasFinanceData ? 50 : 0, confidence: 'low', rationale: 'Datos limitados' },
      efficiency: { score: hasChannels ? 50 : 0, confidence: 'low', rationale: 'Datos limitados' },
      traffic: { score: hasPeaks ? 55 : 0, confidence: hasPeaks ? 'medium' : 'low', rationale: hasPeaks ? 'Franjas horarias definidas' : 'Sin datos' },
      team: { score: hasTeamData ? 50 : 0, confidence: 'low', rationale: 'Datos limitados' },
      growth: { score: 50, confidence: 'low', rationale: 'Neutral por defecto' },
    },
    strengths: strengths.length > 0 ? strengths : ['Negocio en operación'],
    weaknesses: weaknesses.length > 0 ? weaknesses : ['Completar más datos para mejor análisis'],
    dataQuality,
  };
}

function normalizeAnalysis(analysis: HealthAnalysis): HealthAnalysis {
  // Ensure all scores are within 0-100
  for (const key of Object.keys(analysis.dimensions) as (keyof typeof analysis.dimensions)[]) {
    const dim = analysis.dimensions[key];
    if (dim && typeof dim.score === 'number') {
      dim.score = Math.max(0, Math.min(100, Math.round(dim.score)));
    }
  }
  
  analysis.totalScore = Math.max(0, Math.min(100, Math.round(analysis.totalScore)));
  analysis.dataQuality = Math.max(0, Math.min(100, Math.round(analysis.dataQuality || 0)));
  
  // Ensure arrays exist
  analysis.strengths = analysis.strengths || [];
  analysis.weaknesses = analysis.weaknesses || [];
  
  return analysis;
}
