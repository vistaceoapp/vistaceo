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
    const { businessId, userId, platform } = await req.json();

    if (!businessId || !userId) {
      return new Response(
        JSON.stringify({ error: "businessId and userId are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const META_APP_ID = Deno.env.get("META_APP_ID");
    const META_APP_SECRET = Deno.env.get("META_APP_SECRET");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const REDIRECT_URI = `${SUPABASE_URL}/functions/v1/meta-oauth-callback`;

    if (!META_APP_ID || !META_APP_SECRET) {
      console.error("Meta OAuth not configured - missing META_APP_ID or META_APP_SECRET");
      return new Response(
        JSON.stringify({ 
          error: "Meta OAuth not configured",
          needsSetup: true,
          setupInstructions: [
            "1. Ve a developers.facebook.com y crea una app",
            "2. Agrega los productos: Facebook Login, Instagram Basic Display",
            "3. Configura META_APP_ID y META_APP_SECRET en los secrets del proyecto"
          ]
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create state with business and user info
    const state = btoa(JSON.stringify({ businessId, userId, platform: platform || "instagram" }));

    // Solo scopes básicos que están habilitados en la app de Meta
    // Los avanzados (instagram_business_*, pages_read_user_content) requieren
    // configuración adicional en Meta Developer Console
    const scopes = [
      "public_profile",
      "pages_show_list", 
      "pages_read_engagement",
      "instagram_basic",
    ];

    const authUrl = new URL("https://www.facebook.com/v18.0/dialog/oauth");
    authUrl.searchParams.set("client_id", META_APP_ID);
    authUrl.searchParams.set("redirect_uri", REDIRECT_URI);
    authUrl.searchParams.set("scope", scopes.join(","));
    authUrl.searchParams.set("state", state);
    authUrl.searchParams.set("response_type", "code");

    console.log("Generated Meta OAuth URL for business:", businessId, "platform:", platform, "scopes:", scopes.length);

    return new Response(
      JSON.stringify({ url: authUrl.toString() }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error generating Meta OAuth URL:", error);
    return new Response(
      JSON.stringify({ error: "Failed to generate OAuth URL" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
