import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

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

    // Get the integration
    const { data: integration, error: intError } = await supabase
      .from("business_integrations")
      .select("*")
      .eq("business_id", businessId)
      .eq("integration_type", "google_reviews")
      .single();

    if (intError || !integration) {
      return new Response(
        JSON.stringify({ error: "Google Reviews not connected" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const metadata = integration.metadata as {
      google_location_id?: string;
      google_location_name?: string;
    };

    if (!metadata?.google_location_id) {
      return new Response(
        JSON.stringify({ error: "No Google Business location selected" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const credentials = integration.credentials as {
      access_token: string;
      refresh_token: string;
      expires_at: number;
    };

    // Refresh token if needed
    let accessToken = credentials.access_token;
    if (Date.now() > credentials.expires_at) {
      accessToken = await refreshAccessToken(credentials.refresh_token, supabase, integration.id);
    }

    // Fetch reviews from Google Business Profile API
    const locationId = metadata.google_location_id;
    console.log("Fetching reviews for location:", locationId);

    const reviewsResponse = await fetch(
      `https://mybusiness.googleapis.com/v4/${locationId}/reviews`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    if (!reviewsResponse.ok) {
      const errorText = await reviewsResponse.text();
      console.error("Failed to fetch reviews:", reviewsResponse.status, errorText);
      
      // Try alternative API endpoint
      const altReviewsResponse = await fetch(
        `https://mybusinessbusinessinformation.googleapis.com/v1/${locationId}?readMask=metadata`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );
      
      if (altReviewsResponse.ok) {
        const locationData = await altReviewsResponse.json();
        console.log("Location metadata:", locationData);
      }

      return new Response(
        JSON.stringify({ 
          error: "Failed to fetch reviews",
          details: errorText,
          note: "Google Business Profile API may require additional setup"
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const reviewsData = await reviewsResponse.json();
    console.log("Reviews fetched:", reviewsData);

    const reviews = reviewsData.reviews || [];
    let syncedCount = 0;

    // Store reviews in external_data table
    for (const review of reviews) {
      const { error: insertError } = await supabase
        .from("external_data")
        .upsert({
          business_id: businessId,
          integration_id: integration.id,
          data_type: "google_review",
          external_id: review.reviewId || review.name,
          content: {
            reviewer_name: review.reviewer?.displayName || "Anonymous",
            rating: review.starRating,
            comment: review.comment || "",
            create_time: review.createTime,
            update_time: review.updateTime,
            reply: review.reviewReply?.comment || null,
          },
          sentiment_score: ratingToSentiment(review.starRating),
          importance: ratingToImportance(review.starRating),
          synced_at: new Date().toISOString(),
        }, {
          onConflict: "external_id,integration_id"
        });

      if (!insertError) syncedCount++;
    }

    // Update last sync time
    await supabase
      .from("business_integrations")
      .update({
        last_sync_at: new Date().toISOString(),
        metadata: {
          ...metadata,
          last_review_count: reviews.length,
          last_sync_status: "success",
        },
      })
      .eq("id", integration.id);

    console.log(`Synced ${syncedCount} reviews for business ${businessId}`);

    // Trigger signal processing pipeline
    try {
      await supabase.functions.invoke("brain-process-signals", {
        body: { businessId }
      });
      console.log(`Triggered signal processing for business ${businessId}`);
    } catch (pipelineError) {
      console.error("Error triggering signal pipeline:", pipelineError);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        synced: syncedCount,
        total: reviews.length,
        location: metadata.google_location_name,
        pipelineTriggered: true
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error syncing reviews:", error);
    return new Response(
      JSON.stringify({ error: "Failed to sync reviews", details: String(error) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

function ratingToSentiment(rating: string): number {
  const ratingMap: Record<string, number> = {
    "FIVE": 1.0,
    "FOUR": 0.5,
    "THREE": 0.0,
    "TWO": -0.5,
    "ONE": -1.0,
  };
  return ratingMap[rating] ?? 0;
}

function ratingToImportance(rating: string): number {
  // Low ratings are more important to address
  const importanceMap: Record<string, number> = {
    "ONE": 10,
    "TWO": 8,
    "THREE": 5,
    "FOUR": 3,
    "FIVE": 2,
  };
  return importanceMap[rating] ?? 5;
}

async function refreshAccessToken(refreshToken: string, supabase: any, integrationId: string): Promise<string> {
  const GOOGLE_CLIENT_ID = Deno.env.get("GOOGLE_CLIENT_ID");
  const GOOGLE_CLIENT_SECRET = Deno.env.get("GOOGLE_CLIENT_SECRET");

  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: GOOGLE_CLIENT_ID!,
      client_secret: GOOGLE_CLIENT_SECRET!,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to refresh token");
  }

  const tokens = await response.json();

  await supabase
    .from("business_integrations")
    .update({
      credentials: {
        access_token: tokens.access_token,
        refresh_token: refreshToken,
        expires_at: Date.now() + (tokens.expires_in * 1000),
        token_type: tokens.token_type,
      },
    })
    .eq("id", integrationId);

  return tokens.access_token;
}
