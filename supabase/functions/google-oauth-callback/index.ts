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

  const SITE_URL = Deno.env.get("SITE_URL") || "https://vistaceo.lovable.app";

  try {
    const url = new URL(req.url);
    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state");
    const oauthError = url.searchParams.get("error");

    console.log("OAuth callback hit", {
      hasCode: Boolean(code),
      hasState: Boolean(state),
      error: oauthError,
    });

    if (oauthError) {
      console.error("OAuth error from Google:", oauthError);
      return new Response(null, {
        status: 302,
        headers: { Location: `${SITE_URL}/app/more?oauth=success_gbp&provider=google&error=${oauthError}` },
      });
    }

    if (!code || !state) {
      return new Response(null, {
        status: 302,
        headers: { Location: `${SITE_URL}/app/more?oauth=error&provider=google&reason=missing_params` },
      });
    }

    let stateData;
    try {
      stateData = JSON.parse(atob(state));
    } catch {
      return new Response(null, {
        status: 302,
        headers: { Location: `${SITE_URL}/app/more?oauth=error&provider=google` },
      });
    }

    const { businessId, userId } = stateData;
    console.log("Processing OAuth for business:", businessId);

    const GOOGLE_CLIENT_ID = Deno.env.get("GOOGLE_CLIENT_ID");
    const GOOGLE_CLIENT_SECRET = Deno.env.get("GOOGLE_CLIENT_SECRET");
    const REDIRECT_URI = `${Deno.env.get("SUPABASE_URL")}/functions/v1/google-oauth-callback`;

    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: GOOGLE_CLIENT_ID!,
        client_secret: GOOGLE_CLIENT_SECRET!,
        redirect_uri: REDIRECT_URI,
        grant_type: "authorization_code",
      }),
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error("Token exchange failed:", errorText);
      return new Response(null, {
        status: 302,
        headers: { Location: `${SITE_URL}/app/more?oauth=error&provider=google&reason=token_exchange` },
      });
    }

    const tokens = await tokenResponse.json();
    console.log("Tokens received successfully");

    // Get user info
    const userInfoResponse = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });

    let accountEmail = null;
    if (userInfoResponse.ok) {
      const userInfo = await userInfoResponse.json();
      accountEmail = userInfo.email;
      console.log("Connected Google account:", accountEmail);
    }

    // Fetch GBP locations to auto-detect
    let locations: any[] = [];
    try {
      const accountsRes = await fetch(
        "https://mybusinessaccountmanagement.googleapis.com/v1/accounts",
        { headers: { Authorization: `Bearer ${tokens.access_token}` } }
      );
      if (accountsRes.ok) {
        const accountsData = await accountsRes.json();
        const accounts = accountsData.accounts || [];
        console.log("GBP accounts found:", accounts.length);
        
        for (const account of accounts.slice(0, 3)) {
          try {
            const locsRes = await fetch(
              `https://mybusinessbusinessinformation.googleapis.com/v1/${account.name}/locations?readMask=name,title,storefrontAddress`,
              { headers: { Authorization: `Bearer ${tokens.access_token}` } }
            );
            if (locsRes.ok) {
              const locsData = await locsRes.json();
              if (locsData.locations) {
                locations.push(...locsData.locations.map((l: any) => ({
                  id: l.name,
                  name: l.title,
                  address: l.storefrontAddress?.addressLines?.join(", ") || "",
                })));
              }
            }
          } catch (e) {
            console.warn("Could not fetch locations for account:", account.name, e);
          }
        }
      }
    } catch (e) {
      console.warn("Could not fetch GBP accounts:", e);
    }

    // Store credentials
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const credentials = {
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      expires_at: Date.now() + (tokens.expires_in * 1000),
      token_type: tokens.token_type,
      scope: tokens.scope,
    };

    const metadata: Record<string, any> = {
      account_email: accountEmail,
      connected_at: new Date().toISOString(),
      connected_by: userId,
      gbp_locations: locations,
      has_gbp_access: locations.length > 0,
    };

    // Auto-select location if only one
    if (locations.length === 1) {
      metadata.google_location_id = locations[0].id;
      metadata.google_location_name = locations[0].name;
    }

    const { data: existingIntegration } = await supabase
      .from("business_integrations")
      .select("id")
      .eq("business_id", businessId)
      .eq("integration_type", "google_reviews")
      .single();

    if (existingIntegration) {
      await supabase
        .from("business_integrations")
        .update({ credentials, metadata, status: "connected", updated_at: new Date().toISOString() })
        .eq("id", existingIntegration.id);
    } else {
      await supabase
        .from("business_integrations")
        .insert({
          business_id: businessId,
          integration_type: "google_reviews",
          credentials,
          metadata,
          status: "connected",
        });
    }

    // Update brain with GBP connection info
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
          account_email: accountEmail,
          locations_count: locations.length,
          connected_at: new Date().toISOString(),
          has_full_review_access: true,
        };
        
        await supabase
          .from("business_brains")
          .update({ factual_memory: factual, updated_at: new Date().toISOString() })
          .eq("business_id", businessId);
      }
    } catch (e) {
      console.warn("Could not update brain:", e);
    }

    console.log("Integration saved successfully, locations:", locations.length);

    // If location auto-selected, trigger initial review sync
    if (locations.length === 1) {
      try {
        await supabase.functions.invoke("google-sync-reviews", {
          body: { businessId }
        });
        console.log("Triggered initial review sync");
      } catch (e) {
        console.warn("Could not trigger initial sync:", e);
      }
    }

    const needsLocationSelection = locations.length > 1;
    return new Response(null, {
      status: 302,
      headers: {
        Location: `${SITE_URL}/app/more?oauth=success_gbp&provider=google${needsLocationSelection ? "&select_location=true" : ""}`,
      },
    });

  } catch (error) {
    console.error("OAuth callback error:", error);
    const SITE_URL_FALLBACK = Deno.env.get("SITE_URL") || "https://vistaceo.lovable.app";
    return new Response(null, {
      status: 302,
      headers: { Location: `${SITE_URL_FALLBACK}/app/more?oauth=error&provider=google` },
    });
  }
});
