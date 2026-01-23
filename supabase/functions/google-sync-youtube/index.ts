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

    // Get the Google integration (YouTube uses same OAuth)
    const { data: integration, error: intError } = await supabase
      .from("business_integrations")
      .select("*")
      .eq("business_id", businessId)
      .eq("integration_type", "google_reviews")
      .single();

    if (intError || !integration) {
      return new Response(
        JSON.stringify({ error: "Google account not connected. Connect Google Reviews first." }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const credentials = integration.credentials as {
      access_token: string;
      refresh_token: string;
      expires_at: number;
    };

    // Refresh token if needed
    let accessToken = credentials.access_token;
    if (Date.now() > credentials.expires_at) {
      accessToken = await refreshAccessToken(credentials.refresh_token, supabase, integration.id);
    }

    console.log("Fetching YouTube channel data...");

    // Get user's YouTube channel
    const channelResponse = await fetch(
      "https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics,brandingSettings&mine=true",
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    if (!channelResponse.ok) {
      const errorText = await channelResponse.text();
      console.error("Failed to fetch YouTube channel:", channelResponse.status, errorText);
      
      // Check if user has no YouTube channel
      if (channelResponse.status === 404 || errorText.includes("channelNotFound")) {
        return new Response(
          JSON.stringify({ 
            error: "No YouTube channel found",
            note: "This Google account doesn't have a YouTube channel associated."
          }),
          { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ 
          error: "Failed to fetch YouTube data",
          details: errorText
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const channelData = await channelResponse.json();
    const channel = channelData.items?.[0];

    if (!channel) {
      return new Response(
        JSON.stringify({ error: "No YouTube channel found for this account" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("YouTube channel found:", channel.snippet?.title);

    // Extract channel statistics
    const stats = channel.statistics || {};
    const snippet = channel.snippet || {};

    const youtubeData = {
      channel_id: channel.id,
      channel_title: snippet.title,
      channel_description: snippet.description,
      thumbnail_url: snippet.thumbnails?.default?.url,
      subscriber_count: parseInt(stats.subscriberCount) || 0,
      video_count: parseInt(stats.videoCount) || 0,
      view_count: parseInt(stats.viewCount) || 0,
      hidden_subscriber_count: stats.hiddenSubscriberCount || false,
    };

    // Fetch recent videos for engagement metrics
    const videosResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channel.id}&maxResults=10&order=date&type=video`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    let recentVideos: any[] = [];
    let totalRecentViews = 0;
    let totalRecentLikes = 0;
    let totalRecentComments = 0;

    if (videosResponse.ok) {
      const videosData = await videosResponse.json();
      const videoIds = videosData.items?.map((v: any) => v.id.videoId).filter(Boolean).join(",");

      if (videoIds) {
        // Get video statistics
        const videoStatsResponse = await fetch(
          `https://www.googleapis.com/youtube/v3/videos?part=statistics,snippet&id=${videoIds}`,
          {
            headers: { Authorization: `Bearer ${accessToken}` },
          }
        );

        if (videoStatsResponse.ok) {
          const videoStatsData = await videoStatsResponse.json();
          recentVideos = (videoStatsData.items || []).map((video: any) => {
            const vStats = video.statistics || {};
            totalRecentViews += parseInt(vStats.viewCount) || 0;
            totalRecentLikes += parseInt(vStats.likeCount) || 0;
            totalRecentComments += parseInt(vStats.commentCount) || 0;

            return {
              video_id: video.id,
              title: video.snippet?.title,
              published_at: video.snippet?.publishedAt,
              view_count: parseInt(vStats.viewCount) || 0,
              like_count: parseInt(vStats.likeCount) || 0,
              comment_count: parseInt(vStats.commentCount) || 0,
            };
          });
        }
      }
    }

    // Calculate engagement rate (likes + comments / views * 100)
    const engagementRate = totalRecentViews > 0 
      ? (((totalRecentLikes + totalRecentComments) / totalRecentViews) * 100).toFixed(2)
      : "0.00";

    // Upsert YouTube integration
    const { error: upsertError } = await supabase
      .from("business_integrations")
      .upsert({
        business_id: businessId,
        integration_type: "youtube",
        status: "connected",
        last_sync_at: new Date().toISOString(),
        metadata: {
          ...youtubeData,
          recent_videos: recentVideos.slice(0, 5),
          engagement_rate: engagementRate,
          total_recent_views: totalRecentViews,
          total_recent_likes: totalRecentLikes,
          total_recent_comments: totalRecentComments,
          last_sync_status: "success",
        },
        credentials: credentials, // Share credentials with Google Reviews
      }, {
        onConflict: "business_id,integration_type"
      });

    if (upsertError) {
      console.error("Error upserting YouTube integration:", upsertError);
    }

    // Record signal for brain processing
    await supabase.from("signals").insert({
      business_id: businessId,
      signal_type: "youtube_sync",
      payload: {
        subscribers: youtubeData.subscriber_count,
        videos: youtubeData.video_count,
        totalViews: youtubeData.view_count,
        engagementRate,
      },
    });

    console.log(`YouTube sync complete for business ${businessId}`);

    return new Response(
      JSON.stringify({ 
        success: true,
        channel: youtubeData.channel_title,
        subscribers: formatNumber(youtubeData.subscriber_count),
        videos: youtubeData.video_count,
        totalViews: formatNumber(youtubeData.view_count),
        engagementRate: `${engagementRate}%`,
        recentVideosAnalyzed: recentVideos.length,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error syncing YouTube:", error);
    return new Response(
      JSON.stringify({ error: "Failed to sync YouTube", details: String(error) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

function formatNumber(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
}

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

  await supabase
    .from("business_integrations")
    .update({
      credentials: {
        access_token: tokens.access_token,
        refresh_token: refreshToken,
        expires_at: Date.now() + (tokens.expires_in * 1000),
        token_type: tokens.token_type,
      },
    })
    .eq("id", integrationId);

  return tokens.access_token;
}
