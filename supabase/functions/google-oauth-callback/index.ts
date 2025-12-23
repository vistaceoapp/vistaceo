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
    const url = new URL(req.url);
    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state"); // Contains businessId + userId
    const oauthError = url.searchParams.get("error");

    console.log("OAuth callback hit", {
      method: req.method,
      url: req.url,
      hasCode: Boolean(code),
      hasState: Boolean(state),
      error: oauthError,
    });

    if (oauthError) {
      console.error("OAuth error from Google:", oauthError);
      return new Response(null, {
        status: 302,
        headers: {
          Location: `${Deno.env.get("SITE_URL") || "https://preview--uceo-copilot.lovable.app"}/app?oauth=error&provider=google&reason=google_error`,
        },
      });
    }

    if (!code || !state) {
      console.error("Missing code or state", { codePresent: Boolean(code), statePresent: Boolean(state) });
      return new Response(null, {
        status: 302,
        headers: {
          Location: `${Deno.env.get("SITE_URL") || "https://preview--uceo-copilot.lovable.app"}/app?oauth=error&provider=google&reason=missing_params`,
        },
      });
    }

    // Parse state to get businessId and userId
    let stateData;
    try {
      stateData = JSON.parse(atob(state));
    } catch {
      console.error("Invalid state parameter");
      return new Response(null, {
        status: 302,
        headers: {
          Location: `${Deno.env.get("SITE_URL") || "https://preview--uceo-copilot.lovable.app"}/app?oauth=error&provider=google`,
        },
      });
    }

    const { businessId, userId } = stateData;
    console.log("Processing OAuth callback for business:", businessId, "user:", userId);

    // Exchange code for tokens
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
        headers: {
          Location: `${Deno.env.get("SITE_URL") || "https://preview--uceo-copilot.lovable.app"}/app?oauth=error&provider=google`,
        },
      });
    }

    const tokens = await tokenResponse.json();
    console.log("Tokens received successfully");

    // Get user info to verify and get account details
    const userInfoResponse = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });

    let accountEmail = null;
    if (userInfoResponse.ok) {
      const userInfo = await userInfoResponse.json();
      accountEmail = userInfo.email;
      console.log("Connected Google account:", accountEmail);
    }

    // Store the credentials in Supabase
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Check if integration already exists
    const { data: existingIntegration } = await supabase
      .from("business_integrations")
      .select("id")
      .eq("business_id", businessId)
      .eq("integration_type", "google_reviews")
      .single();

    const credentials = {
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      expires_at: Date.now() + (tokens.expires_in * 1000),
      token_type: tokens.token_type,
      scope: tokens.scope,
    };

    const metadata = {
      account_email: accountEmail,
      connected_at: new Date().toISOString(),
      connected_by: userId,
    };

    if (existingIntegration) {
      // Update existing integration
      const { error: updateError } = await supabase
        .from("business_integrations")
        .update({
          credentials,
          metadata,
          status: "connected",
          updated_at: new Date().toISOString(),
        })
        .eq("id", existingIntegration.id);

      if (updateError) {
        console.error("Failed to update integration:", updateError);
        throw updateError;
      }
    } else {
      // Create new integration
      const { error: insertError } = await supabase
        .from("business_integrations")
        .insert({
          business_id: businessId,
          integration_type: "google_reviews",
          credentials,
          metadata,
          status: "connected",
        });

      if (insertError) {
        console.error("Failed to create integration:", insertError);
        throw insertError;
      }
    }

    console.log("Integration saved successfully");

    // Redirect back to app with success
    return new Response(null, {
      status: 302,
      headers: {
        Location: `${Deno.env.get("SITE_URL") || "https://preview--uceo-copilot.lovable.app"}/app?oauth=success&provider=google`,
      },
    });

  } catch (error) {
    console.error("OAuth callback error:", error);
    return new Response(null, {
      status: 302,
      headers: {
        Location: `${Deno.env.get("SITE_URL") || "https://preview--uceo-copilot.lovable.app"}/app?oauth=error&provider=google`,
      },
    });
  }
});
