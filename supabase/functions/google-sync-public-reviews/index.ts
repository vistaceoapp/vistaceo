import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/**
 * Sync public Google reviews using Places API
 * This doesn't require OAuth - uses public data from Google Places
 * Perfect for auto-sync on setup when user selects their business
 */
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { businessId, placeId } = await req.json();

    if (!businessId) {
      return new Response(
        JSON.stringify({ error: "businessId is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const GOOGLE_PLACES_API_KEY = Deno.env.get("GOOGLE_PLACES_API_KEY");
    const supabase = createClient(supabaseUrl, supabaseKey);

    if (!GOOGLE_PLACES_API_KEY) {
      console.error("GOOGLE_PLACES_API_KEY not configured");
      return new Response(
        JSON.stringify({ error: "Google Places API not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get business to find placeId if not provided
    let googlePlaceId = placeId;
    if (!googlePlaceId) {
      const { data: business, error: bizError } = await supabase
        .from("businesses")
        .select("google_place_id, name")
        .eq("id", businessId)
        .single();

      if (bizError || !business?.google_place_id) {
        console.log("No Google Place ID found for business:", businessId);
        return new Response(
          JSON.stringify({ 
            success: false, 
            message: "No Google Place ID associated with this business",
            synced: 0 
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      googlePlaceId = business.google_place_id;
    }

    console.log("Fetching public reviews for place:", googlePlaceId);

    // Use Places API (New) to get reviews - it includes up to 5 reviews
    const detailsUrl = new URL("https://places.googleapis.com/v1/places/" + googlePlaceId);
    
    const response = await fetch(detailsUrl.toString(), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": GOOGLE_PLACES_API_KEY,
        "X-Goog-FieldMask": "id,displayName,rating,userRatingCount,reviews",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Places API error:", response.status, errorText);
      
      // Fallback to legacy API
      return await syncWithLegacyApi(
        googlePlaceId, 
        businessId, 
        GOOGLE_PLACES_API_KEY, 
        supabase
      );
    }

    const placeData = await response.json();
    console.log("Place data received:", placeData.displayName?.text, "rating:", placeData.rating);

    const reviews = placeData.reviews || [];
    let syncedCount = 0;

    // Create or update the google_places integration record
    const { data: existingInt } = await supabase
      .from("business_integrations")
      .select("id")
      .eq("business_id", businessId)
      .eq("integration_type", "google_places")
      .single();

    let integrationId: string;
    
    if (existingInt) {
      integrationId = existingInt.id;
      await supabase
        .from("business_integrations")
        .update({
          status: "active",
          last_sync_at: new Date().toISOString(),
          metadata: {
            place_id: googlePlaceId,
            place_name: placeData.displayName?.text,
            rating: placeData.rating,
            review_count: placeData.userRatingCount,
            last_sync_status: "success",
            sync_type: "public",
          },
        })
        .eq("id", integrationId);
    } else {
      const { data: newInt, error: intError } = await supabase
        .from("business_integrations")
        .insert({
          business_id: businessId,
          integration_type: "google_places",
          status: "active",
          last_sync_at: new Date().toISOString(),
          metadata: {
            place_id: googlePlaceId,
            place_name: placeData.displayName?.text,
            rating: placeData.rating,
            review_count: placeData.userRatingCount,
            last_sync_status: "success",
            sync_type: "public",
          },
        })
        .select("id")
        .single();

      if (intError) {
        console.error("Error creating integration:", intError);
        throw intError;
      }
      integrationId = newInt.id;
    }

    // Store reviews in external_data
    for (const review of reviews) {
      const reviewId = review.name || `review_${Date.now()}_${Math.random()}`;
      const rating = review.rating || 0;
      
      const { error: insertError } = await supabase
        .from("external_data")
        .upsert({
          business_id: businessId,
          integration_id: integrationId,
          data_type: "google_review",
          external_id: reviewId,
          content: {
            reviewer_name: review.authorAttribution?.displayName || "Anonymous",
            reviewer_photo: review.authorAttribution?.photoUri,
            rating: rating,
            comment: review.text?.text || "",
            original_text: review.originalText?.text,
            language: review.originalText?.languageCode,
            publish_time: review.publishTime,
            relative_time: review.relativePublishTimeDescription,
          },
          sentiment_score: ratingToSentiment(rating),
          importance: ratingToImportance(rating),
          synced_at: new Date().toISOString(),
        }, {
          onConflict: "external_id,integration_id"
        });

      if (!insertError) syncedCount++;
    }

    // Update business with latest rating info
    await supabase
      .from("businesses")
      .update({
        avg_rating: placeData.rating,
        updated_at: new Date().toISOString(),
      })
      .eq("id", businessId);

    // Update brain with Google data
    await supabase
      .from("business_brains")
      .update({
        factual_memory: supabase.rpc("jsonb_set_nested", {
          target: "factual_memory",
          path: ["google_data"],
          value: {
            place_id: googlePlaceId,
            rating: placeData.rating,
            review_count: placeData.userRatingCount,
            last_sync: new Date().toISOString(),
          }
        }),
        updated_at: new Date().toISOString(),
      })
      .eq("business_id", businessId);

    console.log(`Synced ${syncedCount} public reviews for business ${businessId}`);

    // Trigger signal processing if we have reviews
    if (syncedCount > 0) {
      try {
        await supabase.functions.invoke("brain-process-signals", {
          body: { businessId }
        });
        console.log("Triggered brain signal processing");
      } catch (e) {
        console.warn("Could not trigger signal processing:", e);
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        synced: syncedCount,
        total: reviews.length,
        rating: placeData.rating,
        reviewCount: placeData.userRatingCount,
        placeName: placeData.displayName?.text,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error syncing public reviews:", error);
    return new Response(
      JSON.stringify({ error: "Failed to sync reviews", details: String(error) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

// Fallback to legacy Places API if new API fails
async function syncWithLegacyApi(
  placeId: string, 
  businessId: string, 
  apiKey: string, 
  supabase: any
) {
  console.log("Falling back to legacy Places API");
  
  const url = new URL("https://maps.googleapis.com/maps/api/place/details/json");
  url.searchParams.set("place_id", placeId);
  url.searchParams.set("key", apiKey);
  url.searchParams.set("fields", "place_id,name,rating,user_ratings_total,reviews");
  url.searchParams.set("reviews_sort", "newest");

  const response = await fetch(url.toString());
  const data = await response.json();

  if (data.status !== "OK") {
    console.error("Legacy API error:", data.status, data.error_message);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: data.error_message || "Could not fetch place details",
        synced: 0 
      }),
      { headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }

  const place = data.result;
  const reviews = place.reviews || [];
  let syncedCount = 0;

  // Create or get integration
  const { data: existingInt } = await supabase
    .from("business_integrations")
    .select("id")
    .eq("business_id", businessId)
    .eq("integration_type", "google_places")
    .single();

  let integrationId: string;
  
  if (existingInt) {
    integrationId = existingInt.id;
    await supabase
      .from("business_integrations")
      .update({
        status: "active",
        last_sync_at: new Date().toISOString(),
        metadata: {
          place_id: placeId,
          place_name: place.name,
          rating: place.rating,
          review_count: place.user_ratings_total,
          last_sync_status: "success",
          sync_type: "public_legacy",
        },
      })
      .eq("id", integrationId);
  } else {
    const { data: newInt } = await supabase
      .from("business_integrations")
      .insert({
        business_id: businessId,
        integration_type: "google_places",
        status: "active",
        last_sync_at: new Date().toISOString(),
        metadata: {
          place_id: placeId,
          place_name: place.name,
          rating: place.rating,
          review_count: place.user_ratings_total,
          last_sync_status: "success",
          sync_type: "public_legacy",
        },
      })
      .select("id")
      .single();
    integrationId = newInt.id;
  }

  // Store reviews
  for (const review of reviews) {
    const reviewId = `legacy_${review.time}_${review.author_name?.substring(0, 10)}`;
    
    const { error: insertError } = await supabase
      .from("external_data")
      .upsert({
        business_id: businessId,
        integration_id: integrationId,
        data_type: "google_review",
        external_id: reviewId,
        content: {
          reviewer_name: review.author_name || "Anonymous",
          reviewer_photo: review.profile_photo_url,
          rating: review.rating,
          comment: review.text || "",
          language: review.language,
          publish_time: new Date(review.time * 1000).toISOString(),
          relative_time: review.relative_time_description,
        },
        sentiment_score: ratingToSentiment(review.rating),
        importance: ratingToImportance(review.rating),
        synced_at: new Date().toISOString(),
      }, {
        onConflict: "external_id,integration_id"
      });

    if (!insertError) syncedCount++;
  }

  // Update business rating
  await supabase
    .from("businesses")
    .update({
      avg_rating: place.rating,
      updated_at: new Date().toISOString(),
    })
    .eq("id", businessId);

  console.log(`Legacy API synced ${syncedCount} reviews`);

  return new Response(
    JSON.stringify({ 
      success: true, 
      synced: syncedCount,
      total: reviews.length,
      rating: place.rating,
      reviewCount: place.user_ratings_total,
      placeName: place.name,
      apiType: "legacy",
    }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}

function ratingToSentiment(rating: number): number {
  // Map 1-5 rating to -1 to 1 sentiment
  return (rating - 3) / 2;
}

function ratingToImportance(rating: number): number {
  // Low ratings are more important to address
  const importanceMap: Record<number, number> = {
    1: 10,
    2: 8,
    3: 5,
    4: 3,
    5: 2,
  };
  return importanceMap[rating] ?? 5;
}
