import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { z } from "npm:zod@3.23.8";

const RequestSchema = z.object({
  token: z.string().min(12).max(512).optional(),
  resumeActive: z.boolean().optional(),
});

// Validates a promo token. PUBLIC endpoint (no auth) so the checkout landing
// can pre-show the deal before the user signs in. Returns only non-sensitive
// display data. Does NOT mark the offer as used — that only happens after
// a successful payment via the webhook.
serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const url = new URL(req.url);
    let token = url.searchParams.get("token");
    let resumeActive = false;
    if (!token && req.method === "POST") {
      const body = await req.json().catch(() => ({}));
      const parsed = RequestSchema.safeParse(body);
      if (!parsed.success) return json({ valid: false, reason: "invalid_request" }, 400);
      token = parsed.data.token || null;
      resumeActive = parsed.data.resumeActive === true;
    }
    if ((!token || token.length < 12) && !resumeActive) {
      return json({ valid: false, reason: "missing_token" }, 400);
    }

    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const offerFields = "id, campaign_id, user_id, recipient_email, token, plan_id, country, currency, usd_amount, local_amount, expires_at, used_at, redeemed_at";
    let offer = null;
    let error = null;

    if (resumeActive) {
      const authHeader = req.headers.get("Authorization") || "";
      const jwt = authHeader.replace(/^Bearer\s+/i, "");
      if (!jwt) return json({ valid: false, reason: "authentication_required" }, 401);

      const authClient = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_ANON_KEY") || Deno.env.get("SUPABASE_PUBLISHABLE_KEY") || "",
        { global: { headers: { Authorization: `Bearer ${jwt}` } } },
      );
      const { data: { user }, error: authError } = await authClient.auth.getUser();
      if (authError || !user) return json({ valid: false, reason: "authentication_required" }, 401);

      const baseQuery = () => admin
        .from("promo_offers")
        .select(offerFields)
        .is("used_at", null)
        .gt("expires_at", new Date().toISOString())
        .order("created_at", { ascending: false })
        .limit(1);

      let result = await baseQuery().eq("user_id", user.id).maybeSingle();
      if (!result.data && user.email) {
        result = await baseQuery().ilike("recipient_email", user.email.trim()).maybeSingle();
      }
      offer = result.data;
      error = result.error;
      token = offer?.token || null;
    } else {
      const result = await admin
        .from("promo_offers")
        .select(offerFields)
        .eq("token", token)
        .maybeSingle();
      offer = result.data;
      error = result.error;
    }

    if (error) {
      console.error("[promo-redeem] db error:", error);
      return json({ valid: false, reason: "server_error" }, 500);
    }
    if (!offer) return json({ valid: false, reason: "not_found" }, 404);
    if (offer.used_at) return json({ valid: false, reason: "used" }, 410);
    if (new Date(offer.expires_at).getTime() < Date.now()) {
      return json({ valid: false, reason: "expired", expiresAt: offer.expires_at }, 410);
    }

    // Mark first-view (analytics only)
    if (!offer.redeemed_at) {
      await admin
        .from("promo_offers")
        .update({ redeemed_at: new Date().toISOString() })
        .eq("id", offer.id);
    }

    return json({
      valid: true,
      offer: {
        token: resumeActive ? token : undefined,
        planId: offer.plan_id,
        country: offer.country,
        currency: offer.currency,
        usdAmount: Number(offer.usd_amount),
        localAmount: offer.local_amount ? Number(offer.local_amount) : null,
        expiresAt: offer.expires_at,
        recipientEmail: offer.recipient_email,
      },
    });
  } catch (e) {
    console.error("[promo-redeem] error:", e);
    return json({ valid: false, reason: "server_error" }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
