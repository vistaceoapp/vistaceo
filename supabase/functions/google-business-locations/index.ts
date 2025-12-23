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

    // Get the integration credentials
    const { data: integration, error: intError } = await supabase
      .from("business_integrations")
      .select("*")
      .eq("business_id", businessId)
      .eq("integration_type", "google_reviews")
      .single();

    if (intError || !integration) {
      console.error("Integration not found:", intError);
      return new Response(
        JSON.stringify({ error: "Google Reviews not connected. Please connect first." }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const credentials = integration.credentials as {
      access_token: string;
      refresh_token: string;
      expires_at: number;
    };

    // Check if token needs refresh
    let accessToken = credentials.access_token;
    if (Date.now() > credentials.expires_at) {
      console.log("Token expired, refreshing...");
      accessToken = await refreshAccessToken(credentials.refresh_token, supabase, integration.id);
    }

    // Fetch Google Business Profile accounts
    console.log("Fetching Google Business accounts...");
    const accountsResponse = await fetch(
      "https://mybusinessaccountmanagement.googleapis.com/v1/accounts",
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    if (!accountsResponse.ok) {
      const errorText = await accountsResponse.text();
      console.error("Failed to fetch accounts:", accountsResponse.status, errorText);
      return new Response(
        JSON.stringify({ 
          error: "Failed to fetch Google Business accounts",
          details: errorText,
          status: accountsResponse.status
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const accountsData = await accountsResponse.json();
    console.log("Accounts found:", accountsData);

    if (!accountsData.accounts || accountsData.accounts.length === 0) {
      return new Response(
        JSON.stringify({ 
          error: "No Google Business accounts found",
          message: "Make sure you're logged in with the Google account that manages your business."
        }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // For each account, fetch locations
    const allLocations: any[] = [];
    for (const account of accountsData.accounts) {
      console.log("Fetching locations for account:", account.name);
      
      const locationsResponse = await fetch(
        `https://mybusinessbusinessinformation.googleapis.com/v1/${account.name}/locations?readMask=name,title,storefrontAddress`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );

      if (locationsResponse.ok) {
        const locationsData = await locationsResponse.json();
        console.log("Locations found:", locationsData);
        
        if (locationsData.locations) {
          for (const location of locationsData.locations) {
            allLocations.push({
              id: location.name,
              name: location.title,
              address: location.storefrontAddress?.addressLines?.join(", ") || "",
              accountId: account.name,
              accountName: account.accountName,
            });
          }
        }
      } else {
        console.error("Failed to fetch locations for account:", account.name);
      }
    }

    console.log("Total locations found:", allLocations.length);

    return new Response(
      JSON.stringify({ locations: allLocations }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error fetching business locations:", error);
    return new Response(
      JSON.stringify({ error: "Failed to fetch business locations", details: String(error) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

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

  // Update stored credentials
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
