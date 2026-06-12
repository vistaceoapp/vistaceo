// Edge function: ops-watchdog — Vigilante autónomo del Centro de Salud Operativa.
// Corre por cron cada 30 min, sin IA (costo cero):
//  1. Hace ping (OPTIONS) a las funciones críticas → si alguna no responde 2xx,
//     crea/actualiza un incidente crítico en ops_incidents.
//  2. Si una función previamente caída vuelve a responder, cierra el incidente
//     como `fixed` registrando la estrategia y el resultado.
//  3. Auto-resuelve incidentes "stale": abiertos, no críticos, sin nueva
//     ocurrencia en 72h → `fixed` con estrategia `auto_resolved_stale`.

import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const CRITICAL_FUNCTIONS = [
  "vistaceo-chat",
  "ai-forge-artifact",
  "analyze-patterns",
  "generate-mission-plan",
  "generate-opportunity-plan",
  "report-incident",
  "dashboard-prepare",
];

const STALE_HOURS = 72;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
  const supabase = createClient(SUPABASE_URL, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

  const results: Record<string, unknown> = {};

  // 1 + 2. Ping de funciones críticas
  const pings = await Promise.all(
    CRITICAL_FUNCTIONS.map(async (fn) => {
      try {
        const ctrl = new AbortController();
        const timer = setTimeout(() => ctrl.abort(), 10_000);
        const res = await fetch(`${SUPABASE_URL}/functions/v1/${fn}`, {
          method: "OPTIONS",
          signal: ctrl.signal,
        });
        clearTimeout(timer);
        return { fn, ok: res.status < 500, status: res.status };
      } catch (e) {
        return { fn, ok: false, status: 0, error: (e as Error).message };
      }
    }),
  );

  for (const ping of pings) {
    const fingerprint = `watchdog:fn_down:${ping.fn}`;

    if (!ping.ok) {
      // Buscar incidente abierto con el mismo fingerprint
      const { data: existing } = await supabase
        .from("ops_incidents")
        .select("id, occurrences")
        .eq("fingerprint", fingerprint)
        .in("status", ["open", "auto_fixing", "manual_required"])
        .limit(1)
        .maybeSingle();

      if (existing) {
        await supabase
          .from("ops_incidents")
          .update({
            occurrences: (existing.occurrences ?? 1) + 1,
            last_seen_at: new Date().toISOString(),
            context: { status: ping.status, error: (ping as { error?: string }).error ?? null },
          })
          .eq("id", existing.id);
      } else {
        await supabase.from("ops_incidents").insert({
          source: "edge_fn",
          category: "structural",
          severity: "critical",
          title: `Función ${ping.fn} no responde (HTTP ${ping.status || "timeout"})`,
          where_path: `/functions/v1/${ping.fn}`,
          detected_by: "ops-watchdog",
          context: { status: ping.status, error: (ping as { error?: string }).error ?? null },
          fingerprint,
        });
      }
      results[ping.fn] = `DOWN (${ping.status})`;
    } else {
      // Función sana → cerrar incidente abierto si existía
      const { data: open } = await supabase
        .from("ops_incidents")
        .select("id")
        .eq("fingerprint", fingerprint)
        .in("status", ["open", "auto_fixing", "manual_required"]);

      if (open?.length) {
        await supabase
          .from("ops_incidents")
          .update({
            status: "fixed",
            fix_strategy: "watchdog_recovery_check",
            fix_result: { verified_status: ping.status, verified_at: new Date().toISOString() },
            fixed_at: new Date().toISOString(),
          })
          .in("id", open.map((o) => o.id));
        results[ping.fn] = "RECOVERED";
      } else {
        results[ping.fn] = "OK";
      }
    }
  }

  // 3. Auto-resolver incidentes stale (no críticos, sin recurrencia en 72h)
  const staleCutoff = new Date(Date.now() - STALE_HOURS * 3600_000).toISOString();
  const { data: staleRows } = await supabase
    .from("ops_incidents")
    .select("id")
    .eq("status", "open")
    .neq("severity", "critical")
    .lt("last_seen_at", staleCutoff);

  if (staleRows?.length) {
    await supabase
      .from("ops_incidents")
      .update({
        status: "fixed",
        fix_strategy: "auto_resolved_stale",
        fix_result: { reason: `Sin nuevas ocurrencias en ${STALE_HOURS}h`, resolved_by: "ops-watchdog" },
        fixed_at: new Date().toISOString(),
      })
      .in("id", staleRows.map((r) => r.id));
  }
  results._stale_resolved = staleRows?.length ?? 0;

  console.log("[ops-watchdog]", JSON.stringify(results));
  return new Response(JSON.stringify({ ok: true, results }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
