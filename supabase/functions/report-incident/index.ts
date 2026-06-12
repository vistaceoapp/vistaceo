// Edge function: report-incident
// Recibe un evento de cualquier sensor (frontend o edge) y crea/actualiza
// una fila en `ops_incidents`. Deduplica por `fingerprint` (mismo error
// en la misma ruta → incrementa `occurrences` en lugar de duplicar).

import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface IncidentPayload {
  source: "app" | "blog" | "edge_fn" | "db" | "seo";
  category: "error" | "ux" | "perf" | "seo" | "content" | "structural" | "network";
  severity?: "critical" | "high" | "medium" | "low";
  title: string;
  where_path?: string;
  detected_by: string;
  context?: Record<string, unknown>;
  fingerprint?: string;
}

function sha1(str: string): Promise<string> {
  const data = new TextEncoder().encode(str);
  return crypto.subtle.digest("SHA-1", data).then((buf) =>
    Array.from(new Uint8Array(buf))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("")
  );
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405, headers: corsHeaders });
  }

  try {
    const body = (await req.json()) as IncidentPayload;
    if (!body?.source || !body?.category || !body?.title || !body?.detected_by) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // Try to resolve user (optional). Auth header may or may not be present.
    let userId: string | null = null;
    const auth = req.headers.get("Authorization");
    if (auth) {
      try {
        const token = auth.replace(/^Bearer\s+/i, "");
        const { data } = await supabase.auth.getUser(token);
        userId = data.user?.id ?? null;
      } catch {
        /* ignore — anonymous report still allowed */
      }
    }

    // Compute fingerprint if not provided (stable hash of source+detected_by+title+where_path)
    const fingerprint =
      body.fingerprint ??
      (await sha1(
        `${body.source}|${body.detected_by}|${body.title}|${body.where_path ?? ""}`,
      ));

    // Try to find an existing OPEN incident with same fingerprint → bump occurrences
    const { data: existing } = await supabase
      .from("ops_incidents")
      .select("id, occurrences")
      .eq("fingerprint", fingerprint)
      .in("status", ["open", "auto_fixing", "manual_required"])
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (existing) {
      await supabase
        .from("ops_incidents")
        .update({
          occurrences: (existing.occurrences ?? 1) + 1,
          last_seen_at: new Date().toISOString(),
          context: body.context ?? {},
        })
        .eq("id", existing.id);

      return new Response(
        JSON.stringify({ ok: true, id: existing.id, deduped: true }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const { data: inserted, error } = await supabase
      .from("ops_incidents")
      .insert({
        source: body.source,
        category: body.category,
        severity: body.severity ?? "medium",
        title: body.title.slice(0, 280),
        where_path: body.where_path ?? null,
        detected_by: body.detected_by,
        context: body.context ?? {},
        fingerprint,
        user_id: userId,
      })
      .select("id")
      .single();

    if (error) {
      console.error("[report-incident] insert error:", error);
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    return new Response(
      JSON.stringify({ ok: true, id: inserted.id, deduped: false }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    console.error("[report-incident] fatal:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "unknown" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
