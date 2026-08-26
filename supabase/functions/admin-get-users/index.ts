import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

async function verifyAdmin(supabase: any, req: Request) {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) return null;

  const token = authHeader.replace("Bearer ", "");
  const { data: { user } } = await supabase.auth.getUser(token);
  if (!user) return null;

  // Check admin role in user_roles table
  const { data: role } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id)
    .eq("role", "admin")
    .single();

  if (!role) return null;
  return user;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const user = await verifyAdmin(supabase, req);
    if (!user) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Support both GET params and POST body
    let params: Record<string, any> = {};
    if (req.method === "POST") {
      try {
        params = await req.json();
      } catch { /* empty body ok */ }
    }
    
    const url = new URL(req.url);
    const page = parseInt(params.page || url.searchParams.get("page") || "1");
    const limit = parseInt(params.limit || url.searchParams.get("limit") || "50");
    const search = params.search || url.searchParams.get("search") || "";
    const filter = params.filter || url.searchParams.get("filter") || "all";
    const userId = params.userId || url.searchParams.get("userId");

    // If requesting single user detail
    if (userId) {
      const [profileRes, businessRes, subscriptionRes, activityRes, metricsRes] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", userId).single(),
        supabase.from("businesses").select("*").eq("owner_id", userId)
          .order("setup_completed", { ascending: false })
          .order("created_at", { ascending: false }),
        supabase.from("subscriptions").select("*").eq("user_id", userId).order("created_at", { ascending: false }),
        supabase.from("user_activity_logs").select("*").eq("user_id", userId).order("created_at", { ascending: false }).limit(100),
        supabase.from("user_daily_metrics").select("*").eq("user_id", userId).order("metric_date", { ascending: false }).limit(30),
      ]);

      // Email history (sent log + engagement events: opens/clicks)
      const userEmail = (profileRes.data?.email || "").toLowerCase();
      let emailsSent: any[] = [];
      let emailEvents: any[] = [];
      if (userEmail) {
        const [sentRes, eventsRes] = await Promise.all([
          supabase
            .from("email_send_log")
            .select("message_id, template_name, recipient_email, status, error_message, created_at")
            .ilike("recipient_email", userEmail)
            .order("created_at", { ascending: false })
            .limit(200),
          supabase
            .from("email_engagement_events")
            .select("tracking_id, template_name, event_type, url, user_agent, created_at")
            .ilike("recipient_email", userEmail)
            .order("created_at", { ascending: false })
            .limit(200),
        ]);
        // Dedupe sent by message_id keeping latest status
        const seen = new Set<string>();
        emailsSent = (sentRes.data || []).filter((r: any) => {
          if (!r.message_id) return true;
          if (seen.has(r.message_id)) return false;
          seen.add(r.message_id);
          return true;
        });
        emailEvents = eventsRes.data || [];
      }


      let businessBrain = null;
      let businessSnapshots = null;
      let missions = null;
      let opportunities = null;
      let chatMessages = null;
      
      if (businessRes.data && businessRes.data.length > 0) {
        const businessId = businessRes.data[0].id;
        const [brainRes, snapshotsRes, missionsRes, opportunitiesRes, chatRes] = await Promise.all([
          supabase.from("business_brains").select("*").eq("business_id", businessId).single(),
          supabase.from("snapshots").select("*").eq("business_id", businessId).order("created_at", { ascending: false }).limit(10),
          supabase.from("missions").select("*").eq("business_id", businessId).order("created_at", { ascending: false }).limit(20),
          supabase.from("opportunities").select("*").eq("business_id", businessId).order("created_at", { ascending: false }).limit(20),
          supabase.from("chat_messages").select("*").eq("business_id", businessId).order("created_at", { ascending: false }).limit(50),
        ]);
        businessBrain = brainRes.data;
        businessSnapshots = snapshotsRes.data;
        missions = missionsRes.data;
        opportunities = opportunitiesRes.data;
        chatMessages = chatRes.data;
      }

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
        missions,
        opportunities,
        chatMessages,
        emailsSent,
        emailEvents,
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let profilesQuery = supabase
      .from("profiles")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    if (search) {
      profilesQuery = profilesQuery.or(`email.ilike.%${search}%,full_name.ilike.%${search}%`);
    }

    const { data: profiles, error, count } = await profilesQuery;

    if (error) {
      console.error("Error fetching profiles:", error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userIds = profiles?.map(p => p.id) || [];
    const since7d = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

    const [businessesRes, subscriptionsRes, activityRes] = await Promise.all([
      supabase.from("businesses").select("*").in("owner_id", userIds),
      supabase.from("subscriptions").select("*").in("user_id", userIds),
      supabase.from("user_activity_logs")
        .select("user_id, event_type, created_at")
        .in("user_id", userIds)
        .gte("created_at", since7d)
        .order("created_at", { ascending: false })
        .limit(5000),
    ]);

    // Brains for richer "Detalle" column (EASY_* answers, google_connected, etc.)
    const businessIds = (businessesRes.data || []).map((b: any) => b.id);
    const brainsRes = businessIds.length
      ? await supabase.from("business_brains").select("business_id, factual_memory").in("business_id", businessIds)
      : { data: [] as any[] };
    const brainByBusiness: Record<string, any> = {};
    (brainsRes.data || []).forEach((b: any) => { brainByBusiness[b.business_id] = b.factual_memory || {}; });

    const POST_SETUP_EVENTS = new Set([
      "login", "page_view", "chat_message", "mission_start",
      "mission_complete", "radar_view", "checkin", "feature_use",
    ]);
    const activityByUser: Record<string, {
      events7d: number;
      postSetupEvents7d: number;
      lastEventAt: string | null;
      lastEventType: string | null;
    }> = {};
    (activityRes.data || []).forEach((row: any) => {
      const u = row.user_id;
      if (!u) return;
      if (!activityByUser[u]) {
        activityByUser[u] = { events7d: 0, postSetupEvents7d: 0, lastEventAt: null, lastEventType: null };
      }
      activityByUser[u].events7d += 1;
      if (POST_SETUP_EVENTS.has(row.event_type)) {
        activityByUser[u].postSetupEvents7d += 1;
      }
      if (!activityByUser[u].lastEventAt || row.created_at > activityByUser[u].lastEventAt!) {
        activityByUser[u].lastEventAt = row.created_at;
        activityByUser[u].lastEventType = row.event_type;
      }
    });

    const buildAnswersSummary = (answers: any): string => {
      if (!answers || typeof answers !== "object") return "";
      const parts: string[] = [];
      for (const [k, v] of Object.entries(answers as Record<string, any>)) {
        if (v === null || v === undefined || v === "") continue;
        const val = Array.isArray(v) ? v.join(",") : (typeof v === "object" ? JSON.stringify(v) : String(v));
        parts.push(`${k}:${val.length > 40 ? val.slice(0, 40) + "…" : val}`);
      }
      return parts.join(" | ");
    };

    const users = profiles?.map(profile => {
      const act = activityByUser[profile.id] || { events7d: 0, postSetupEvents7d: 0, lastEventAt: null, lastEventType: null };
      const businessesForUser = businessesRes.data?.filter(b => b.owner_id === profile.id) || [];
      const setupDone = businessesForUser.some(b => b.setup_completed);
       const primaryBusiness = [...businessesForUser].sort((a: any, b: any) => {
         if (!!a.setup_completed !== !!b.setup_completed) return a.setup_completed ? -1 : 1;
         return String(b.created_at || '').localeCompare(String(a.created_at || ''));
       })[0];
      const brain = primaryBusiness ? brainByBusiness[primaryBusiness.id] : null;
      const googleConnected = !!primaryBusiness?.google_place_id || !!brain?.has_google;
      const answersSummary = brain?.answers ? buildAnswersSummary(brain.answers) : "";
      return {
        ...profile,
        businesses: businessesForUser,
        subscriptions: subscriptionsRes.data?.filter(s => s.user_id === profile.id) || [],
        activity_events_7d: act.events7d,
        post_setup_events_7d: act.postSetupEvents7d,
        last_event_at: act.lastEventAt,
        last_event_type: act.lastEventType,
        setup_completed: setupDone,
        churned_after_setup: setupDone && act.postSetupEvents7d === 0,
        // Nuevos campos para columnas "Google conectado" y "Detalle"
        google_connected: googleConnected,
        answers_count: brain?.answers ? Object.keys(brain.answers).length : 0,
        answers_summary: answersSummary,
        business_type_label: brain?.business_type_label || primaryBusiness?.category || null,
        area_id: brain?.area_id || null,
      };
    }) || [];


    const [totalUsersRes, proUsersRes, activeUsersRes] = await Promise.all([
      supabase.from("profiles").select("*", { count: "exact", head: true }),
      supabase.from("subscriptions").select("*", { count: "exact", head: true }).eq("status", "active"),
      supabase.from("user_daily_metrics").select("user_id", { count: "exact", head: true })
        .gte("metric_date", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]),
    ]);

    return new Response(JSON.stringify({
      users,
      pagination: { page, limit, total: count || 0 },
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
