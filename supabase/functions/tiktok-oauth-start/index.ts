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
    const { businessId, userId } = await req.json();

    if (!businessId || !userId) {
      return new Response(
        JSON.stringify({ error: "businessId and userId are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const TIKTOK_CLIENT_KEY = Deno.env.get("TIKTOK_CLIENT_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const REDIRECT_URI = `${SUPABASE_URL}/functions/v1/tiktok-oauth-callback`;

    if (!TIKTOK_CLIENT_KEY) {
      console.error("TikTok OAuth not configured");
      return new Response(
        JSON.stringify({ 
          error: "TikTok OAuth not configured",
          needsSetup: true,
          setupInstructions: [
            "1. Ve a developers.tiktok.com y crea una app",
            "2. Solicita los scopes: user.info.basic, video.list",
            "3. Configura TIKTOK_CLIENT_KEY y TIKTOK_CLIENT_SECRET en secrets"
          ]
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create state with business and user info
    const state = btoa(JSON.stringify({ businessId, userId }));
    const csrfState = crypto.randomUUID();

    // TikTok Login Kit scopes
    const scopes = [
      "user.info.basic",
      "user.info.profile",
      "user.info.stats",
      "video.list"
    ];

    const authUrl = new URL("https://www.tiktok.com/v2/auth/authorize/");
    authUrl.searchParams.set("client_key", TIKTOK_CLIENT_KEY);
    authUrl.searchParams.set("redirect_uri", REDIRECT_URI);
    authUrl.searchParams.set("scope", scopes.join(","));
    authUrl.searchParams.set("state", state);
    authUrl.searchParams.set("response_type", "code");

    console.log("Generated TikTok OAuth URL for business:", businessId);

    return new Response(
      JSON.stringify({ url: authUrl.toString() }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error generating TikTok OAuth URL:", error);
    return new Response(
      JSON.stringify({ error: "Failed to generate OAuth URL" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
