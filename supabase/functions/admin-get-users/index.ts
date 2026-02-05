import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const ADMIN_EMAILS = ["info@vistaceo.com", "lickevinmerdinian@gmail.com"];

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Verify admin
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user } } = await supabase.auth.getUser(token);
    
    if (!user || !ADMIN_EMAILS.includes(user.email || "")) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = parseInt(url.searchParams.get("limit") || "50");
    const search = url.searchParams.get("search") || "";
    const filter = url.searchParams.get("filter") || "all"; // all, pro, free, active
    const userId = url.searchParams.get("userId"); // For single user detail

    // If requesting single user detail
    if (userId) {
      const [profileRes, businessRes, subscriptionRes, activityRes, metricsRes] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", userId).single(),
        supabase.from("businesses").select("*").eq("owner_id", userId),
        supabase.from("subscriptions").select("*").eq("user_id", userId).order("created_at", { ascending: false }),
        supabase.from("user_activity_logs").select("*").eq("user_id", userId).order("created_at", { ascending: false }).limit(100),
        supabase.from("user_daily_metrics").select("*").eq("user_id", userId).order("metric_date", { ascending: false }).limit(30),
      ]);

      // Get business health if exists
      let businessBrain = null;
      let businessSnapshots = null;
      if (businessRes.data && businessRes.data.length > 0) {
        const businessId = businessRes.data[0].id;
        const [brainRes, snapshotsRes] = await Promise.all([
          supabase.from("business_brains").select("*").eq("business_id", businessId).single(),
          supabase.from("snapshots").select("*").eq("business_id", businessId).order("created_at", { ascending: false }).limit(10),
        ]);
        businessBrain = brainRes.data;
        businessSnapshots = snapshotsRes.data;
      }

      // Log admin action
      await supabase.from("admin_audit_log").insert({
        admin_user_id: user.id,
        action_type: "view_user",
        target_user_id: userId,
        action_data: { viewed_at: new Date().toISOString() },
      });

      return new Response(JSON.stringify({
        profile: profileRes.data,
        businesses: businessRes.data,
        subscriptions: subscriptionRes.data,
        activity: activityRes.data,
        metrics: metricsRes.data,
        businessBrain,
        businessSnapshots,
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // List users with comprehensive data
    let query = supabase
      .from("profiles")
      .select(`
        *,
        businesses:businesses(id, name, category, country, setup_completed, created_at),
        subscriptions:subscriptions(id, plan_id, status, expires_at, payment_provider)
      `)
      .order("created_at", { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    if (search) {
      query = query.or(`email.ilike.%${search}%,full_name.ilike.%${search}%`);
    }

    const { data: users, error, count } = await query;

    if (error) {
      console.error("Error fetching users:", error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get aggregate stats
    const [totalUsersRes, proUsersRes, activeUsersRes] = await Promise.all([
      supabase.from("profiles").select("*", { count: "exact", head: true }),
      supabase.from("subscriptions").select("*", { count: "exact", head: true }).eq("status", "active"),
      supabase.from("user_daily_metrics").select("user_id", { count: "exact", head: true })
        .gte("metric_date", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]),
    ]);

    return new Response(JSON.stringify({
      users,
      pagination: {
        page,
        limit,
        total: count || 0,
      },
      stats: {
        totalUsers: totalUsersRes.count || 0,
        proUsers: proUsersRes.count || 0,
        activeUsers7d: activeUsersRes.count || 0,
      },
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Admin get users error:", error);
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
