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
    return Response.redirect(`${APP_URL}/app/analytics?oauth=error&provider=meta&reason=${error}`);
  }

  if (!code || !state) {
    return Response.redirect(`${APP_URL}/app/analytics?oauth=error&provider=meta&reason=missing_params`);
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
      return Response.redirect(`${APP_URL}/app/analytics?oauth=error&provider=meta&reason=token_error`);
    }

    const accessToken = tokenData.access_token;

    // Get long-lived access token (60 days)
    const longLivedUrl = new URL("https://graph.facebook.com/v18.0/oauth/access_token");
    longLivedUrl.searchParams.set("grant_type", "fb_exchange_token");
    longLivedUrl.searchParams.set("client_id", META_APP_ID!);
    longLivedUrl.searchParams.set("client_secret", META_APP_SECRET!);
    longLivedUrl.searchParams.set("fb_exchange_token", accessToken);

    const longLivedResponse = await fetch(longLivedUrl.toString());
    const longLivedData = await longLivedResponse.json();
    
    const longLivedToken = longLivedData.access_token || accessToken;
    const tokenExpiresAt = new Date(Date.now() + (longLivedData.expires_in || 5184000) * 1000).toISOString();

    // Get user info
    const userResponse = await fetch(
      `https://graph.facebook.com/v18.0/me?fields=id,name,email&access_token=${longLivedToken}`
    );
    const userData = await userResponse.json();
    console.log("User data:", userData.name);

    // Get Facebook Pages with Instagram Business Account
    const pagesResponse = await fetch(
      `https://graph.facebook.com/v18.0/me/accounts?fields=id,name,access_token,instagram_business_account,category,fan_count,followers_count,rating_count,overall_star_rating,talking_about_count,picture&access_token=${longLivedToken}`
    );
    const pagesData = await pagesResponse.json();
    console.log("Pages found:", pagesData.data?.length || 0);

    // Initialize Supabase
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    let facebookConnected = false;
    let instagramConnected = false;

    // Process pages
    if (pagesData.data && pagesData.data.length > 0) {
      const page = pagesData.data[0]; // Use first page
      
      // =====================
      // FACEBOOK PAGE DATA
      // =====================
      
      // Get page posts with engagement
      let recentPosts: any[] = [];
      try {
        const postsResponse = await fetch(
          `https://graph.facebook.com/v18.0/${page.id}/posts?fields=id,message,created_time,shares,likes.summary(true),comments.summary(true),reactions.summary(true)&limit=25&access_token=${page.access_token}`
        );
        const postsData = await postsResponse.json();
        recentPosts = postsData.data || [];
        console.log("Facebook posts fetched:", recentPosts.length);
      } catch (e) {
        console.log("Could not fetch posts:", e);
      }

      // Get page ratings/reviews
      let pageRatings: any = null;
      try {
        const ratingsResponse = await fetch(
          `https://graph.facebook.com/v18.0/${page.id}/ratings?fields=created_time,rating,reviewer,review_text,recommendation_type&limit=50&access_token=${page.access_token}`
        );
        pageRatings = await ratingsResponse.json();
        console.log("Facebook ratings fetched:", pageRatings.data?.length || 0);
      } catch (e) {
        console.log("Could not fetch ratings:", e);
      }

      // Calculate Facebook engagement metrics
      let totalLikes = 0;
      let totalComments = 0;
      let totalShares = 0;
      let totalReactions = 0;
      
      recentPosts.forEach((post: any) => {
        totalLikes += post.likes?.summary?.total_count || 0;
        totalComments += post.comments?.summary?.total_count || 0;
        totalShares += post.shares?.count || 0;
        totalReactions += post.reactions?.summary?.total_count || 0;
      });

      const avgEngagement = recentPosts.length > 0 
        ? ((totalLikes + totalComments + totalShares) / recentPosts.length).toFixed(1)
        : "0";

      // Store Facebook integration
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
            expires_at: tokenExpiresAt,
          },
          metadata: {
            // Profile info
            user_name: userData.name,
            user_email: userData.email,
            page_name: page.name,
            page_id: page.id,
            page_category: page.category,
            page_picture: page.picture?.data?.url,
            
            // Followers & fans
            fan_count: page.fan_count || 0,
            followers_count: page.followers_count || 0,
            talking_about_count: page.talking_about_count || 0,
            
            // Ratings
            rating_count: page.rating_count || 0,
            overall_star_rating: page.overall_star_rating || null,
            recent_reviews: pageRatings?.data?.slice(0, 10) || [],
            
            // Engagement metrics
            total_posts_analyzed: recentPosts.length,
            total_likes: totalLikes,
            total_comments: totalComments,
            total_shares: totalShares,
            total_reactions: totalReactions,
            avg_engagement_per_post: avgEngagement,
            
            // Timestamps
            connected_at: new Date().toISOString(),
            last_sync_at: new Date().toISOString(),
          },
          last_sync_at: new Date().toISOString(),
        }, { onConflict: "business_id,integration_type" });

      facebookConnected = true;
      console.log("Facebook integration saved with metrics");

      // =====================
      // INSTAGRAM BUSINESS DATA
      // =====================
      
      if (page.instagram_business_account) {
        const igAccountId = page.instagram_business_account.id;
        
        // Get basic Instagram profile
        const igProfileResponse = await fetch(
          `https://graph.facebook.com/v18.0/${igAccountId}?fields=id,username,name,biography,followers_count,follows_count,media_count,profile_picture_url,website&access_token=${page.access_token}`
        );
        const igProfile = await igProfileResponse.json();
        console.log("Instagram profile:", igProfile.username);

        // Get Instagram media with engagement
        let igMedia: any[] = [];
        try {
          const mediaResponse = await fetch(
            `https://graph.facebook.com/v18.0/${igAccountId}/media?fields=id,caption,media_type,media_url,thumbnail_url,permalink,timestamp,like_count,comments_count&limit=25&access_token=${page.access_token}`
          );
          const mediaData = await mediaResponse.json();
          igMedia = mediaData.data || [];
          console.log("Instagram media fetched:", igMedia.length);
        } catch (e) {
          console.log("Could not fetch IG media:", e);
        }

        // Get Instagram insights (if available)
        let igInsights: any = null;
        try {
          const insightsResponse = await fetch(
            `https://graph.facebook.com/v18.0/${igAccountId}/insights?metric=impressions,reach,profile_views&period=day&access_token=${page.access_token}`
          );
          igInsights = await insightsResponse.json();
          console.log("Instagram insights fetched");
        } catch (e) {
          console.log("Could not fetch IG insights:", e);
        }

        // Calculate Instagram engagement
        let igTotalLikes = 0;
        let igTotalComments = 0;
        
        igMedia.forEach((post: any) => {
          igTotalLikes += post.like_count || 0;
          igTotalComments += post.comments_count || 0;
        });

        const igEngagementRate = igProfile.followers_count > 0 && igMedia.length > 0
          ? (((igTotalLikes + igTotalComments) / igMedia.length) / igProfile.followers_count * 100).toFixed(2)
          : "0";

        // Store Instagram integration
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
              expires_at: tokenExpiresAt,
            },
            metadata: {
              // Profile info
              username: igProfile.username,
              name: igProfile.name,
              biography: igProfile.biography,
              website: igProfile.website,
              profile_picture_url: igProfile.profile_picture_url,
              
              // Followers
              followers_count: igProfile.followers_count || 0,
              follows_count: igProfile.follows_count || 0,
              media_count: igProfile.media_count || 0,
              
              // Engagement metrics
              total_posts_analyzed: igMedia.length,
              total_likes: igTotalLikes,
              total_comments: igTotalComments,
              engagement_rate: igEngagementRate + "%",
              avg_likes_per_post: igMedia.length > 0 ? (igTotalLikes / igMedia.length).toFixed(0) : 0,
              avg_comments_per_post: igMedia.length > 0 ? (igTotalComments / igMedia.length).toFixed(0) : 0,
              
              // Recent posts (for analysis)
              recent_posts: igMedia.slice(0, 10).map((p: any) => ({
                id: p.id,
                caption: p.caption?.substring(0, 200),
                type: p.media_type,
                likes: p.like_count,
                comments: p.comments_count,
                timestamp: p.timestamp,
                permalink: p.permalink,
              })),
              
              // Insights (if available)
              insights: igInsights?.data || null,
              
              // Timestamps
              connected_at: new Date().toISOString(),
              last_sync_at: new Date().toISOString(),
            },
            last_sync_at: new Date().toISOString(),
          }, { onConflict: "business_id,integration_type" });

        instagramConnected = true;
        console.log("Instagram integration saved with metrics");
      }
    }

    const connectedPlatforms = [
      facebookConnected ? "facebook" : null,
      instagramConnected ? "instagram" : null,
    ].filter(Boolean).join(",");

    console.log("Meta OAuth successful for business:", businessId, "connected:", connectedPlatforms);

    return Response.redirect(`${APP_URL}/app/analytics?oauth=success&provider=meta&connected=${connectedPlatforms}`);

  } catch (error) {
    console.error("Error in Meta OAuth callback:", error);
    return Response.redirect(`${APP_URL}/app/analytics?oauth=error&provider=meta&reason=callback_error`);
  }
});
