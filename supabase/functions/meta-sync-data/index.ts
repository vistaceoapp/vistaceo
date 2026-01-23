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
    const { businessId, platform } = await req.json();

    if (!businessId) {
      return new Response(
        JSON.stringify({ error: "businessId is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Get integration credentials
    const { data: integrations, error: intError } = await supabase
      .from("business_integrations")
      .select("*")
      .eq("business_id", businessId)
      .in("integration_type", ["facebook", "instagram"]);

    if (intError || !integrations?.length) {
      return new Response(
        JSON.stringify({ error: "No Meta integrations found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const results: Record<string, any> = {};

    for (const integration of integrations) {
      // Skip if not the requested platform (or sync all if no platform specified)
      if (platform && integration.integration_type !== platform) continue;

      const credentials = integration.credentials as Record<string, any>;
      const accessToken = credentials?.page_access_token || credentials?.access_token;
      
      if (!accessToken) {
        console.log(`No access token for ${integration.integration_type}`);
        continue;
      }

      if (integration.integration_type === "facebook") {
        const pageId = credentials.page_id;
        
        // Sync Facebook data
        try {
          // Get updated page info
          const pageResponse = await fetch(
            `https://graph.facebook.com/v18.0/${pageId}?fields=fan_count,followers_count,rating_count,overall_star_rating,talking_about_count&access_token=${accessToken}`
          );
          const pageData = await pageResponse.json();

          // Get recent posts
          const postsResponse = await fetch(
            `https://graph.facebook.com/v18.0/${pageId}/posts?fields=id,message,created_time,shares,likes.summary(true),comments.summary(true)&limit=25&access_token=${accessToken}`
          );
          const postsData = await postsResponse.json();
          const posts = postsData.data || [];

          // Get recent ratings
          const ratingsResponse = await fetch(
            `https://graph.facebook.com/v18.0/${pageId}/ratings?fields=created_time,rating,reviewer,review_text,recommendation_type&limit=50&access_token=${accessToken}`
          );
          const ratingsData = await ratingsResponse.json();

          // Calculate engagement
          let totalLikes = 0, totalComments = 0, totalShares = 0;
          posts.forEach((post: any) => {
            totalLikes += post.likes?.summary?.total_count || 0;
            totalComments += post.comments?.summary?.total_count || 0;
            totalShares += post.shares?.count || 0;
          });

          // Update integration metadata
          const currentMeta = integration.metadata as Record<string, any> || {};
          const newMetadata = {
            ...currentMeta,
            fan_count: pageData.fan_count || currentMeta.fan_count,
            followers_count: pageData.followers_count || currentMeta.followers_count,
            talking_about_count: pageData.talking_about_count || currentMeta.talking_about_count,
            rating_count: pageData.rating_count || currentMeta.rating_count,
            overall_star_rating: pageData.overall_star_rating || currentMeta.overall_star_rating,
            recent_reviews: ratingsData.data?.slice(0, 10) || currentMeta.recent_reviews,
            total_posts_analyzed: posts.length,
            total_likes: totalLikes,
            total_comments: totalComments,
            total_shares: totalShares,
            avg_engagement_per_post: posts.length > 0 
              ? ((totalLikes + totalComments + totalShares) / posts.length).toFixed(1)
              : "0",
            last_sync_at: new Date().toISOString(),
          };

          await supabase
            .from("business_integrations")
            .update({ 
              metadata: newMetadata,
              last_sync_at: new Date().toISOString(),
            })
            .eq("id", integration.id);

          results.facebook = {
            success: true,
            followers: pageData.followers_count,
            rating: pageData.overall_star_rating,
            posts_analyzed: posts.length,
            reviews: ratingsData.data?.length || 0,
          };

          console.log("Facebook sync complete:", results.facebook);
        } catch (e) {
          console.error("Facebook sync error:", e);
          results.facebook = { success: false, error: String(e) };
        }
      }

      if (integration.integration_type === "instagram") {
        const igAccountId = credentials.instagram_account_id;
        
        try {
          // Get updated profile
          const profileResponse = await fetch(
            `https://graph.facebook.com/v18.0/${igAccountId}?fields=followers_count,follows_count,media_count&access_token=${accessToken}`
          );
          const profileData = await profileResponse.json();

          // Get recent media
          const mediaResponse = await fetch(
            `https://graph.facebook.com/v18.0/${igAccountId}/media?fields=id,caption,media_type,like_count,comments_count,timestamp,permalink&limit=25&access_token=${accessToken}`
          );
          const mediaData = await mediaResponse.json();
          const media = mediaData.data || [];

          // Calculate engagement
          let totalLikes = 0, totalComments = 0;
          media.forEach((post: any) => {
            totalLikes += post.like_count || 0;
            totalComments += post.comments_count || 0;
          });

          const engagementRate = profileData.followers_count > 0 && media.length > 0
            ? (((totalLikes + totalComments) / media.length) / profileData.followers_count * 100).toFixed(2)
            : "0";

          // Get insights if available
          let insights: any = null;
          try {
            const insightsResponse = await fetch(
              `https://graph.facebook.com/v18.0/${igAccountId}/insights?metric=impressions,reach,profile_views&period=day&access_token=${accessToken}`
            );
            insights = await insightsResponse.json();
          } catch (e) {
            console.log("Could not fetch IG insights");
          }

          // Update integration metadata
          const currentMeta = integration.metadata as Record<string, any> || {};
          const newMetadata = {
            ...currentMeta,
            followers_count: profileData.followers_count || currentMeta.followers_count,
            follows_count: profileData.follows_count || currentMeta.follows_count,
            media_count: profileData.media_count || currentMeta.media_count,
            total_posts_analyzed: media.length,
            total_likes: totalLikes,
            total_comments: totalComments,
            engagement_rate: engagementRate + "%",
            avg_likes_per_post: media.length > 0 ? (totalLikes / media.length).toFixed(0) : 0,
            avg_comments_per_post: media.length > 0 ? (totalComments / media.length).toFixed(0) : 0,
            recent_posts: media.slice(0, 10).map((p: any) => ({
              id: p.id,
              caption: p.caption?.substring(0, 200),
              type: p.media_type,
              likes: p.like_count,
              comments: p.comments_count,
              timestamp: p.timestamp,
              permalink: p.permalink,
            })),
            insights: insights?.data || currentMeta.insights,
            last_sync_at: new Date().toISOString(),
          };

          await supabase
            .from("business_integrations")
            .update({ 
              metadata: newMetadata,
              last_sync_at: new Date().toISOString(),
            })
            .eq("id", integration.id);

          results.instagram = {
            success: true,
            followers: profileData.followers_count,
            media_count: profileData.media_count,
            engagement_rate: engagementRate + "%",
            posts_analyzed: media.length,
          };

          console.log("Instagram sync complete:", results.instagram);
        } catch (e) {
          console.error("Instagram sync error:", e);
          results.instagram = { success: false, error: String(e) };
        }
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        results,
        synced_at: new Date().toISOString(),
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error syncing Meta data:", error);
    return new Response(
      JSON.stringify({ error: "Failed to sync Meta data" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
