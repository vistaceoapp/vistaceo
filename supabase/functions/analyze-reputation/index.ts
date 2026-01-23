import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ReputationAnalysis {
  overall_score: number; // 0-100
  sentiment_breakdown: {
    positive: number;
    neutral: number;
    negative: number;
  };
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
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { businessId, forceRefresh } = await req.json();

    if (!businessId) {
      return new Response(
        JSON.stringify({ error: "businessId is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY");
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log(`Starting reputation analysis for business ${businessId}`);

    // Get business info
    const { data: business } = await supabase
      .from("businesses")
      .select("*, business_brains(*)")
      .eq("id", businessId)
      .single();

    if (!business) {
      return new Response(
        JSON.stringify({ error: "Business not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get all external reviews data - check multiple data_type values
    const { data: reviewsData, error: reviewsError } = await supabase
      .from("external_data")
      .select("*")
      .eq("business_id", businessId)
      .in("data_type", ["review", "google_review"])
      .order("synced_at", { ascending: false })
      .limit(500);

    if (reviewsError) {
      console.error("Error fetching reviews:", reviewsError);
    }

    // Also get Google Business integration metadata with actual reviews
    const { data: googleIntegration } = await supabase
      .from("business_integrations")
      .select("metadata, last_sync_at")
      .eq("business_id", businessId)
      .eq("integration_type", "google_business")
      .single();

    // Get YouTube comments if available
    const { data: youtubeData } = await supabase
      .from("business_integrations")
      .select("metadata")
      .eq("business_id", businessId)
      .eq("integration_type", "youtube")
      .single();

    // Combine reviews from external_data
    let reviews = reviewsData || [];
    const youtubeMetadata = youtubeData?.metadata as Record<string, any> | null;
    const googleMetadata = googleIntegration?.metadata as Record<string, any> | null;

    // If we have reviews from Google integration metadata, add them too
    if (googleMetadata?.reviews && Array.isArray(googleMetadata.reviews)) {
      console.log(`Found ${googleMetadata.reviews.length} reviews in Google integration metadata`);
      // These are already in the correct format
    }

    console.log(`Found ${reviews.length} reviews in external_data to analyze`);

    // Build context for AI analysis - normalize different formats
    const reviewTexts = reviews.map(r => {
      const content = r.content as Record<string, any>;
      // Handle different content formats
      const rating = content.rating || content.starRating || "THREE";
      const comment = content.text || content.comment || "";
      return {
        rating: typeof rating === "number" ? ["ONE", "TWO", "THREE", "FOUR", "FIVE"][rating - 1] || "THREE" : rating,
        comment: comment,
        date: content.date || content.create_time || content.createTime,
        hasReply: !!content.reply || !!content.reviewReply,
        author: content.author || content.reviewer?.displayName || "Anónimo",
      };
    });
    
    // Add reviews from Google metadata if available
    if (googleMetadata?.reviews && Array.isArray(googleMetadata.reviews)) {
      for (const gReview of googleMetadata.reviews) {
        reviewTexts.push({
          rating: gReview.rating || gReview.starRating || "THREE",
          comment: gReview.comment || gReview.text || "",
          date: gReview.createTime || gReview.date,
          hasReply: !!gReview.reviewReply,
          author: gReview.reviewer?.displayName || "Cliente Google",
        });
      }
    }

    console.log(`Total reviews to analyze: ${reviewTexts.length}`);

    // Calculate basic metrics
    const starDistribution: Record<string, number> = {
      "FIVE": 0, "FOUR": 0, "THREE": 0, "TWO": 0, "ONE": 0
    };
    
    let totalSentiment = 0;
    let positiveCount = 0;
    let neutralCount = 0;
    let negativeCount = 0;
    let repliedCount = 0;

    for (const review of reviewTexts) {
      const rating = review.rating || "THREE";
      starDistribution[rating] = (starDistribution[rating] || 0) + 1;
      
      if (["FIVE", "FOUR"].includes(rating)) {
        positiveCount++;
        totalSentiment += rating === "FIVE" ? 1 : 0.5;
      } else if (rating === "THREE") {
        neutralCount++;
      } else {
        negativeCount++;
        totalSentiment += rating === "TWO" ? -0.5 : -1;
      }
      
      if (review.hasReply) repliedCount++;
    }

    const totalReviews = reviewTexts.length || 1;
    const avgSentiment = totalSentiment / totalReviews;
    const responseRate = (repliedCount / totalReviews) * 100;

    // Prepare AI analysis context
    const analysisContext = `
NEGOCIO: ${business.name}
TIPO: ${business.category || "General"}
RATING ACTUAL: ${business.avg_rating || "N/A"}/5

RESUMEN DE RESEÑAS (${reviewTexts.length} total):
- 5 estrellas: ${starDistribution["FIVE"]}
- 4 estrellas: ${starDistribution["FOUR"]}
- 3 estrellas: ${starDistribution["THREE"]}
- 2 estrellas: ${starDistribution["TWO"]}
- 1 estrella: ${starDistribution["ONE"]}
- Tasa de respuesta: ${responseRate.toFixed(1)}%

ÚLTIMAS RESEÑAS CON COMENTARIOS:
${reviewTexts
  .filter(r => r.comment && r.comment.length > 10)
  .slice(0, 30)
  .map((r, i) => `[${r.rating}] "${r.comment}"`)
  .join("\n")}

${youtubeMetadata ? `
YOUTUBE:
- Suscriptores: ${youtubeMetadata.subscriber_count}
- Engagement: ${youtubeMetadata.engagement_rate}%
- Videos: ${youtubeMetadata.video_count}
` : ""}
`;

    let aiAnalysis: Partial<ReputationAnalysis> = {};

    // Call AI for deep analysis
    if (lovableApiKey && reviewTexts.length > 0) {
      try {
        const aiResponse = await fetch("https://ai-gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${lovableApiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-2.5-flash",
            max_tokens: 4000,
            temperature: 0.3,
            messages: [
              {
                role: "system",
                content: `Eres un experto en análisis de reputación online y gestión de marca. Analizas reseñas de negocios y generas insights accionables.

REGLAS:
- Responde SOLO en JSON válido
- Identifica palabras clave REALES de las reseñas (no inventes)
- Los temas deben ser específicos del negocio
- Las recomendaciones deben ser ultra-accionables
- El resumen debe ser en primera persona dirigido al dueño ("Tu negocio...")
- Detecta patrones y tendencias reales
- Sé directo y conciso`
              },
              {
                role: "user",
                content: `Analiza la reputación de este negocio y devuelve un JSON con esta estructura exacta:

${analysisContext}

RESPONDE EXACTAMENTE EN ESTE FORMATO JSON:
{
  "top_positive_words": [{"word": "palabra", "count": 5, "sentiment": 0.9}],
  "top_negative_words": [{"word": "palabra", "count": 2, "sentiment": -0.8}],
  "key_themes": [{"theme": "tema específico", "sentiment": "positive", "frequency": 10}],
  "urgent_issues": ["problema urgente 1", "problema 2"],
  "highlights": ["punto fuerte 1", "punto 2"],
  "trend": "improving|stable|declining",
  "ai_summary": "Resumen de 2-3 oraciones sobre el estado de reputación",
  "recommendations": ["recomendación accionable 1", "recomendación 2", "recomendación 3"]
}`
              }
            ],
          }),
        });

        if (aiResponse.ok) {
          const aiData = await aiResponse.json();
          const content = aiData.choices?.[0]?.message?.content || "";
          
          // Extract JSON from response
          const jsonMatch = content.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            try {
              aiAnalysis = JSON.parse(jsonMatch[0]);
              console.log("AI analysis successful");
            } catch (e) {
              console.error("Failed to parse AI JSON:", e);
            }
          }
        }
      } catch (aiError) {
        console.error("AI analysis error:", aiError);
      }
    }

    // Calculate overall score (0-100)
    const baseScore = ((avgSentiment + 1) / 2) * 100; // Normalize from -1,1 to 0-100
    const responseBonus = responseRate > 80 ? 5 : responseRate > 50 ? 2 : 0;
    const volumeBonus = reviewTexts.length > 50 ? 5 : reviewTexts.length > 20 ? 2 : 0;
    const overallScore = reviewTexts.length === 0 ? 50 : Math.min(100, Math.round(baseScore + responseBonus + volumeBonus));

    // Build final analysis
    const analysis: ReputationAnalysis = {
      overall_score: overallScore,
      sentiment_breakdown: {
        positive: Math.round((positiveCount / totalReviews) * 100),
        neutral: Math.round((neutralCount / totalReviews) * 100),
        negative: Math.round((negativeCount / totalReviews) * 100),
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
      ai_summary: aiAnalysis.ai_summary || `Tu negocio tiene un score de reputación de ${overallScore}/100 basado en ${reviewTexts.length} reseñas analizadas.`,
      recommendations: aiAnalysis.recommendations || [],
      analyzed_reviews_count: reviewTexts.length,
      last_analysis: new Date().toISOString(),
    };

    // Save analysis to brain
    const brain = business.business_brains?.[0];
    if (brain) {
      const existingDynamic = (brain.dynamic_memory || {}) as Record<string, any>;
      
      await supabase
        .from("business_brains")
        .update({
          dynamic_memory: {
            ...existingDynamic,
            reputation_analysis: analysis,
            reputation_score: overallScore,
            reputation_trend: analysis.trend,
            last_reputation_scan: new Date().toISOString(),
          },
          updated_at: new Date().toISOString(),
        })
        .eq("id", brain.id);

      console.log("Reputation analysis saved to brain");
    }

    // Record signal for tracking
    await supabase.from("signals").insert({
      business_id: businessId,
      signal_type: "reputation_analysis",
      source: "ai_analysis",
      content: {
        score: overallScore,
        trend: analysis.trend,
        reviews_analyzed: reviewTexts.length,
        positive_pct: analysis.sentiment_breakdown.positive,
        negative_pct: analysis.sentiment_breakdown.negative,
      },
    });

    console.log(`Reputation analysis complete for ${businessId}: Score ${overallScore}/100`);

    return new Response(
      JSON.stringify({ 
        success: true,
        analysis,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error analyzing reputation:", error);
    return new Response(
      JSON.stringify({ error: "Failed to analyze reputation", details: String(error) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
