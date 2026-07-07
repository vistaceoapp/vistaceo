// admin-reset-setup — permite a un admin resetear un setup atascado
// (0% precisión, businessType incorrecto, sin respuestas útiles).
// Limpia business_type_id, area_id, setup_data y precision_score
// para forzar re-clasificación desde cero. No borra el negocio ni el owner.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization") ?? "";
    const token = authHeader.replace(/^Bearer\s+/i, "");
    if (!token) {
      return new Response(JSON.stringify({ error: "missing_auth" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: `Bearer ${token}` } },
      auth: { persistSession: false },
    });
    const { data: userRes } = await anonClient.auth.getUser();
    const user = userRes?.user;
    if (!user) {
      return new Response(JSON.stringify({ error: "unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const admin = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });
    const { data: isAdmin } = await admin.rpc("has_role", { _user_id: user.id, _role: "admin" });
    if (!isAdmin) {
      return new Response(JSON.stringify({ error: "forbidden" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { businessId } = (await req.json()) as { businessId?: string };
    if (!businessId) {
      return new Response(JSON.stringify({ error: "businessId_required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: biz } = await admin
      .from("businesses")
      .select("id, settings")
      .eq("id", businessId)
      .maybeSingle();
    if (!biz) {
      return new Response(JSON.stringify({ error: "not_found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const settings = (biz.settings as Record<string, unknown>) ?? {};
    const auditTrail = Array.isArray(settings.reset_history) ? settings.reset_history : [];
    const nextSettings = {
      ...settings,
      setup_reset_at: new Date().toISOString(),
      reset_history: [
        ...auditTrail.slice(-9),
        { at: new Date().toISOString(), by: user.id, reason: "admin_manual_reset" },
      ],
    };

    const { error: bizErr } = await admin
      .from("businesses")
      .update({
        setup_completed: false,
        precision_score: 0,
        settings: nextSettings,
      })
      .eq("id", businessId);

    if (bizErr) {
      return new Response(JSON.stringify({ error: bizErr.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Reset setup progress (setup_data, current_step, precision)
    await admin
      .from("business_setup_progress")
      .update({
        setup_data: {},
        current_step: "type",
        precision_score: 0,
        completed_at: null,
      })
      .eq("business_id", businessId);

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("[admin-reset-setup] error", err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "unknown" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
