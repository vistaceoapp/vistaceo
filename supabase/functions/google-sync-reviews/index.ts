import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

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

    const metadata = integration.metadata as Record<string, any> || {};

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

    if (!credentials?.refresh_token) {
      return new Response(
        JSON.stringify({ error: "Missing credentials. Please reconnect Google Business Profile." }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Refresh token if needed
    let accessToken = credentials.access_token;
    if (Date.now() > (credentials.expires_at || 0)) {
      console.log("Token expired, refreshing...");
      accessToken = await refreshAccessToken(credentials.refresh_token, supabase, integration.id);
    }

    const locationId = metadata.google_location_id;
    console.log("Fetching reviews for location:", locationId);

    // ── 1. Fetch reviews using My Business Account Management API v1 ──
    const reviewsUrl = `https://mybusiness.googleapis.com/v4/${locationId}/reviews`;
    let reviewsData: any = { reviews: [] };

    const reviewsResponse = await fetch(reviewsUrl, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (reviewsResponse.ok) {
      reviewsData = await reviewsResponse.json();
      console.log("Reviews fetched via v4:", reviewsData.reviews?.length || 0);
    } else {
      const errText = await reviewsResponse.text();
      console.warn("v4 reviews API failed:", reviewsResponse.status, errText);

      // Fallback: try My Business v1 (some accounts use this)
      const altUrl = `https://mybusinessbusinessinformation.googleapis.com/v1/${locationId}?readMask=name,title,metadata`;
      const altRes = await fetch(altUrl, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (altRes.ok) {
        const altData = await altRes.json();
        console.log("Location metadata available:", JSON.stringify(altData).substring(0, 200));
      } else {
        await altRes.text(); // consume body
      }
    }

    const reviews = reviewsData.reviews || [];
    let syncedCount = 0;

    // Store reviews in external_data table
    for (const review of reviews) {
      const reviewId = review.reviewId || review.name || `gbp_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      const starRating = review.starRating || "THREE";
      
      const { error: insertError } = await supabase
        .from("external_data")
        .upsert({
          business_id: businessId,
          integration_id: integration.id,
          data_type: "google_review",
          external_id: reviewId,
          content: {
            source: "google_business_profile",
            reviewer_name: review.reviewer?.displayName || "Anonymous",
            reviewer_photo: review.reviewer?.profilePhotoUrl || null,
            rating: starRating,
            rating_numeric: starRatingToNumeric(starRating),
            comment: review.comment || "",
            create_time: review.createTime,
            update_time: review.updateTime,
            reply: review.reviewReply?.comment || null,
            reply_time: review.reviewReply?.updateTime || null,
          },
          sentiment_score: sentimentFromStarRating(starRating),
          importance: importanceFromStarRating(starRating),
          synced_at: new Date().toISOString(),
        }, {
          onConflict: "external_id,integration_id",
        });

      if (!insertError) syncedCount++;
      else console.warn("Review upsert error:", insertError.message);
    }

    // ── 2. Fetch location details for extra data ──
    let locationDetails: any = null;
    try {
      const detailsUrl = `https://mybusinessbusinessinformation.googleapis.com/v1/${locationId}?readMask=name,title,phoneNumbers,categories,storefrontAddress,websiteUri,regularHours,specialHours,serviceArea,profile,openInfo,metadata,moreHours`;
      const detailsRes = await fetch(detailsUrl, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (detailsRes.ok) {
        locationDetails = await detailsRes.json();
        console.log("Location details fetched:", locationDetails.title);
      } else {
        const t = await detailsRes.text();
        console.warn("Could not fetch location details:", detailsRes.status, t);
      }
    } catch (e) {
      console.warn("Location details error (non-fatal):", e);
    }

    // ── 3. Fetch performance insights (if available) ──
    let insightsData: any = null;
    try {
      // Use the Performance API (newer) 
      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      const insightsUrl = `https://businessprofileperformance.googleapis.com/v1/${locationId}:getDailyMetricsTimeSeries?dailyMetric=BUSINESS_IMPRESSIONS_DESKTOP_MAPS&dailyMetric=BUSINESS_IMPRESSIONS_MOBILE_MAPS&dailyMetric=BUSINESS_IMPRESSIONS_DESKTOP_SEARCH&dailyMetric=BUSINESS_IMPRESSIONS_MOBILE_SEARCH&dailyMetric=CALL_CLICKS&dailyMetric=WEBSITE_CLICKS&dailyMetric=BUSINESS_DIRECTION_REQUESTS&dailyRange.startDate.year=${thirtyDaysAgo.getFullYear()}&dailyRange.startDate.month=${thirtyDaysAgo.getMonth() + 1}&dailyRange.startDate.day=${thirtyDaysAgo.getDate()}&dailyRange.endDate.year=${now.getFullYear()}&dailyRange.endDate.month=${now.getMonth() + 1}&dailyRange.endDate.day=${now.getDate()}`;
      
      const insightsRes = await fetch(insightsUrl, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (insightsRes.ok) {
        insightsData = await insightsRes.json();
        console.log("Performance insights fetched successfully");
      } else {
        const t = await insightsRes.text();
        console.warn("Insights API response:", insightsRes.status, t.substring(0, 200));
      }
    } catch (e) {
      console.warn("Insights fetch error (non-fatal):", e);
    }

    // ── 4. Update metadata with all synced data ──
    const updatedMetadata = {
      ...metadata,
      last_review_count: reviews.length,
      last_sync_status: "success",
      last_sync_at: new Date().toISOString(),
      synced_reviews_total: syncedCount,
      has_insights: !!insightsData,
      has_location_details: !!locationDetails,
    };

    if (locationDetails) {
      updatedMetadata.phone = locationDetails.phoneNumbers?.primaryPhone || null;
      updatedMetadata.website = locationDetails.websiteUri || null;
      updatedMetadata.categories = locationDetails.categories || null;
      updatedMetadata.regular_hours = locationDetails.regularHours || null;
      updatedMetadata.profile_description = locationDetails.profile?.description || null;
      updatedMetadata.open_info = locationDetails.openInfo || null;
    }

    await supabase
      .from("business_integrations")
      .update({
        last_sync_at: new Date().toISOString(),
        metadata: updatedMetadata,
      })
      .eq("id", integration.id);

    // ── 5. Store insights as external_data if available ──
    if (insightsData?.timeSeries) {
      for (const series of insightsData.timeSeries) {
        const metricName = series.dailyMetric || "unknown";
        const dataPoints = series.timeSeries?.datedValues || [];
        
        if (dataPoints.length > 0) {
          const externalId = `gbp_insights_${metricName}_${businessId}`;
          await supabase
            .from("external_data")
            .upsert({
              business_id: businessId,
              integration_id: integration.id,
              data_type: "google_insights",
              external_id: externalId,
              content: {
                metric: metricName,
                period: "last_30_days",
                data_points: dataPoints,
                fetched_at: new Date().toISOString(),
              },
              importance: 5,
              synced_at: new Date().toISOString(),
            }, {
              onConflict: "external_id,integration_id",
            });
        }
      }
      console.log("Insights stored:", insightsData.timeSeries.length, "metrics");
    }

    // ── 6. Update Brain with comprehensive GBP data ──
    try {
      const { data: brain } = await supabase
        .from("business_brains")
        .select("factual_memory")
        .eq("business_id", businessId)
        .single();

      if (brain) {
        const factual = (brain.factual_memory as Record<string, any>) || {};

        factual.google_business_profile = {
          connected: true,
          location_name: metadata.google_location_name,
          account_email: metadata.account_email,
          review_count: reviews.length,
          has_full_access: true,
          last_sync: new Date().toISOString(),
          has_insights: !!insightsData,
        };

        if (locationDetails) {
          factual.google_business_profile.phone = locationDetails.phoneNumbers?.primaryPhone;
          factual.google_business_profile.website = locationDetails.websiteUri;
          factual.google_business_profile.categories = locationDetails.categories?.primaryCategory?.displayName;
          factual.google_business_profile.description = locationDetails.profile?.description;
        }

        if (insightsData?.timeSeries) {
          const insightsSummary: Record<string, number> = {};
          for (const series of insightsData.timeSeries) {
            const metric = series.dailyMetric || "unknown";
            const total = (series.timeSeries?.datedValues || []).reduce(
              (sum: number, dp: any) => sum + (parseInt(dp.value) || 0), 0
            );
            insightsSummary[metric] = total;
          }
          factual.google_business_profile.insights_30d = insightsSummary;
        }

        await supabase
          .from("business_brains")
          .update({ factual_memory: factual, updated_at: new Date().toISOString() })
          .eq("business_id", businessId);
      }
    } catch (e) {
      console.warn("Could not update brain (non-fatal):", e);
    }

    // ── 7. Trigger signal processing pipeline ──
    if (syncedCount > 0) {
      try {
        await supabase.functions.invoke("brain-process-signals", {
          body: { businessId },
        });
        console.log("Triggered brain signal processing");
      } catch (e) {
        console.warn("Could not trigger signal processing:", e);
      }
    }

    console.log(`Sync complete: ${syncedCount} reviews, insights: ${!!insightsData}, details: ${!!locationDetails}`);

    return new Response(
      JSON.stringify({
        success: true,
        synced: syncedCount,
        total: reviews.length,
        location: metadata.google_location_name,
        hasInsights: !!insightsData,
        hasDetails: !!locationDetails,
        pipelineTriggered: syncedCount > 0,
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

function starRatingToNumeric(rating: string): number {
  const map: Record<string, number> = { FIVE: 5, FOUR: 4, THREE: 3, TWO: 2, ONE: 1 };
  return map[rating] ?? 3;
}

function sentimentFromStarRating(rating: string): number {
  const map: Record<string, number> = { FIVE: 1.0, FOUR: 0.5, THREE: 0.0, TWO: -0.5, ONE: -1.0 };
  return map[rating] ?? 0;
}

function importanceFromStarRating(rating: string): number {
  const map: Record<string, number> = { ONE: 10, TWO: 8, THREE: 5, FOUR: 3, FIVE: 2 };
  return map[rating] ?? 5;
}

async function refreshAccessToken(refreshToken: string, supabase: any, integrationId: string): Promise<string> {
  const GOOGLE_CLIENT_ID = Deno.env.get("GOOGLE_CLIENT_ID");
  const GOOGLE_CLIENT_SECRET = Deno.env.get("GOOGLE_CLIENT_SECRET");

  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
    throw new Error("Google OAuth credentials not configured on server");
  }

  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Token refresh failed:", response.status, errorText);

    // Mark integration as needing reconnect
    await supabase
      .from("business_integrations")
      .update({
        status: "token_expired",
        metadata: {
          last_error: "Token refresh failed",
          error_at: new Date().toISOString(),
          needs_reconnect: true,
        },
      })
      .eq("id", integrationId);

    throw new Error("Token refresh failed. User needs to reconnect Google Business Profile.");
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
      updated_at: new Date().toISOString(),
    })
    .eq("id", integrationId);

  return tokens.access_token;
}
