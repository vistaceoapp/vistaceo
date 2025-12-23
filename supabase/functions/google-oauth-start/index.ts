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

    const GOOGLE_CLIENT_ID = Deno.env.get("GOOGLE_CLIENT_ID");
    const REDIRECT_URI = `${Deno.env.get("SUPABASE_URL")}/functions/v1/google-oauth-callback`;

    if (!GOOGLE_CLIENT_ID) {
      console.error("GOOGLE_CLIENT_ID not configured");
      return new Response(
        JSON.stringify({ error: "Google OAuth not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create state with business and user info
    const state = btoa(JSON.stringify({ businessId, userId }));

    // Google Business Profile API scopes
    const scopes = [
      "https://www.googleapis.com/auth/userinfo.email",
      "https://www.googleapis.com/auth/userinfo.profile",
      "https://www.googleapis.com/auth/business.manage", // For Google Business Profile
    ];

    const authUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
    authUrl.searchParams.set("client_id", GOOGLE_CLIENT_ID);
    authUrl.searchParams.set("redirect_uri", REDIRECT_URI);
    authUrl.searchParams.set("response_type", "code");
    authUrl.searchParams.set("scope", scopes.join(" "));
    authUrl.searchParams.set("state", state);
    authUrl.searchParams.set("access_type", "offline"); // Get refresh token
    authUrl.searchParams.set("prompt", "consent"); // Force consent to get refresh token

    console.log("Generated OAuth URL for business:", businessId);

    return new Response(
      JSON.stringify({ url: authUrl.toString() }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error generating OAuth URL:", error);
    return new Response(
      JSON.stringify({ error: "Failed to generate OAuth URL" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
