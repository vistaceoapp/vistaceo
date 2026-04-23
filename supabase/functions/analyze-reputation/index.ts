import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ReputationAnalysis {
  overall_score: number;
  sentiment_breakdown: { positive: number; neutral: number; negative: number };
  star_distribution: Record<string, number>;
  top_positive_words: Array<{ word: string; count: number; sentiment: number }>;
  top_negative_words: Array<{ word: string; count: number; sentiment: number }>;
  key_themes: Array<{ theme: string; sentiment: "positive" | "negative" | "neutral"; frequency: number }>;
  urgent_issues: string[];
  highlights: string[];
  response_rate: number;
  avg_response_time_hours: number | null;
  trend: "improving" | "stable" | "declining";
  ai_summary: string;
  recommendations: string[];
  analyzed_reviews_count: number;
  last_analysis: string;
  source: "google_reviews" | "brain_based" | "mixed";
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { businessId, forceRefresh } = await req.json();
    if (!businessId) {
      return new Response(JSON.stringify({ error: "businessId is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY");
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log(`[analyze-reputation] Starting for business ${businessId}`);

    // Get business
    const { data: business } = await supabase.from("businesses").select("*").eq("id", businessId).single();
    if (!business) {
      return new Response(JSON.stringify({ error: "Business not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Get brain
    const { data: brain } = await supabase
      .from("business_brains")
      .select("id, dynamic_memory, factual_memory, preferences_memory")
      .eq("business_id", businessId)
      .maybeSingle();

    // Get all reviews
    const { data: reviewsData } = await supabase
      .from("external_data")
      .select("*")
      .eq("business_id", businessId)
      .in("data_type", ["review", "google_review", "google_places_review"])
      .order("synced_at", { ascending: false })
      .limit(500);

    // Get Google integration metadata
    const { data: googleIntegration } = await supabase
      .from("business_integrations")
      .select("metadata, last_sync_at")
      .eq("business_id", businessId)
      .in("integration_type", ["google_places", "google_business", "google_reviews"])
      .maybeSingle();

    const googleMeta = googleIntegration?.metadata as Record<string, any> | null;
    const reviews = reviewsData || [];
    const hasGooglePlace = !!business.google_place_id;

    // Build review texts
    const reviewTexts = reviews.map(r => {
      const c = r.content as Record<string, any>;
      const rating = c.rating || c.starRating || "THREE";
      return {
        rating: typeof rating === "number" ? ["ONE", "TWO", "THREE", "FOUR", "FIVE"][rating - 1] || "THREE" : rating,
        comment: c.text || c.comment || c.original_text || "",
        date: c.date || c.create_time || c.publish_time,
        hasReply: !!c.reply || !!c.reviewReply,
        author: c.author || c.reviewer_name || "Anónimo",
      };
    });

    // Add reviews from Google metadata
    if (googleMeta?.reviews && Array.isArray(googleMeta.reviews)) {
      for (const g of googleMeta.reviews) {
        const existing = reviewTexts.find(r => r.author === (g.reviewer?.displayName || g.author_name));
        if (!existing) {
          reviewTexts.push({
            rating: g.rating || g.starRating || "THREE",
            comment: g.comment || g.text || "",
            date: g.createTime || g.date,
            hasReply: !!g.reviewReply,
            author: g.reviewer?.displayName || g.author_name || "Cliente Google",
          });
        }
      }
    }

    console.log(`[analyze-reputation] ${reviewTexts.length} reviews, hasGoogle: ${hasGooglePlace}`);

    // Get Brain context for brain-based analysis
    const factualMemory = (brain?.factual_memory || {}) as Record<string, any>;
    const dynamicMemory = (brain?.dynamic_memory || {}) as Record<string, any>;

    // Build Brain-based reputation context
    const brainReputationContext = buildBrainContext(factualMemory, dynamicMemory, business);

    // Determine analysis mode
    const analysisMode: "google_reviews" | "brain_based" | "mixed" = 
      reviewTexts.length > 0 ? (brainReputationContext ? "mixed" : "google_reviews") : "brain_based";

    // Calculate star distribution & sentiment from reviews
    const starDistribution: Record<string, number> = { "FIVE": 0, "FOUR": 0, "THREE": 0, "TWO": 0, "ONE": 0 };
    let totalSentiment = 0, positiveCount = 0, neutralCount = 0, negativeCount = 0, repliedCount = 0;

    for (const review of reviewTexts) {
      const r = review.rating || "THREE";
      starDistribution[r] = (starDistribution[r] || 0) + 1;
      if (["FIVE", "FOUR"].includes(r)) { positiveCount++; totalSentiment += r === "FIVE" ? 1 : 0.5; }
      else if (r === "THREE") { neutralCount++; }
      else { negativeCount++; totalSentiment += r === "TWO" ? -0.5 : -1; }
      if (review.hasReply) repliedCount++;
    }

    const totalReviews = reviewTexts.length || 1;
    const avgSentiment = totalSentiment / totalReviews;
    const responseRate = (repliedCount / totalReviews) * 100;

    // Build AI prompt based on mode
    let analysisPrompt = "";
    if (analysisMode === "google_reviews" || analysisMode === "mixed") {
      analysisPrompt = `
NEGOCIO: ${business.name}
TIPO: ${business.category || "General"}
PAÍS: ${business.country || "AR"}
RATING ACTUAL: ${business.avg_rating || googleMeta?.rating || "N/A"}/5
TOTAL RESEÑAS EN GOOGLE: ${googleMeta?.review_count || reviewTexts.length}

DISTRIBUCIÓN:
- 5★: ${starDistribution["FIVE"]} | 4★: ${starDistribution["FOUR"]} | 3★: ${starDistribution["THREE"]} | 2★: ${starDistribution["TWO"]} | 1★: ${starDistribution["ONE"]}
- Tasa de respuesta: ${responseRate.toFixed(1)}%

RESEÑAS CON COMENTARIOS (${reviewTexts.filter(r => r.comment.length > 10).length}):
${reviewTexts.filter(r => r.comment.length > 10).slice(0, 40).map((r, i) => `[${r.rating}] "${r.comment.substring(0, 300)}"`).join("\n")}
`;
    }

    if (analysisMode === "brain_based" || analysisMode === "mixed") {
      analysisPrompt += `
CONTEXTO DEL BRAIN (información proporcionada por el dueño):
${brainReputationContext}
`;
    }

    if (analysisMode === "brain_based") {
      analysisPrompt += `
NOTA: Este negocio NO tiene reseñas de Google vinculadas. Generá el análisis basándote en la información que el dueño proporcionó al Brain.
Sé honesto sobre la fuente: indicá que el análisis se basa en la información proporcionada por el dueño.
Si no hay suficiente información de reputación, indicá qué datos faltan y sugerí vincular Google Maps.
`;
    }

    let aiAnalysis: Partial<ReputationAnalysis> = {};

    if (lovableApiKey && (reviewTexts.length > 0 || brainReputationContext)) {
      try {
        const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: { "Authorization": `Bearer ${lovableApiKey}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            model: "google/gemini-2.5-flash-lite", // Cost-optimized: review analysis is structured extraction
            max_tokens: 4000,
            temperature: 0.3,
            messages: [
              {
                role: "system",
                content: `Sos un experto en análisis de reputación online para negocios en Latinoamérica. Analizás reseñas y generás insights accionables.

REGLAS ESTRICTAS:
- Respondé SOLO en JSON válido
- TODO el contenido DEBE estar en ESPAÑOL. NUNCA uses inglés en ningún campo.
- Si las reseñas están en inglés, TRADUCÍ las palabras clave y temas al español
- Las palabras clave deben ser las más frecuentes REALES, traducidas al español
- Los temas deben ser específicos del negocio, en español
- Las recomendaciones deben ser ultra-accionables, específicas, en español
- El resumen debe ser dirigido al dueño ("Tu negocio..." o "Tu emprendimiento...")
- Detectá patrones y tendencias reales
- Sé directo, conciso y profesional
- Usá un tono cercano pero profesional
- Si el análisis es basado en Brain (sin reseñas Google), indicalo claramente`
              },
              {
                role: "user",
                content: `Analizá la reputación de este negocio. TODO en español. Devolvé JSON exacto:

${analysisPrompt}

FORMATO JSON (todo en español, SIN excepciones):
{
  "top_positive_words": [{"word": "palabra en español", "count": 5, "sentiment": 0.9}],
  "top_negative_words": [{"word": "palabra en español", "count": 2, "sentiment": -0.8}],
  "key_themes": [{"theme": "tema específico en español", "sentiment": "positive|negative|neutral", "frequency": 10}],
  "urgent_issues": ["problema urgente en español"],
  "highlights": ["punto fuerte en español"],
  "trend": "improving|stable|declining",
  "ai_summary": "Resumen en español de 2-3 oraciones dirigido al dueño",
  "recommendations": ["recomendación ultra-accionable en español 1", "recomendación 2", "recomendación 3", "recomendación 4"]
}`
              }
            ],
          }),
        });

        if (aiResponse.ok) {
          const aiData = await aiResponse.json();
          const content = aiData.choices?.[0]?.message?.content || "";
          const jsonMatch = content.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            try { aiAnalysis = JSON.parse(jsonMatch[0]); console.log("[analyze-reputation] AI analysis OK"); }
            catch (e) { console.error("Failed to parse AI JSON:", e); }
          }
        } else {
          console.error("AI error:", aiResponse.status, await aiResponse.text());
        }
      } catch (e) { console.error("AI error:", e); }
    }

    // Calculate score
    let overallScore: number;
    if (reviewTexts.length > 0) {
      const baseScore = ((avgSentiment + 1) / 2) * 100;
      const responseBonus = responseRate > 80 ? 5 : responseRate > 50 ? 2 : 0;
      const volumeBonus = reviewTexts.length > 50 ? 5 : reviewTexts.length > 20 ? 2 : 0;
      overallScore = Math.min(95, Math.round(baseScore + responseBonus + volumeBonus));
    } else {
      // Brain-based score - estimate from available data
      overallScore = estimateBrainScore(factualMemory, dynamicMemory);
    }

    const analysis: ReputationAnalysis = {
      overall_score: overallScore,
      sentiment_breakdown: {
        positive: reviewTexts.length > 0 ? Math.round((positiveCount / totalReviews) * 100) : 0,
        neutral: reviewTexts.length > 0 ? Math.round((neutralCount / totalReviews) * 100) : 0,
        negative: reviewTexts.length > 0 ? Math.round((negativeCount / totalReviews) * 100) : 0,
      },
      star_distribution: starDistribution,
      top_positive_words: aiAnalysis.top_positive_words || [],
      top_negative_words: aiAnalysis.top_negative_words || [],
      key_themes: aiAnalysis.key_themes || [],
      urgent_issues: aiAnalysis.urgent_issues || [],
      highlights: aiAnalysis.highlights || [],
      response_rate: Math.round(responseRate),
      avg_response_time_hours: null,
      trend: aiAnalysis.trend || "stable",
      ai_summary: aiAnalysis.ai_summary || (reviewTexts.length > 0 
        ? `Análisis basado en ${reviewTexts.length} reseñas reales.`
        : "Análisis basado en la información proporcionada al Brain. Vinculá tu negocio en Google Maps para un análisis más preciso con reseñas reales."),
      recommendations: aiAnalysis.recommendations || [],
      analyzed_reviews_count: reviewTexts.length,
      last_analysis: new Date().toISOString(),
      source: analysisMode,
    };

    // Save to brain
    if (brain) {
      const existingDynamic = (brain.dynamic_memory || {}) as Record<string, any>;
      await supabase.from("business_brains").update({
        dynamic_memory: {
          ...existingDynamic,
          reputation_analysis: analysis,
          reputation_score: overallScore,
          reputation_trend: analysis.trend,
          last_reputation_scan: new Date().toISOString(),
        },
        updated_at: new Date().toISOString(),
      }).eq("id", brain.id);
      console.log("[analyze-reputation] Brain updated");
    } else {
      await supabase.from("business_brains").insert({
        business_id: businessId,
        dynamic_memory: {
          reputation_analysis: analysis,
          reputation_score: overallScore,
          reputation_trend: analysis.trend,
          last_reputation_scan: new Date().toISOString(),
        },
      });
      console.log("[analyze-reputation] Brain created");
    }

    console.log(`[analyze-reputation] Done: Score ${overallScore}/100, mode: ${analysisMode}`);

    return new Response(JSON.stringify({ success: true, analysis }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } });

  } catch (error) {
    console.error("[analyze-reputation] Error:", error);
    return new Response(JSON.stringify({ error: "Failed to analyze", details: String(error) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});

/** Build Brain context string from factual/dynamic memory */
function buildBrainContext(factual: Record<string, any>, dynamic: Record<string, any>, business: any): string {
  const parts: string[] = [];

  // From factual memory
  if (factual.reputation) parts.push(`Reputación conocida: ${JSON.stringify(factual.reputation)}`);
  if (factual.google_data) {
    const g = factual.google_data;
    parts.push(`Google Maps: Rating ${g.rating}/5, ${g.review_count} reseñas, tipo: ${g.primary_type}`);
    if (g.editorial_summary) parts.push(`Resumen editorial: ${g.editorial_summary}`);
  }
  if (factual.customer_feedback) parts.push(`Feedback de clientes: ${JSON.stringify(factual.customer_feedback)}`);
  if (factual.strengths) parts.push(`Fortalezas: ${JSON.stringify(factual.strengths)}`);
  if (factual.weaknesses) parts.push(`Debilidades: ${JSON.stringify(factual.weaknesses)}`);
  if (factual.competition) parts.push(`Competencia: ${JSON.stringify(factual.competition)}`);
  if (factual.target_audience) parts.push(`Público objetivo: ${JSON.stringify(factual.target_audience)}`);
  
  // From dynamic memory  
  if (dynamic.recent_issues) parts.push(`Problemas recientes: ${JSON.stringify(dynamic.recent_issues)}`);
  if (dynamic.customer_satisfaction) parts.push(`Satisfacción clientes: ${JSON.stringify(dynamic.customer_satisfaction)}`);

  // Business basics
  if (business.category) parts.push(`Categoría: ${business.category}`);
  if (business.avg_rating) parts.push(`Rating promedio: ${business.avg_rating}`);
  if (business.address) parts.push(`Ubicación: ${business.address}`);

  return parts.join("\n");
}

/** Estimate reputation score from Brain data when no reviews */
function estimateBrainScore(factual: Record<string, any>, dynamic: Record<string, any>): number {
  let score = 50; // Base
  
  if (factual.google_data?.rating) {
    score = Math.round((factual.google_data.rating / 5) * 100);
  }
  if (factual.reputation?.score) {
    score = factual.reputation.score;
  }
  if (dynamic.customer_satisfaction?.score) {
    score = Math.round((score + dynamic.customer_satisfaction.score) / 2);
  }

  return Math.min(95, Math.max(10, score));
}
