// Admin: vista cronológica unificada de un usuario
// Mezcla chat, misiones, oportunidades, acciones, señales, emails y actividad.
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
    .from("user_roles").select("role")
    .eq("user_id", user.id).eq("role", "admin").maybeSingle();
  return role ? user : null;
}

type Item = {
  id: string;
  type: "chat" | "mission" | "opportunity" | "action" | "signal" | "email" | "activity";
  created_at: string;
  business_id?: string | null;
  title: string;
  subtitle?: string;
  body?: string;
  meta?: Record<string, unknown>;
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );
    const admin = await verifyAdmin(supabase, req);
    if (!admin) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = req.method === "POST" ? await req.json().catch(() => ({})) : {};
    const userId: string | undefined = body.userId;
    const limit = Math.min(Number(body.limit) || 300, 500);
    if (!userId) {
      return new Response(JSON.stringify({ error: "userId required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Profile + businesses
    const [profileRes, bizRes] = await Promise.all([
      supabase.from("profiles").select("id,email,full_name,avatar_url,created_at,last_login_at,last_active_at,login_count").eq("id", userId).maybeSingle(),
      supabase.from("businesses").select("id,name,category,country,setup_completed,created_at").eq("owner_id", userId),
    ]);

    const businesses = bizRes.data || [];
    const bizIds = businesses.map((b: any) => b.id);
    const bizNameById = new Map(businesses.map((b: any) => [b.id, b.name]));

    // Parallel fetch of every signal type
    const [
      chatRes, missionsRes, oppsRes, actionsRes, signalsRes, emailsRes, activityRes,
    ] = await Promise.all([
      bizIds.length
        ? supabase.from("chat_messages").select("id,business_id,role,content,created_at,metadata").in("business_id", bizIds).order("created_at", { ascending: false }).limit(limit)
        : Promise.resolve({ data: [] }),
      bizIds.length
        ? supabase.from("missions").select("id,business_id,title,description,area,status,created_at").in("business_id", bizIds).order("created_at", { ascending: false }).limit(limit)
        : Promise.resolve({ data: [] }),
      bizIds.length
        ? supabase.from("opportunities").select("id,business_id,title,description,created_at").in("business_id", bizIds).order("created_at", { ascending: false }).limit(limit)
        : Promise.resolve({ data: [] }),
      bizIds.length
        ? supabase.from("daily_actions").select("id,business_id,title,description,category,priority,status,outcome,created_at").in("business_id", bizIds).order("created_at", { ascending: false }).limit(limit)
        : Promise.resolve({ data: [] }),
      bizIds.length
        ? supabase.from("signals").select("id,business_id,signal_type,content,raw_text,created_at").in("business_id", bizIds).order("created_at", { ascending: false }).limit(limit)
        : Promise.resolve({ data: [] }),
      supabase.from("email_events").select("id,business_id,template_key,status,sent_at,created_at,metadata,error_message").eq("user_id", userId).order("created_at", { ascending: false }).limit(limit),
      supabase.from("user_activity_logs").select("id,business_id,event_type,created_at").eq("user_id", userId).order("created_at", { ascending: false }).limit(limit),
    ]);

    const items: Item[] = [];

    for (const m of chatRes.data || []) {
      items.push({
        id: `chat-${m.id}`, type: "chat", created_at: m.created_at, business_id: m.business_id,
        title: m.role === "user" ? "Usuario escribió" : "VISTACEO respondió",
        subtitle: bizNameById.get(m.business_id) || undefined,
        body: typeof m.content === "string" ? m.content : JSON.stringify(m.content).slice(0, 800),
        meta: { role: m.role },
      });
    }
    for (const x of missionsRes.data || []) {
      items.push({
        id: `mis-${x.id}`, type: "mission", created_at: x.created_at, business_id: x.business_id,
        title: x.title, subtitle: `Misión · ${x.area || ""} · ${x.status || ""}`.trim(), body: x.description || "",
      });
    }
    for (const x of oppsRes.data || []) {
      items.push({
        id: `opp-${x.id}`, type: "opportunity", created_at: x.created_at, business_id: x.business_id,
        title: x.title, subtitle: "Oportunidad detectada", body: x.description || "",
      });
    }
    for (const x of actionsRes.data || []) {
      items.push({
        id: `act-${x.id}`, type: "action", created_at: x.created_at, business_id: x.business_id,
        title: x.title, subtitle: `Acción · ${x.category || ""} · ${x.status || ""}`.trim(), body: x.description || "",
        meta: { priority: x.priority, outcome: x.outcome },
      });
    }
    for (const x of signalsRes.data || []) {
      items.push({
        id: `sig-${x.id}`, type: "signal", created_at: x.created_at, business_id: x.business_id,
        title: `Señal: ${x.signal_type}`, body: x.raw_text || (x.content ? JSON.stringify(x.content).slice(0, 400) : ""),
      });
    }
    for (const x of emailsRes.data || []) {
      const meta: any = x.metadata || {};
      items.push({
        id: `email-${x.id}`, type: "email", created_at: x.created_at, business_id: x.business_id,
        title: meta.subject || x.template_key || "Email",
        subtitle: `Email · ${x.status}${x.error_message ? " · error" : ""}`,
        body: x.error_message || meta.preview || "",
        meta: { template: x.template_key, status: x.status, sent_at: x.sent_at, ...meta },
      });
    }
    for (const x of activityRes.data || []) {
      items.push({
        id: `act-log-${x.id}`, type: "activity", created_at: x.created_at, business_id: x.business_id,
        title: x.event_type, subtitle: "Actividad",
      });
    }

    items.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    const counts = {
      chat: (chatRes.data || []).length,
      mission: (missionsRes.data || []).length,
      opportunity: (oppsRes.data || []).length,
      action: (actionsRes.data || []).length,
      signal: (signalsRes.data || []).length,
      email: (emailsRes.data || []).length,
      activity: (activityRes.data || []).length,
    };

    return new Response(JSON.stringify({
      profile: profileRes.data,
      businesses,
      items: items.slice(0, limit),
      counts,
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e: any) {
    console.error("admin-user-timeline error:", e);
    return new Response(JSON.stringify({ error: e?.message || "error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
