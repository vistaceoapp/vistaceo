import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Map business types to Google Place types
const BUSINESS_TYPE_MAP: Record<string, string[]> = {
  restaurant: ["restaurant"],
  cafeteria: ["cafe", "coffee_shop"],
  bar: ["bar", "night_club"],
  fast_casual: ["restaurant", "meal_takeaway"],
  heladeria: ["food", "cafe"],
  panaderia: ["bakery"],
  dark_kitchen: ["restaurant", "meal_delivery"],
  food_truck: ["restaurant", "meal_takeaway"],
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { lat, lng, radius = 1000, businessType, excludePlaceId } = await req.json();

    if (!lat || !lng) {
      return new Response(
        JSON.stringify({ error: "lat and lng are required", competitors: [] }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const GOOGLE_PLACES_API_KEY = Deno.env.get("GOOGLE_PLACES_API_KEY");
    
    if (!GOOGLE_PLACES_API_KEY) {
      console.error("GOOGLE_PLACES_API_KEY not configured");
      return new Response(
        JSON.stringify({ error: "Google Places API not configured", competitors: [] }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get place type for search
    const placeTypes = BUSINESS_TYPE_MAP[businessType] || ["restaurant", "cafe", "bar"];
    const primaryType = placeTypes[0];

    // Nearby search
    const url = new URL("https://maps.googleapis.com/maps/api/place/nearbysearch/json");
    url.searchParams.set("location", `${lat},${lng}`);
    url.searchParams.set("radius", String(Math.min(radius, 5000))); // Max 5km
    url.searchParams.set("type", primaryType);
    url.searchParams.set("key", GOOGLE_PLACES_API_KEY);

    console.log("Searching competitors near:", lat, lng, "type:", primaryType, "radius:", radius);

    const response = await fetch(url.toString());
    const data = await response.json();

    if (data.status !== "OK" && data.status !== "ZERO_RESULTS") {
      console.error("Google Nearby Search error:", data.status, data.error_message);
      return new Response(
        JSON.stringify({ competitors: [], error: data.error_message }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Filter and map results
    let competitors = (data.results || [])
      .filter((p: any) => p.place_id !== excludePlaceId) // Exclude own business
      .slice(0, 10) // Max 10 competitors
      .map((p: any) => {
        // Calculate distance
        const R = 6371; // Earth radius in km
        const dLat = (p.geometry.location.lat - lat) * Math.PI / 180;
        const dLon = (p.geometry.location.lng - lng) * Math.PI / 180;
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                  Math.cos(lat * Math.PI / 180) * Math.cos(p.geometry.location.lat * Math.PI / 180) *
                  Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        const distance = R * c;

        return {
          placeId: p.place_id,
          name: p.name,
          address: p.vicinity,
          rating: p.rating || null,
          reviewCount: p.user_ratings_total || 0,
          priceLevel: p.price_level || null,
          distanceKm: Math.round(distance * 100) / 100,
          types: p.types || [],
          isOpen: p.opening_hours?.open_now,
        };
      })
      .sort((a: any, b: any) => a.distanceKm - b.distanceKm);

    console.log(`Found ${competitors.length} competitors`);

    return new Response(
      JSON.stringify({ competitors }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error searching competitors:", error);
    return new Response(
      JSON.stringify({ error: "Failed to search competitors", competitors: [] }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
