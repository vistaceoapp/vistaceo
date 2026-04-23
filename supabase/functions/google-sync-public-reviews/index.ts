import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/**
 * Sync public Google data using Places API (no OAuth required).
 * Extracts: reviews (up to 5), rating, photos, hours, categories, attributes, etc.
 * Perfect for free users during setup.
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
          JSON.stringify({ success: false, message: "No Google Place ID", synced: 0 }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      googlePlaceId = business.google_place_id;
    }

    console.log("Fetching comprehensive public data for place:", googlePlaceId);

    // ── Use Places API (New) with ALL available fields ──
    const fieldMask = [
      "id", "displayName", "formattedAddress", "location",
      "rating", "userRatingCount", "reviews",
      "types", "primaryType", "primaryTypeDisplayName",
      "currentOpeningHours", "regularOpeningHours",
      "photos", "priceLevel", "priceRange",
      "websiteUri", "nationalPhoneNumber", "internationalPhoneNumber",
      "googleMapsUri", "businessStatus",
      "dineIn", "delivery", "takeout", "reservable",
      "servesBreakfast", "servesLunch", "servesDinner", "servesBrunch",
      "servesBeer", "servesWine", "servesCocktails",
      "outdoorSeating", "liveMusic", "menuForChildren",
      "paymentOptions", "parkingOptions", "accessibilityOptions",
      "editorialSummary",
    ].join(",");

    const response = await fetch(
      `https://places.googleapis.com/v1/places/${googlePlaceId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": GOOGLE_PLACES_API_KEY,
          "X-Goog-FieldMask": fieldMask,
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Places API error:", response.status, errorText);
      
      // Fallback to legacy API
      return await syncWithLegacyApi(googlePlaceId, businessId, GOOGLE_PLACES_API_KEY, supabase);
    }

    const placeData = await response.json();
    console.log("Full place data received for:", placeData.displayName?.text);

    // ── Process reviews ──
    const reviews = placeData.reviews || [];
    let syncedCount = 0;

    // Create or update integration record
    const { data: existingInt } = await supabase
      .from("business_integrations")
      .select("id")
      .eq("business_id", businessId)
      .eq("integration_type", "google_places")
      .maybeSingle();

    const integrationMeta = {
      place_id: googlePlaceId,
      place_name: placeData.displayName?.text,
      rating: placeData.rating,
      review_count: placeData.userRatingCount,
      primary_type: placeData.primaryType,
      primary_type_display: placeData.primaryTypeDisplayName?.text,
      business_status: placeData.businessStatus,
      price_level: placeData.priceLevel,
      website: placeData.websiteUri,
      phone: placeData.nationalPhoneNumber || placeData.internationalPhoneNumber,
      address: placeData.formattedAddress,
      google_maps_url: placeData.googleMapsUri,
      photos_count: placeData.photos?.length || 0,
      editorial_summary: placeData.editorialSummary?.text,
      // Service attributes
      dine_in: placeData.dineIn ?? null,
      delivery: placeData.delivery ?? null,
      takeout: placeData.takeout ?? null,
      reservable: placeData.reservable ?? null,
      outdoor_seating: placeData.outdoorSeating ?? null,
      live_music: placeData.liveMusic ?? null,
      // Hours
      regular_hours: placeData.regularOpeningHours?.weekdayDescriptions || null,
      current_hours: placeData.currentOpeningHours?.weekdayDescriptions || null,
      last_sync_status: "success",
      sync_type: "public_comprehensive",
      synced_at: new Date().toISOString(),
    };

    let integrationId: string;

    if (existingInt) {
      integrationId = existingInt.id;
      await supabase
        .from("business_integrations")
        .update({
          status: "active",
          last_sync_at: new Date().toISOString(),
          metadata: integrationMeta,
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
          metadata: integrationMeta,
        })
        .select("id")
        .single();

      if (intError) {
        console.error("Error creating integration:", intError);
        throw intError;
      }
      integrationId = newInt.id;
    }

    // Store reviews
    for (const review of reviews) {
      const reviewId = review.name || `review_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      const rating = review.rating || 0;

      const { error: insertError } = await supabase
        .from("external_data")
        .upsert({
          business_id: businessId,
          integration_id: integrationId,
          data_type: "google_review",
          external_id: reviewId,
          content: {
            source: "google_places_public",
            reviewer_name: review.authorAttribution?.displayName || "Anonymous",
            reviewer_photo: review.authorAttribution?.photoUri,
            rating,
            comment: review.text?.text || "",
            original_text: review.originalText?.text,
            language: review.originalText?.languageCode,
            publish_time: review.publishTime,
            relative_time: review.relativePublishTimeDescription,
          },
          sentiment_score: (rating - 3) / 2,
          importance: ratingToImportance(rating),
          synced_at: new Date().toISOString(),
        }, {
          onConflict: "external_id,integration_id",
        });

      if (!insertError) syncedCount++;
    }

    // ── Update business with ALL extracted public data ──
    const businessUpdate: Record<string, any> = {
      avg_rating: placeData.rating || undefined,
      updated_at: new Date().toISOString(),
    };

    // Extract address if not already set
    if (placeData.formattedAddress) {
      businessUpdate.address = placeData.formattedAddress;
    }

    await supabase
      .from("businesses")
      .update(businessUpdate)
      .eq("id", businessId);

    // ── Update Brain with comprehensive Google data ──
    try {
      const { data: brain } = await supabase
        .from("business_brains")
        .select("factual_memory")
        .eq("business_id", businessId)
        .single();

      if (brain) {
        const factual = (brain.factual_memory as Record<string, any>) || {};

        factual.google_data = {
          place_id: googlePlaceId,
          place_name: placeData.displayName?.text,
          rating: placeData.rating,
          review_count: placeData.userRatingCount,
          address: placeData.formattedAddress,
          primary_type: placeData.primaryTypeDisplayName?.text || placeData.primaryType,
          business_status: placeData.businessStatus,
          price_level: placeData.priceLevel,
          website: placeData.websiteUri,
          phone: placeData.nationalPhoneNumber,
          editorial_summary: placeData.editorialSummary?.text,
          // Service flags
          services: {
            dine_in: placeData.dineIn,
            delivery: placeData.delivery,
            takeout: placeData.takeout,
            reservable: placeData.reservable,
            outdoor_seating: placeData.outdoorSeating,
          },
          hours: placeData.regularOpeningHours?.weekdayDescriptions,
          photos_available: placeData.photos?.length || 0,
          last_sync: new Date().toISOString(),
          data_source: "public_places_api",
        };

        // Store top review themes for the Brain
        if (reviews.length > 0) {
          factual.google_data.sample_reviews = reviews.slice(0, 5).map((r: any) => ({
            rating: r.rating,
            text: (r.text?.text || "").substring(0, 200),
            time: r.relativePublishTimeDescription,
          }));
        }

        await supabase
          .from("business_brains")
          .update({ factual_memory: factual, updated_at: new Date().toISOString() })
          .eq("business_id", businessId);

        console.log("Brain updated with comprehensive Google data");
      }
    } catch (e) {
      console.warn("Could not update brain (non-fatal):", e);
    }

    // Always trigger reputation analysis after sync
    try {
      const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
      const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") || Deno.env.get("SUPABASE_PUBLISHABLE_KEY") || "";
      await fetch(`${supabaseUrl}/functions/v1/analyze-reputation`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${supabaseKey}`,
          "apikey": supabaseAnonKey,
        },
        body: JSON.stringify({ businessId, forceRefresh: true }),
      });
      console.log("Triggered reputation analysis");
    } catch (e) {
      console.warn("Could not trigger reputation analysis:", e);
    }

    // Trigger signal processing if we have reviews
    if (syncedCount > 0) {
      try {
        const supabaseUrl2 = Deno.env.get("SUPABASE_URL")!;
        const supabaseAnonKey2 = Deno.env.get("SUPABASE_ANON_KEY") || Deno.env.get("SUPABASE_PUBLISHABLE_KEY") || "";
        await fetch(`${supabaseUrl2}/functions/v1/brain-process-signals`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${supabaseKey}`,
            "apikey": supabaseAnonKey2,
          },
          body: JSON.stringify({ businessId }),
        });
        console.log("Triggered brain signal processing");
      } catch (e) {
        console.warn("Could not trigger signal processing:", e);
      }
    }

    console.log(`Comprehensive sync: ${syncedCount} reviews, ${placeData.photos?.length || 0} photos available`);

    return new Response(
      JSON.stringify({
        success: true,
        synced: syncedCount,
        total: reviews.length,
        rating: placeData.rating,
        reviewCount: placeData.userRatingCount,
        placeName: placeData.displayName?.text,
        dataExtracted: {
          reviews: syncedCount,
          hasHours: !!placeData.regularOpeningHours,
          hasPhotos: (placeData.photos?.length || 0) > 0,
          hasPhone: !!placeData.nationalPhoneNumber,
          hasWebsite: !!placeData.websiteUri,
          hasPriceLevel: !!placeData.priceLevel,
          hasEditorialSummary: !!placeData.editorialSummary,
        },
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

// Fallback to legacy Places API
async function syncWithLegacyApi(placeId: string, businessId: string, apiKey: string, supabase: any) {
  console.log("Falling back to legacy Places API");

  const url = new URL("https://maps.googleapis.com/maps/api/place/details/json");
  url.searchParams.set("place_id", placeId);
  url.searchParams.set("key", apiKey);
  url.searchParams.set("fields", "place_id,name,rating,user_ratings_total,reviews,formatted_address,formatted_phone_number,website,opening_hours,price_level,types,url,photos,editorial_summary");
  url.searchParams.set("reviews_sort", "newest");

  const response = await fetch(url.toString());
  const data = await response.json();

  if (data.status !== "OK") {
    console.error("Legacy API error:", data.status, data.error_message);
    return new Response(
      JSON.stringify({ success: false, error: data.error_message || "Could not fetch place details", synced: 0 }),
      { headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }

  const place = data.result;
  const reviews = place.reviews || [];
  let syncedCount = 0;

  const { data: existingInt } = await supabase
    .from("business_integrations")
    .select("id")
    .eq("business_id", businessId)
    .eq("integration_type", "google_places")
    .maybeSingle();

  const meta = {
    place_id: placeId,
    place_name: place.name,
    rating: place.rating,
    review_count: place.user_ratings_total,
    address: place.formatted_address,
    phone: place.formatted_phone_number,
    website: place.website,
    price_level: place.price_level,
    types: place.types,
    google_maps_url: place.url,
    photos_count: place.photos?.length || 0,
    has_hours: !!place.opening_hours,
    last_sync_status: "success",
    sync_type: "public_legacy",
    synced_at: new Date().toISOString(),
  };

  let integrationId: string;

  if (existingInt) {
    integrationId = existingInt.id;
    await supabase
      .from("business_integrations")
      .update({ status: "active", last_sync_at: new Date().toISOString(), metadata: meta })
      .eq("id", integrationId);
  } else {
    const { data: newInt } = await supabase
      .from("business_integrations")
      .insert({
        business_id: businessId,
        integration_type: "google_places",
        status: "active",
        last_sync_at: new Date().toISOString(),
        metadata: meta,
      })
      .select("id")
      .single();
    integrationId = newInt?.id;
  }

  for (const review of reviews) {
    const reviewId = `legacy_${review.time}_${(review.author_name || "anon").substring(0, 10)}`;

    const { error: insertError } = await supabase
      .from("external_data")
      .upsert({
        business_id: businessId,
        integration_id: integrationId,
        data_type: "google_review",
        external_id: reviewId,
        content: {
          source: "google_places_legacy",
          reviewer_name: review.author_name || "Anonymous",
          reviewer_photo: review.profile_photo_url,
          rating: review.rating,
          comment: review.text || "",
          language: review.language,
          publish_time: new Date(review.time * 1000).toISOString(),
          relative_time: review.relative_time_description,
        },
        sentiment_score: (review.rating - 3) / 2,
        importance: ratingToImportance(review.rating),
        synced_at: new Date().toISOString(),
      }, {
        onConflict: "external_id,integration_id",
      });

    if (!insertError) syncedCount++;
  }

  await supabase
    .from("businesses")
    .update({ avg_rating: place.rating, address: place.formatted_address, updated_at: new Date().toISOString() })
    .eq("id", businessId);

  // Update brain
  try {
    const { data: brain } = await supabase
      .from("business_brains")
      .select("factual_memory")
      .eq("business_id", businessId)
      .single();

    if (brain) {
      const factual = (brain.factual_memory as Record<string, any>) || {};
      factual.google_data = {
        place_id: placeId,
        rating: place.rating,
        review_count: place.user_ratings_total,
        address: place.formatted_address,
        phone: place.formatted_phone_number,
        website: place.website,
        types: place.types,
        price_level: place.price_level,
        last_sync: new Date().toISOString(),
        data_source: "public_legacy_api",
      };
      await supabase
        .from("business_brains")
        .update({ factual_memory: factual, updated_at: new Date().toISOString() })
        .eq("business_id", businessId);
    }
  } catch (e) {
    console.warn("Brain update failed (non-fatal):", e);
  }

  return new Response(
    JSON.stringify({
      success: true, synced: syncedCount, total: reviews.length,
      rating: place.rating, reviewCount: place.user_ratings_total, placeName: place.name,
      apiType: "legacy",
    }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}

function ratingToImportance(rating: number): number {
  const map: Record<number, number> = { 1: 10, 2: 8, 3: 5, 4: 3, 5: 2 };
  return map[rating] ?? 5;
}
