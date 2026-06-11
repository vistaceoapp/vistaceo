// migrate-legacy-on-relogin
// Marca como `legacy=true` los artefactos IA cacheados de los negocios del
// usuario que vuelve después de >24h. La UI los regenera al abrirse.
// Usa service role para esquivar RLS.

import "https://deno.land/std@0.224.0/dotenv/load.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const REENTRY_THRESHOLD_MS = 24 * 60 * 60 * 1000;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const ANON = Deno.env.get("SUPABASE_ANON_KEY")!;
    const SERVICE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const authHeader = req.headers.get("Authorization") ?? "";
    const userClient = createClient(SUPABASE_URL, ANON, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData, error: userErr } = await userClient.auth.getUser();
    if (userErr || !userData?.user) {
      return new Response(JSON.stringify({ ok: false, reason: "no_auth" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const userId = userData.user.id;
    const admin = createClient(SUPABASE_URL, SERVICE);

    const { data: profile } = await admin
      .from("profiles")
      .select("last_login_at, last_active_at")
      .eq("id", userId)
      .maybeSingle();
    const last = profile?.last_login_at ?? profile?.last_active_at;
    if (!last) {
      return new Response(JSON.stringify({ ok: true, action: "first_login_skip" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const gap = Date.now() - new Date(last as string).getTime();
    if (gap < REENTRY_THRESHOLD_MS) {
      return new Response(JSON.stringify({ ok: true, action: "active_user_skip", gapHours: Math.round(gap / 3600000) }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: bizs } = await admin
      .from("businesses")
      .select("id")
      .eq("owner_id", userId);
    const ids = (bizs ?? []).map((b: { id: string }) => b.id);
    let updated = 0;
    if (ids.length > 0) {
      const { count } = await admin
        .from("ai_artifacts_cache")
        .update({ legacy: true })
        .in("business_id", ids)
        .select("id", { count: "exact", head: true });
      updated = count ?? 0;
    }
    return new Response(
      JSON.stringify({ ok: true, action: "marked_legacy", businesses: ids.length, artifactsMarked: updated, gapHours: Math.round(gap / 3600000) }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: (e as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
