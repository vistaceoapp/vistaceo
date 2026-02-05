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

    // Get user from auth header
    const authHeader = req.headers.get("Authorization");
    let userId: string | null = null;

    if (authHeader) {
      const token = authHeader.replace("Bearer ", "");
      const { data: { user } } = await supabase.auth.getUser(token);
      userId = user?.id || null;
    }

    const body = await req.json();
    const {
      event_type,
      event_data = {},
      page_path,
      session_id,
      business_id,
    } = body;

    // Get IP and user agent
    const ipAddress = req.headers.get("x-forwarded-for")?.split(",")[0] || 
                      req.headers.get("cf-connecting-ip") || 
                      "unknown";
    const userAgent = req.headers.get("user-agent") || "unknown";

    // Insert activity log
    const { error } = await supabase.from("user_activity_logs").insert({
      user_id: userId,
      business_id,
      event_type,
      event_data,
      page_path,
      session_id,
      ip_address: ipAddress,
      user_agent: userAgent,
    });

    if (error) {
      console.error("Error inserting activity:", error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Update daily metrics if user is logged in
    if (userId) {
      const today = new Date().toISOString().split("T")[0];
      
      // Get or create daily metrics
      const { data: existing } = await supabase
        .from("user_daily_metrics")
        .select("*")
        .eq("user_id", userId)
        .eq("metric_date", today)
        .single();

      const updates: Record<string, number> = {};
      
      switch (event_type) {
        case "login":
          updates.logins_count = (existing?.logins_count || 0) + 1;
          // Also update profile last_login
          await supabase.from("profiles").update({
            last_login_at: new Date().toISOString(),
            login_count: (existing?.logins_count || 0) + 1,
          }).eq("id", userId);
          break;
        case "mission_start":
          updates.missions_started = (existing?.missions_started || 0) + 1;
          break;
        case "mission_complete":
          updates.missions_completed = (existing?.missions_completed || 0) + 1;
          break;
        case "chat_message":
          updates.chat_messages_sent = (existing?.chat_messages_sent || 0) + 1;
          break;
        case "radar_view":
          updates.radar_views = (existing?.radar_views || 0) + 1;
          break;
        case "checkin":
          updates.checkins_completed = (existing?.checkins_completed || 0) + 1;
          break;
        case "page_view":
          updates.pages_viewed = (existing?.pages_viewed || 0) + 1;
          break;
        default:
          updates.actions_count = (existing?.actions_count || 0) + 1;
      }

      if (existing) {
        await supabase
          .from("user_daily_metrics")
          .update({ ...updates, updated_at: new Date().toISOString() })
          .eq("id", existing.id);
      } else {
        await supabase.from("user_daily_metrics").insert({
          user_id: userId,
          business_id,
          metric_date: today,
          ...updates,
        });
      }

      // Update last_active_at on profile
      await supabase.from("profiles").update({
        last_active_at: new Date().toISOString(),
      }).eq("id", userId);
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Track user activity error:", error);
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
