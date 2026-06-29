// VISTACEO Conversion Intelligence OS — Event tracker
// Endpoint único para registrar eventos finos de conversion.
// Reutiliza la infra existente (no duplica user_events / lifecycle_events).
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const KEY_EVENTS = new Set([
  "signup_completed",
  "onboarding_completed",
  "first_value_detected",
  "premium_feature_clicked",
  "premium_gate_viewed",
  "upgrade_clicked",
  "pro_page_viewed",
  "pricing_viewed",
  "checkout_started",
  "checkout_abandoned",
  "payment_success",
  "modal_closed",
  "email_clicked",
  "user_rejected_recommendation",
]);

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization") ?? "";
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // Resolve user from JWT (verify_jwt is off by default; we validate in code)
    const token = authHeader.replace(/^Bearer\s+/i, "");
    if (!token) return new Response(JSON.stringify({ error: "missing_auth" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    const { data: userRes, error: userErr } = await supabase.auth.getUser(token);
    if (userErr || !userRes?.user) return new Response(JSON.stringify({ error: "invalid_auth" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    const userId = userRes.user.id;

    const body = await req.json().catch(() => ({}));
    const { event_name, category, source, session_id, business_id, metadata } = body ?? {};

    if (!event_name || typeof event_name !== "string" || event_name.length > 120) {
      return new Response(JSON.stringify({ error: "invalid_event_name" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const { error: insErr } = await supabase.from("conversion_events").insert({
      user_id: userId,
      business_id: business_id ?? null,
      event_name,
      category: category ?? null,
      source: source ?? null,
      session_id: session_id ?? null,
      metadata: metadata ?? {},
    });
    if (insErr) console.error("[conv-track] insert", insErr.message);

    // Touch profile so daily orchestrator picks it up
    await supabase
      .from("user_conversion_profiles")
      .upsert(
        { user_id: userId, last_active_at: new Date().toISOString() },
        { onConflict: "user_id" },
      );

    // If a key event, fire the agent (best-effort, non-blocking)
    if (KEY_EVENTS.has(event_name)) {
      try {
        await fetch(`${Deno.env.get("SUPABASE_URL")}/functions/v1/conversion-run-agent`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
          },
          body: JSON.stringify({ user_id: userId, trigger_event: event_name }),
        });
      } catch (e) {
        console.warn("[conv-track] agent dispatch failed:", (e as Error).message);
      }
    }

    return new Response(JSON.stringify({ ok: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    console.error("[conv-track] fatal", (e as Error).message);
    return new Response(JSON.stringify({ error: "internal" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
