import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { placeId, sessionToken } = await req.json();

    if (!placeId) {
      return new Response(
        JSON.stringify({ error: "placeId is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const GOOGLE_PLACES_API_KEY = Deno.env.get("GOOGLE_PLACES_API_KEY");
    
    if (!GOOGLE_PLACES_API_KEY) {
      console.error("GOOGLE_PLACES_API_KEY not configured");
      return new Response(
        JSON.stringify({ error: "Google Places API not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch place details
    const url = new URL("https://maps.googleapis.com/maps/api/place/details/json");
    url.searchParams.set("place_id", placeId);
    url.searchParams.set("key", GOOGLE_PLACES_API_KEY);
    url.searchParams.set("fields", "place_id,name,formatted_address,geometry,types,rating,user_ratings_total,price_level,opening_hours,photos,url");
    
    if (sessionToken) {
      url.searchParams.set("sessiontoken", sessionToken);
    }

    console.log("Fetching place details for:", placeId);

    const response = await fetch(url.toString());
    const data = await response.json();

    if (data.status !== "OK") {
      console.error("Google Place Details API error:", data.status, data.error_message);
      return new Response(
        JSON.stringify({ error: data.error_message || "Place not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const place = data.result;

    // Map to our structure
    const details = {
      placeId: place.place_id,
      name: place.name,
      address: place.formatted_address,
      lat: place.geometry?.location?.lat,
      lng: place.geometry?.location?.lng,
      types: place.types || [],
      rating: place.rating,
      reviewCount: place.user_ratings_total,
      priceLevel: place.price_level,
      mapsUrl: place.url,
      isOpen: place.opening_hours?.open_now,
    };

    console.log("Got place details:", details.name);

    return new Response(
      JSON.stringify({ place: details }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error fetching place details:", error);
    return new Response(
      JSON.stringify({ error: "Failed to fetch place details" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
