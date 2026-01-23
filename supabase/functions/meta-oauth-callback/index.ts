import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const error = url.searchParams.get("error");

  // Get base URL for redirects
  const APP_URL = Deno.env.get("APP_URL") || "https://id-preview--1ff7ac2b-f14d-46a6-b810-8f2856f7779d.lovable.app";

  if (error) {
    console.error("OAuth error:", error);
    return Response.redirect(`${APP_URL}/app/more?oauth=error&provider=meta&reason=${error}`);
  }

  if (!code || !state) {
    return Response.redirect(`${APP_URL}/app/more?oauth=error&provider=meta&reason=missing_params`);
  }

  try {
    const stateData = JSON.parse(atob(state));
    const { businessId, userId, platform } = stateData;

    const META_APP_ID = Deno.env.get("META_APP_ID");
    const META_APP_SECRET = Deno.env.get("META_APP_SECRET");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const REDIRECT_URI = `${SUPABASE_URL}/functions/v1/meta-oauth-callback`;

    // Exchange code for access token
    const tokenUrl = new URL("https://graph.facebook.com/v18.0/oauth/access_token");
    tokenUrl.searchParams.set("client_id", META_APP_ID!);
    tokenUrl.searchParams.set("client_secret", META_APP_SECRET!);
    tokenUrl.searchParams.set("redirect_uri", REDIRECT_URI);
    tokenUrl.searchParams.set("code", code);

    const tokenResponse = await fetch(tokenUrl.toString());
    const tokenData = await tokenResponse.json();

    if (tokenData.error) {
      console.error("Token exchange error:", tokenData.error);
      return Response.redirect(`${APP_URL}/app/more?oauth=error&provider=meta&reason=token_error`);
    }

    const accessToken = tokenData.access_token;
    const expiresIn = tokenData.expires_in;

    // Get long-lived access token
    const longLivedUrl = new URL("https://graph.facebook.com/v18.0/oauth/access_token");
    longLivedUrl.searchParams.set("grant_type", "fb_exchange_token");
    longLivedUrl.searchParams.set("client_id", META_APP_ID!);
    longLivedUrl.searchParams.set("client_secret", META_APP_SECRET!);
    longLivedUrl.searchParams.set("fb_exchange_token", accessToken);

    const longLivedResponse = await fetch(longLivedUrl.toString());
    const longLivedData = await longLivedResponse.json();
    
    const longLivedToken = longLivedData.access_token || accessToken;

    // Get user info
    const userResponse = await fetch(
      `https://graph.facebook.com/v18.0/me?fields=id,name,email&access_token=${longLivedToken}`
    );
    const userData = await userResponse.json();

    // Get Facebook Pages
    const pagesResponse = await fetch(
      `https://graph.facebook.com/v18.0/me/accounts?fields=id,name,access_token,instagram_business_account&access_token=${longLivedToken}`
    );
    const pagesData = await pagesResponse.json();

    // Initialize Supabase
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Store Facebook integration
    if (pagesData.data && pagesData.data.length > 0) {
      const page = pagesData.data[0];
      
      await supabase
        .from("business_integrations")
        .upsert({
          business_id: businessId,
          integration_type: "facebook",
          status: "connected",
          credentials: {
            access_token: longLivedToken,
            page_access_token: page.access_token,
            page_id: page.id,
            expires_at: new Date(Date.now() + (longLivedData.expires_in || 5184000) * 1000).toISOString(),
          },
          metadata: {
            account_email: userData.email,
            user_name: userData.name,
            page_name: page.name,
            page_id: page.id,
            connected_at: new Date().toISOString(),
          },
        }, { onConflict: "business_id,integration_type" });

      // Check for Instagram Business Account
      if (page.instagram_business_account) {
        const igAccountId = page.instagram_business_account.id;
        
        // Get Instagram business account details
        const igResponse = await fetch(
          `https://graph.facebook.com/v18.0/${igAccountId}?fields=id,username,name,followers_count,follows_count,media_count,profile_picture_url&access_token=${page.access_token}`
        );
        const igData = await igResponse.json();

        await supabase
          .from("business_integrations")
          .upsert({
            business_id: businessId,
            integration_type: "instagram",
            status: "connected",
            credentials: {
              access_token: page.access_token,
              instagram_account_id: igAccountId,
              page_id: page.id,
            },
            metadata: {
              username: igData.username,
              name: igData.name,
              followers_count: igData.followers_count,
              follows_count: igData.follows_count,
              media_count: igData.media_count,
              profile_picture_url: igData.profile_picture_url,
              connected_at: new Date().toISOString(),
            },
          }, { onConflict: "business_id,integration_type" });
      }
    }

    console.log("Meta OAuth successful for business:", businessId, "platforms: facebook, instagram");

    return Response.redirect(`${APP_URL}/app/analytics?oauth=success&provider=meta`);

  } catch (error) {
    console.error("Error in Meta OAuth callback:", error);
    return Response.redirect(`${APP_URL}/app/more?oauth=error&provider=meta&reason=callback_error`);
  }
});
