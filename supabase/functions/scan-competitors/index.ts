import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { businessId } = await req.json();
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const GOOGLE_PLACES_API_KEY = Deno.env.get("GOOGLE_PLACES_API_KEY");

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Fetch business data
    const { data: business, error: bizError } = await supabase
      .from("businesses")
      .select("id, name, address, google_place_id, category, country, competitive_radius_km")
      .eq("id", businessId)
      .single();

    if (bizError || !business) {
      throw new Error("Business not found");
    }

    const radius = (business.competitive_radius_km || 2) * 1000; // Convert to meters
    let competitorsFound = 0;

    // If we have Google Places API key and place ID, use real data
    if (GOOGLE_PLACES_API_KEY && business.google_place_id) {
      // First get business location from its place ID
      const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${business.google_place_id}&fields=geometry,types&key=${GOOGLE_PLACES_API_KEY}`;
      const detailsRes = await fetch(detailsUrl);
      const detailsData = await detailsRes.json();

      if (detailsData.result?.geometry?.location) {
        const { lat, lng } = detailsData.result.geometry.location;
        const types = detailsData.result.types || [];
        
        // Determine search type based on business category
        const searchType = types.includes("restaurant") ? "restaurant" 
          : types.includes("cafe") ? "cafe"
          : types.includes("bar") ? "bar"
          : "establishment";

        // Search for nearby competitors
        const nearbyUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=${radius}&type=${searchType}&key=${GOOGLE_PLACES_API_KEY}`;
        const nearbyRes = await fetch(nearbyUrl);
        const nearbyData = await nearbyRes.json();

        if (nearbyData.results) {
          // Filter out the business itself
          const competitors = nearbyData.results
            .filter((p: any) => p.place_id !== business.google_place_id)
            .slice(0, 15);

          for (const place of competitors) {
            const distanceKm = calculateDistance(
              lat, lng,
              place.geometry.location.lat,
              place.geometry.location.lng
            );

            await supabase.from("business_competitors").upsert({
              business_id: businessId,
              name: place.name,
              address: place.vicinity || null,
              google_place_id: place.place_id,
              rating: place.rating || null,
              review_count: place.user_ratings_total || null,
              distance_km: Math.round(distanceKm * 10) / 10,
              price_level: place.price_level || null,
              metadata: {
                types: place.types,
                business_status: place.business_status,
                scanned_at: new Date().toISOString(),
              },
            }, { onConflict: "business_id,google_place_id" });
          }

          competitorsFound = competitors.length;
        }
      }
    } else {
      // No API key - use AI to generate estimated competitors based on location
      const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
      if (LOVABLE_API_KEY && business.address) {
        const prompt = `Given a ${business.category || 'business'} located at "${business.address}" in ${business.country || 'AR'}, generate a JSON array of 5-8 likely nearby competitors. For each, provide: name (realistic local business name), estimated_rating (3.5-4.8), estimated_reviews (10-500), estimated_distance_km (0.2-3.0). Return ONLY the JSON array.`;

        const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${LOVABLE_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-2.5-flash",
            messages: [{ role: "user", content: prompt }],
            temperature: 0.8,
            max_tokens: 1000,
          }),
        });

        if (aiRes.ok) {
          const aiData = await aiRes.json();
          const content = aiData.choices?.[0]?.message?.content || "";
          
          try {
            const jsonMatch = content.match(/\[[\s\S]*\]/);
            if (jsonMatch) {
              const estimated = JSON.parse(jsonMatch[0]);
              for (const comp of estimated) {
                await supabase.from("business_competitors").insert({
                  business_id: businessId,
                  name: comp.name,
                  rating: comp.estimated_rating || comp.rating || null,
                  review_count: comp.estimated_reviews || comp.review_count || null,
                  distance_km: comp.estimated_distance_km || comp.distance_km || null,
                  has_verified_prices: false,
                  metadata: {
                    source: "ai_estimated",
                    scanned_at: new Date().toISOString(),
                  },
                });
              }
              competitorsFound = estimated.length;
            }
          } catch (e) {
            console.error("Error parsing AI competitors:", e);
          }
        }
      }
    }

    console.log(`[scan-competitors] Found ${competitorsFound} competitors for business ${businessId}`);

    return new Response(
      JSON.stringify({ success: true, competitorsFound }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("scan-competitors error:", error);
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

// Haversine formula
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}
