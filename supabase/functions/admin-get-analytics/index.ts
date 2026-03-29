import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

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

    const url = new URL(req.url);
    const range = url.searchParams.get("range") || "7d";
    const type = url.searchParams.get("type") || "overview";

    const daysBack = range === "90d" ? 90 : range === "30d" ? 30 : 7;
    const startDate = new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000).toISOString();

    if (type === "overview") {
      const [
        webAnalyticsRes,
        userMetricsRes,
        topPagesRes,
        topBlogPostsRes,
        newUsersRes,
        revenueRes,
      ] = await Promise.all([
        supabase.from("web_analytics")
          .select("*", { count: "exact", head: true })
          .gte("created_at", startDate),
        supabase.from("user_daily_metrics")
          .select("*")
          .gte("metric_date", startDate.split("T")[0]),
        supabase.from("web_analytics")
          .select("page_path")
          .gte("created_at", startDate)
          .limit(1000),
        supabase.from("web_analytics")
          .select("blog_post_slug")
          .gte("created_at", startDate)
          .not("blog_post_slug", "is", null)
          .limit(1000),
        supabase.from("profiles")
          .select("*", { count: "exact", head: true })
          .gte("created_at", startDate),
        supabase.from("subscriptions")
          .select("payment_amount, payment_currency, plan_id")
          .gte("created_at", startDate)
          .eq("status", "active"),
      ]);

      const pageCounts: Record<string, number> = {};
      topPagesRes.data?.forEach((r: { page_path: string }) => {
        pageCounts[r.page_path] = (pageCounts[r.page_path] || 0) + 1;
      });
      const topPages = Object.entries(pageCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([path, count]) => ({ path, count }));

      const blogCounts: Record<string, number> = {};
      topBlogPostsRes.data?.forEach((r: { blog_post_slug: string }) => {
        if (r.blog_post_slug) {
          blogCounts[r.blog_post_slug] = (blogCounts[r.blog_post_slug] || 0) + 1;
        }
      });
      const topBlogPosts = Object.entries(blogCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([slug, count]) => ({ slug, count }));

      const totalLogins = userMetricsRes.data?.reduce((acc, m) => acc + (m.logins_count || 0), 0) || 0;
      const totalMissions = userMetricsRes.data?.reduce((acc, m) => acc + (m.missions_started || 0), 0) || 0;
      const totalChats = userMetricsRes.data?.reduce((acc, m) => acc + (m.chat_messages_sent || 0), 0) || 0;
      const totalCheckins = userMetricsRes.data?.reduce((acc, m) => acc + (m.checkins_completed || 0), 0) || 0;
      const totalRevenue = revenueRes.data?.reduce((acc, s) => acc + (s.payment_amount || 0), 0) || 0;

      return new Response(JSON.stringify({
        pageviews: webAnalyticsRes.count || 0,
        newUsers: newUsersRes.count || 0,
        totalLogins, totalMissions, totalChats, totalCheckins, totalRevenue,
        topPages, topBlogPosts, range,
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (type === "web") {
      const { data: analytics } = await supabase
        .from("web_analytics")
        .select("*")
        .gte("created_at", startDate)
        .order("created_at", { ascending: false })
        .limit(500);

      const byDay: Record<string, { pageviews: number; visitors: Set<string> }> = {};
      analytics?.forEach((a) => {
        const day = a.created_at.split("T")[0];
        if (!byDay[day]) byDay[day] = { pageviews: 0, visitors: new Set() };
        byDay[day].pageviews++;
        byDay[day].visitors.add(a.visitor_id);
      });

      const dailyStats = Object.entries(byDay)
        .map(([date, stats]) => ({ date, pageviews: stats.pageviews, uniqueVisitors: stats.visitors.size }))
        .sort((a, b) => a.date.localeCompare(b.date));

      const deviceCounts: Record<string, number> = {};
      analytics?.forEach((a) => { deviceCounts[a.device_type || "unknown"] = (deviceCounts[a.device_type || "unknown"] || 0) + 1; });

      const countryCounts: Record<string, number> = {};
      analytics?.forEach((a) => { countryCounts[a.country || "unknown"] = (countryCounts[a.country || "unknown"] || 0) + 1; });

      return new Response(JSON.stringify({ dailyStats, deviceBreakdown: deviceCounts, countryBreakdown: countryCounts, range }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (type === "blog") {
      const { data: blogAnalytics } = await supabase
        .from("web_analytics")
        .select("*")
        .gte("created_at", startDate)
        .not("blog_post_slug", "is", null)
        .order("created_at", { ascending: false })
        .limit(1000);

      const byPost: Record<string, { views: number; avgScroll: number; avgDuration: number; scrollCount: number; durationCount: number }> = {};
      blogAnalytics?.forEach((a) => {
        const slug = a.blog_post_slug;
        if (!byPost[slug]) byPost[slug] = { views: 0, avgScroll: 0, avgDuration: 0, scrollCount: 0, durationCount: 0 };
        byPost[slug].views++;
        if (a.scroll_depth) { byPost[slug].avgScroll += a.scroll_depth; byPost[slug].scrollCount++; }
        if (a.duration_seconds) { byPost[slug].avgDuration += a.duration_seconds; byPost[slug].durationCount++; }
      });

      const postStats = Object.entries(byPost)
        .map(([slug, stats]) => ({
          slug, views: stats.views,
          avgScrollDepth: stats.scrollCount > 0 ? Math.round(stats.avgScroll / stats.scrollCount) : 0,
          avgTimeOnPage: stats.durationCount > 0 ? Math.round(stats.avgDuration / stats.durationCount) : 0,
        }))
        .sort((a, b) => b.views - a.views)
        .slice(0, 50);

      const byDay: Record<string, number> = {};
      blogAnalytics?.forEach((a) => { const day = a.created_at.split("T")[0]; byDay[day] = (byDay[day] || 0) + 1; });
      const dailyBlogViews = Object.entries(byDay).map(([date, views]) => ({ date, views })).sort((a, b) => a.date.localeCompare(b.date));

      return new Response(JSON.stringify({ postStats, dailyBlogViews, totalBlogViews: blogAnalytics?.length || 0, range }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (type === "users") {
      const { data: userActivity } = await supabase
        .from("user_activity_logs")
        .select("*")
        .gte("created_at", startDate)
        .order("created_at", { ascending: false })
        .limit(1000);

      const eventCounts: Record<string, number> = {};
      userActivity?.forEach((a) => { eventCounts[a.event_type] = (eventCounts[a.event_type] || 0) + 1; });

      const activeByDay: Record<string, Set<string>> = {};
      userActivity?.forEach((a) => {
        if (a.user_id) {
          const day = a.created_at.split("T")[0];
          if (!activeByDay[day]) activeByDay[day] = new Set();
          activeByDay[day].add(a.user_id);
        }
      });

      const dailyActiveUsers = Object.entries(activeByDay)
        .map(([date, users]) => ({ date, activeUsers: users.size }))
        .sort((a, b) => a.date.localeCompare(b.date));

      return new Response(JSON.stringify({ eventBreakdown: eventCounts, dailyActiveUsers, totalEvents: userActivity?.length || 0, range }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Invalid type" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Admin get analytics error:", error);
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
