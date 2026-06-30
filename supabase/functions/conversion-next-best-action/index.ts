// VISTACEO Conversion OS — Next Best Action (read-only para frontend)
// Devuelve la última decisión del agente para el usuario, SIN exponer scores ni probabilidad.
// Si no hay decisión vigente (últimas 24h) o el usuario es Pro / silent, devuelve { action: null }.
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization") ?? "";
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );

    // Quién es el caller
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData?.user?.id;
    if (!userId) {
      return new Response(JSON.stringify({ action: null, reason: "not_authenticated" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const [profileRes, decisionRes] = await Promise.all([
      admin.from("user_conversion_profiles").select("plan_status, current_conversion_segment, do_not_disturb_until").eq("user_id", userId).maybeSingle(),
      admin
        .from("conversion_agent_decisions")
        .select("id, strategy, channel, placement, intent, created_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
    ]);

    const profile = profileRes.data;
    const decision = decisionRes.data;

    // Pro o DND activo → silencio total
    if (profile?.plan_status === "pro") {
      return new Response(JSON.stringify({ action: null, reason: "pro_user" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (profile?.do_not_disturb_until && new Date(profile.do_not_disturb_until) > new Date()) {
      return new Response(JSON.stringify({ action: null, reason: "dnd" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!decision || decision.channel === "silent" || decision.strategy === "silent_mode") {
      return new Response(JSON.stringify({ action: null, reason: "no_action" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Sólo decisiones de las últimas 24h son vigentes
    const ageMs = Date.now() - new Date(decision.created_at).getTime();
    if (ageMs > 24 * 3600 * 1000) {
      return new Response(JSON.stringify({ action: null, reason: "stale" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(
      JSON.stringify({
        action: {
          decision_id: decision.id,
          strategy: decision.strategy,
          placement: decision.placement,
          intent: decision.intent,
          segment: profile?.current_conversion_segment ?? null,
        },
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    console.error("[conv-nba] fatal", (e as Error).message);
    return new Response(JSON.stringify({ action: null, error: "internal" }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
