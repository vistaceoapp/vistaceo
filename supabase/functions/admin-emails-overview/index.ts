// admin-emails-overview
// Returns aggregated email send + engagement stats for the admin dashboard.
// Requires caller to be an admin (checked via user_roles).
import { createClient } from "npm:@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });
  try {
    const auth = req.headers.get("Authorization") || "";
    const supaUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    // Verify admin
    const userClient = createClient(supaUrl, anonKey, {
      global: { headers: { Authorization: auth } },
    });
    const { data: ures } = await userClient.auth.getUser();
    const userId = ures?.user?.id;
    if (!userId) return new Response(JSON.stringify({ error: "unauthorized" }), { status: 401, headers: { ...cors, "Content-Type": "application/json" } });

    const admin = createClient(supaUrl, serviceKey);
    const { data: role } = await admin
      .from("user_roles").select("role").eq("user_id", userId).eq("role", "admin").maybeSingle();
    if (!role) return new Response(JSON.stringify({ error: "forbidden" }), { status: 403, headers: { ...cors, "Content-Type": "application/json" } });

    const url = new URL(req.url);
    const days = Math.min(parseInt(url.searchParams.get("days") || "30"), 365);
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

    // Fetch logs (deduplicated client-side by message_id: latest status wins)
    const { data: logs, error: logsErr } = await admin
      .from("email_send_log")
      .select("id, message_id, template_name, recipient_email, status, error_message, created_at")
      .gte("created_at", since)
      .order("created_at", { ascending: false })
      .limit(2000);
    if (logsErr) throw logsErr;

    // Dedup by message_id (first occurrence = latest because ordered desc)
    const seen = new Set<string>();
    const dedup: any[] = [];
    for (const r of (logs || [])) {
      const key = r.message_id || `noid-${r.id}`;
      if (seen.has(key)) continue;
      seen.add(key);
      dedup.push(r);
    }

    // Engagement events
    const { data: events } = await admin
      .from("email_engagement_events")
      .select("tracking_id, recipient_email, template_name, event_type, created_at")
      .gte("created_at", since)
      .order("created_at", { ascending: false })
      .limit(5000);

    // Aggregate per recipient_email: opens + clicks counts
    const engagementByRecipient: Record<string, { opens: number; clicks: number; lastEvent: string | null }> = {};
    for (const ev of (events || [])) {
      const k = (ev.recipient_email || "").toLowerCase();
      if (!k) continue;
      if (!engagementByRecipient[k]) engagementByRecipient[k] = { opens: 0, clicks: 0, lastEvent: null };
      if (ev.event_type === "open") engagementByRecipient[k].opens++;
      if (ev.event_type === "click") engagementByRecipient[k].clicks++;
      if (!engagementByRecipient[k].lastEvent) engagementByRecipient[k].lastEvent = ev.created_at;
    }

    // Aggregate per template
    const byTemplate: Record<string, { sent: number; failed: number; suppressed: number; pending: number; total: number }> = {};
    for (const r of dedup) {
      const t = r.template_name || "unknown";
      if (!byTemplate[t]) byTemplate[t] = { sent: 0, failed: 0, suppressed: 0, pending: 0, total: 0 };
      byTemplate[t].total++;
      const s = r.status as string;
      if (s === "sent") byTemplate[t].sent++;
      else if (s === "failed" || s === "dlq" || s === "bounced") byTemplate[t].failed++;
      else if (s === "suppressed" || s === "complained") byTemplate[t].suppressed++;
      else if (s === "pending") byTemplate[t].pending++;
    }

    const totals = {
      total: dedup.length,
      sent: dedup.filter(r => r.status === "sent").length,
      failed: dedup.filter(r => ["failed","dlq","bounced"].includes(r.status)).length,
      suppressed: dedup.filter(r => ["suppressed","complained"].includes(r.status)).length,
      pending: dedup.filter(r => r.status === "pending").length,
      opens: (events || []).filter((e:any) => e.event_type === "open").length,
      clicks: (events || []).filter((e:any) => e.event_type === "click").length,
      uniqueRecipients: new Set(dedup.map(r => r.recipient_email?.toLowerCase()).filter(Boolean)).size,
    };

    // Decorate logs with engagement counts
    const rows = dedup.map(r => {
      const eng = engagementByRecipient[(r.recipient_email || "").toLowerCase()] || { opens: 0, clicks: 0, lastEvent: null };
      return { ...r, opens: eng.opens, clicks: eng.clicks, lastEngagementAt: eng.lastEvent };
    });

    return new Response(JSON.stringify({ ok: true, days, totals, byTemplate, rows }), {
      headers: { ...cors, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error("[admin-emails-overview] error", err);
    return new Response(JSON.stringify({ ok: false, error: err?.message ?? String(err) }), {
      status: 500, headers: { ...cors, "Content-Type": "application/json" },
    });
  }
});
