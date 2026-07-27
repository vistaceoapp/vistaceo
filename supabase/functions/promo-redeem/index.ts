import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Validates a promo token. PUBLIC endpoint (no auth) so the checkout landing
// can pre-show the deal before the user signs in. Returns only non-sensitive
// display data. Does NOT mark the offer as used — that only happens after
// a successful payment via the webhook.
serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const url = new URL(req.url);
    let token = url.searchParams.get("token");
    if (!token && req.method === "POST") {
      const body = await req.json().catch(() => ({}));
      token = body?.token || null;
    }
    if (!token || token.length < 12) {
      return json({ valid: false, reason: "missing_token" }, 400);
    }

    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data: offer, error } = await admin
      .from("promo_offers")
      .select("id, campaign_id, user_id, recipient_email, plan_id, country, currency, usd_amount, local_amount, expires_at, used_at, redeemed_at")
      .eq("token", token)
      .maybeSingle();

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
