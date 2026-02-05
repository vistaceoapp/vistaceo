import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const body = await req.json();
    const {
      visitor_id,
      session_id,
      page_url,
      page_path,
      referrer,
      utm_source,
      utm_medium,
      utm_campaign,
      device_type,
      browser,
      event_type = "pageview",
      event_data = {},
      duration_seconds,
      scroll_depth,
      blog_post_slug,
    } = body;

    // Extract country from headers if available
    const country = req.headers.get("cf-ipcountry") || req.headers.get("x-vercel-ip-country") || null;
    const region = req.headers.get("cf-region") || null;

    // Insert analytics event
    const { error } = await supabase.from("web_analytics").insert({
      visitor_id: visitor_id || `anon_${Date.now()}`,
      session_id: session_id || `sess_${Date.now()}`,
      page_url,
      page_path,
      referrer,
      utm_source,
      utm_medium,
      utm_campaign,
      device_type,
      browser,
      country,
      region,
      event_type,
      event_data,
      duration_seconds,
      scroll_depth,
      blog_post_slug,
    });

    if (error) {
      console.error("Error inserting analytics:", error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // If it's a blog post pageview, also update daily aggregates
    if (blog_post_slug && event_type === "pageview") {
      const today = new Date().toISOString().split("T")[0];
      
      // Upsert daily blog analytics (ignore errors if RPC doesn't exist yet)
      try {
        await supabase.rpc("upsert_blog_daily_analytics", {
          p_post_slug: blog_post_slug,
          p_date: today,
          p_device: device_type || "unknown",
          p_country: country || "unknown",
          p_referrer: referrer || "direct",
        });
      } catch (e) {
        console.log("RPC not available yet:", e);
      }
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Track analytics error:", error);
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
