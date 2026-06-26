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
  const { data: role } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id)
    .eq("role", "admin")
    .maybeSingle();
  if (!role) return null;
  return user;
}

const INTERNAL_EMAIL_PATTERNS = [
  /merdinian/i,
  /kevin_merdi/i,
  /lickevin/i,
  /^test/i,
  /\+test@/i,
];

function isInternal(email: string | null | undefined) {
  if (!email) return false;
  return INTERNAL_EMAIL_PATTERNS.some((rx) => rx.test(email));
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

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

    let body: Record<string, any> = {};
    try { body = await req.json(); } catch { /* empty */ }
    const days: number = Math.min(90, Math.max(1, parseInt(body.days || "30")));
    const includeInternal: boolean = !!body.includeInternal;
    const limit: number = Math.min(500, Math.max(10, parseInt(body.limit || "100")));

    const sinceISO = new Date(Date.now() - days * 86_400_000).toISOString();
    const since7ISO = new Date(Date.now() - 7 * 86_400_000).toISOString();
    const since1ISO = new Date(Date.now() - 86_400_000).toISOString();

    // 1) Profiles (base universe)
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, email, full_name, avatar_url, created_at, last_login_at, last_active_at, login_count")
      .order("created_at", { ascending: false })
      .limit(2000);

    if (!profiles?.length) {
      return new Response(JSON.stringify({ ranking: [], totalUsers: 0, days }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userIds = profiles
      .filter((p) => includeInternal || !isInternal(p.email))
      .map((p) => p.id);
    const idSet = new Set(userIds);

    // 2) Activity events (period + 7d + 1d distinct days)
    const { data: events } = await supabase
      .from("user_activity_logs")
      .select("user_id, event_type, created_at")
      .gte("created_at", sinceISO)
      .in("user_id", userIds)
      .limit(50000);

    // 3) Businesses + setup state
    const { data: businesses } = await supabase
      .from("businesses")
      .select("id, owner_id, name, country, setup_completed, created_at")
      .in("owner_id", userIds);

    const businessByOwner = new Map<string, any[]>();
    for (const b of businesses || []) {
      const arr = businessByOwner.get(b.owner_id) || [];
      arr.push(b);
      businessByOwner.set(b.owner_id, arr);
    }
    const businessIds = (businesses || []).map((b) => b.id);
    const businessOwner = new Map<string, string>();
    for (const b of businesses || []) businessOwner.set(b.id, b.owner_id);

    // 4) Chats, missions, checkins (per business, period)
    const [chatsRes, missionsRes, checkinsRes, subsRes] = await Promise.all([
      supabase
        .from("chat_messages")
        .select("business_id, role, created_at")
        .in("business_id", businessIds.length ? businessIds : ["00000000-0000-0000-0000-000000000000"])
        .gte("created_at", sinceISO)
        .limit(50000),
      supabase
        .from("missions")
        .select("business_id, status, created_at, updated_at")
        .in("business_id", businessIds.length ? businessIds : ["00000000-0000-0000-0000-000000000000"])
        .limit(20000),
      supabase
        .from("business_checkins")
        .select("business_id, created_at")
        .in("business_id", businessIds.length ? businessIds : ["00000000-0000-0000-0000-000000000000"])
        .gte("created_at", sinceISO)
        .limit(20000),
      supabase
        .from("subscriptions")
        .select("business_id, status, plan_id, expires_at")
        .in("business_id", businessIds.length ? businessIds : ["00000000-0000-0000-0000-000000000000"]),
    ]);

    // Aggregate
    type Agg = {
      events: number;
      events7d: number;
      distinctDays: Set<string>;
      lastEventAt: string | null;
      pageViews: number;
      chats: number;
      missions: number;
      missionsCompleted: number;
      checkins: number;
      radarViews: number;
      sessions: Set<string>;
    };
    const agg = new Map<string, Agg>();
    const blank = (): Agg => ({
      events: 0, events7d: 0, distinctDays: new Set(), lastEventAt: null,
      pageViews: 0, chats: 0, missions: 0, missionsCompleted: 0,
      checkins: 0, radarViews: 0, sessions: new Set(),
    });

    for (const e of events || []) {
      if (!idSet.has(e.user_id)) continue;
      const a = agg.get(e.user_id) || blank();
      a.events += 1;
      if (e.created_at >= since7ISO) a.events7d += 1;
      a.distinctDays.add(e.created_at.slice(0, 10));
      if (!a.lastEventAt || e.created_at > a.lastEventAt) a.lastEventAt = e.created_at;
      if (e.event_type === "page_view") a.pageViews += 1;
      if (e.event_type === "radar_view") a.radarViews += 1;
      agg.set(e.user_id, a);
    }

    for (const c of chatsRes.data || []) {
      const owner = businessOwner.get(c.business_id);
      if (!owner || !idSet.has(owner)) continue;
      const a = agg.get(owner) || blank();
      if (c.role === "user") a.chats += 1;
      agg.set(owner, a);
    }

    for (const m of missionsRes.data || []) {
      const owner = businessOwner.get(m.business_id);
      if (!owner || !idSet.has(owner)) continue;
      const a = agg.get(owner) || blank();
      a.missions += 1;
      if (m.status === "completed") a.missionsCompleted += 1;
      agg.set(owner, a);
    }

    for (const c of checkinsRes.data || []) {
      const owner = businessOwner.get(c.business_id);
      if (!owner || !idSet.has(owner)) continue;
      const a = agg.get(owner) || blank();
      a.checkins += 1;
      agg.set(owner, a);
    }

    const proOwners = new Set<string>();
    const now = Date.now();
    for (const s of subsRes.data || []) {
      if (s.status === "active" && s.expires_at && new Date(s.expires_at).getTime() > now) {
        const owner = businessOwner.get(s.business_id);
        if (owner) proOwners.add(owner);
      }
    }

    // Score
    const ranking = profiles
      .filter((p) => idSet.has(p.id))
      .map((p) => {
        const a = agg.get(p.id) || blank();
        const bizs = businessByOwner.get(p.id) || [];
        const hasSetup = bizs.some((b) => b.setup_completed);
        const isPro = proOwners.has(p.id);
        const daysActive = a.distinctDays.size;
        const lastActive = a.lastEventAt || p.last_active_at || p.last_login_at || p.created_at;
        const hoursSinceActive = (now - new Date(lastActive).getTime()) / 3_600_000;
        const recencyBoost = hoursSinceActive < 24 ? 25 : hoursSinceActive < 72 ? 15 : hoursSinceActive < 168 ? 8 : 0;

        const score =
          Math.min(60, daysActive * 4) +          // consistencia
          Math.min(40, a.events7d * 1.2) +         // intensidad reciente
          Math.min(30, a.chats * 2.5) +            // conversación con el CEO
          Math.min(25, a.missions * 4) +           // ejecución
          Math.min(15, a.missionsCompleted * 6) +  // completar misiones
          Math.min(20, a.checkins * 3) +           // disciplina
          Math.min(10, a.radarViews * 1.5) +
          recencyBoost +
          (hasSetup ? 15 : 0) +
          (isPro ? 25 : 0) +
          Math.min(8, (p.login_count || 0) * 0.5);

        return {
          userId: p.id,
          email: p.email,
          fullName: p.full_name,
          avatarUrl: p.avatar_url,
          createdAt: p.created_at,
          lastActiveAt: lastActive,
          businessName: bizs[0]?.name || null,
          country: bizs[0]?.country || null,
          setupCompleted: hasSetup,
          isPro,
          loginCount: p.login_count || 0,
          metrics: {
            events: a.events,
            events7d: a.events7d,
            daysActive,
            pageViews: a.pageViews,
            chats: a.chats,
            missions: a.missions,
            missionsCompleted: a.missionsCompleted,
            checkins: a.checkins,
            radarViews: a.radarViews,
          },
          score: Math.round(score),
        };
      })
      .sort((x, y) => y.score - x.score)
      .slice(0, limit);

    return new Response(JSON.stringify({
      ranking,
      totalUsers: userIds.length,
      days,
      generatedAt: new Date().toISOString(),
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("[admin-user-ranking] error:", err);
    return new Response(JSON.stringify({ error: String(err?.message || err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
