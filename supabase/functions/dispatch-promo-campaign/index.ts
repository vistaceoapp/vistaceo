import { sendAppEmail } from "../_shared/transactional-email-templates/send-app-email.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Approximate FX table: local currency per 1 USD.
// Only used for displaying the "≈ $X local" figure in the email/checkout.
// Payment amount is fixed server-side (USD via PayPal, ARS via MercadoPago).
const FX_PER_USD: Record<string, { code: string; rate: number; symbol: string }> = {
  AR: { code: "ARS", rate: 1200, symbol: "$" },
  BO: { code: "BOB", rate: 7, symbol: "Bs" },
  CL: { code: "CLP", rate: 950, symbol: "$" },
  CO: { code: "COP", rate: 4000, symbol: "$" },
  CR: { code: "CRC", rate: 520, symbol: "₡" },
  DO: { code: "DOP", rate: 60, symbol: "RD$" },
  EC: { code: "USD", rate: 1, symbol: "$" },
  ES: { code: "EUR", rate: 0.93, symbol: "€" },
  GT: { code: "GTQ", rate: 7.8, symbol: "Q" },
  HN: { code: "HNL", rate: 24.7, symbol: "L" },
  MX: { code: "MXN", rate: 18, symbol: "$" },
  NI: { code: "NIO", rate: 36.8, symbol: "C$" },
  PA: { code: "USD", rate: 1, symbol: "$" },
  PE: { code: "PEN", rate: 3.75, symbol: "S/" },
  PY: { code: "PYG", rate: 7300, symbol: "₲" },
  SV: { code: "USD", rate: 1, symbol: "$" },
  UY: { code: "UYU", rate: 40, symbol: "$" },
};

const APP_URL = Deno.env.get("SITE_URL") || "https://www.vistaceo.com";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

function niceLocal(usd: number, country: string) {
  const fx = FX_PER_USD[country] || { code: "USD", rate: 1, symbol: "$" };
  const raw = usd * fx.rate;
  // Round to a nice psychological figure
  let amount: number;
  if (fx.rate >= 1000) amount = Math.max(1000, Math.round(raw / 100) * 100);
  else if (fx.rate >= 100) amount = Math.max(100, Math.round(raw / 10) * 10);
  else if (fx.rate >= 10) amount = Math.max(10, Math.round(raw));
  else amount = Math.max(1, Math.round(raw * 10) / 10);
  const fmt = new Intl.NumberFormat("es-AR", { maximumFractionDigits: fx.rate < 10 ? 2 : 0 }).format(amount);
  return { display: `${fx.symbol}${fmt} ${fx.code}`, amount, currency: fx.code };
}

interface DispatchBody {
  campaignId?: string;
  createCampaign?: { name: string; usdAmount?: number; arsAmount?: number; windowHours?: number };
  segments?: Array<"free_setup_complete" | "free_setup_stuck_14d" | "checkout_abandoned" | "free_active_60d">;
  testEmail?: string;     // if set, only sends 1 email to this address (as dry run + preview)
  dryRun?: boolean;       // if true, no emails sent, returns list of intended recipients
  maxRecipients?: number; // safety cap
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization") || "";
    const jwt = authHeader.replace(/^Bearer\s+/i, "");
    if (!jwt) return json({ error: "missing auth" }, 401);

    const userClient = createClient(SUPABASE_URL, Deno.env.get("SUPABASE_ANON_KEY") || Deno.env.get("SUPABASE_PUBLISHABLE_KEY") || "", {
      global: { headers: { Authorization: `Bearer ${jwt}` } },
    });
    const { data: { user } } = await userClient.auth.getUser();
    if (!user) return json({ error: "invalid session" }, 401);

    const admin = createClient(SUPABASE_URL, SERVICE_KEY);
    const { data: isAdmin } = await admin.rpc("has_role", { _user_id: user.id, _role: "admin" });
    if (!isAdmin) return json({ error: "forbidden" }, 403);

    const body = (await req.json().catch(() => ({}))) as DispatchBody;

    // 1) Ensure campaign exists
    let campaignId = body.campaignId;
    let campaign: any = null;
    if (campaignId) {
      const { data } = await admin.from("promo_campaigns").select("*").eq("id", campaignId).maybeSingle();
      campaign = data;
    } else if (body.createCampaign) {
      const { data, error } = await admin.from("promo_campaigns").insert({
        name: body.createCampaign.name,
        usd_amount: body.createCampaign.usdAmount ?? 1,
        ars_amount: body.createCampaign.arsAmount ?? 1200,
        window_hours: body.createCampaign.windowHours ?? 24,
        status: "active",
        created_by: user.id,
      }).select("*").single();
      if (error) return json({ error: "cannot create campaign", details: error.message }, 500);
      campaign = data;
      campaignId = data.id;
    } else {
      return json({ error: "campaignId or createCampaign required" }, 400);
    }
    if (!campaign) return json({ error: "campaign not found" }, 404);

    const usdAmount = Number(campaign.usd_amount);
    const arsAmount = Number(campaign.ars_amount);
    const windowHours = campaign.window_hours || 24;

    // 2) Build recipients
    const cap = Math.min(body.maxRecipients ?? 5000, 5000);
    let candidates: Array<{ user_id: string; email: string; full_name?: string; country?: string; business_id?: string; business_name?: string }> = [];

    if (body.testEmail) {
      // Test mode: send to the admin's specified email with dummy user context (self)
      const email = body.testEmail.trim().toLowerCase();
      const { data: p } = await admin.from("profiles").select("id, email, full_name").eq("email", email).maybeSingle();
      const targetId = p?.id || user.id;
      const { data: biz } = await admin.from("businesses").select("id, name, country").eq("owner_id", targetId).limit(1).maybeSingle();
      candidates = [{
        user_id: targetId,
        email,
        full_name: p?.full_name || undefined,
        country: biz?.country || "AR",
        business_id: biz?.id,
        business_name: biz?.name,
      }];
    } else {
      const segments = body.segments || ["free_setup_complete"];
      const query = admin
        .from("profiles")
        .select("id, email, full_name, created_at")
        .not("email", "is", null)
        .limit(cap * 2);
      const { data: profiles } = await query;
      const profileList = profiles || [];

      // Attach latest business + subscription status
      const ids = profileList.map((p) => p.id);
      const [{ data: bizAll }, { data: subs }] = await Promise.all([
        admin.from("businesses").select("id, owner_id, name, country, setup_completed, created_at").in("owner_id", ids),
        admin.from("subscriptions").select("business_id, status, expires_at").in("business_id", []),
      ]);

      // Map latest business per user
      const bizByUser = new Map<string, any>();
      (bizAll || []).forEach((b) => {
        const cur = bizByUser.get(b.owner_id);
        if (!cur || new Date(b.created_at) > new Date(cur.created_at)) bizByUser.set(b.owner_id, b);
      });

      // Load Pro subscription businesses for exclusion
      const bizIds = (bizAll || []).map((b) => b.id);
      const { data: activeSubs } = bizIds.length
        ? await admin.from("subscriptions").select("business_id").eq("status", "active").gt("expires_at", new Date().toISOString()).in("business_id", bizIds)
        : { data: [] as any[] };
      const proBizIds = new Set((activeSubs || []).map((s) => s.business_id));

      // Load already-emailed users for this campaign (dedupe)
      const { data: existing } = await admin.from("promo_offers").select("user_id").eq("campaign_id", campaignId);
      const alreadySent = new Set((existing || []).map((r) => r.user_id));

      const now = Date.now();
      const D14 = 14 * 24 * 3600 * 1000;
      const D60 = 60 * 24 * 3600 * 1000;

      for (const p of profileList) {
        if (alreadySent.has(p.id)) continue;
        const biz = bizByUser.get(p.id);
        if (biz && proBizIds.has(biz.id)) continue; // already Pro

        const setupDone = biz?.setup_completed === true;
        const createdMs = new Date(p.created_at).getTime();
        const age = now - createdMs;

        let match = false;
        if (segments.includes("free_setup_complete") && setupDone) match = true;
        if (segments.includes("free_setup_stuck_14d") && !setupDone && age <= D14) match = true;
        if (segments.includes("free_active_60d") && age <= D60) match = true;
        // checkout_abandoned would require a paypal_order_pending scan — skipped for now (safe default)
        if (!match) continue;

        candidates.push({
          user_id: p.id,
          email: p.email!,
          full_name: p.full_name || undefined,
          country: biz?.country || "AR",
          business_id: biz?.id,
          business_name: biz?.name,
        });
        if (candidates.length >= cap) break;
      }
    }

    if (candidates.length === 0) {
      return json({ campaignId, planned: 0, sent: 0, message: "no matching recipients" });
    }

    if (body.dryRun) {
      return json({
        campaignId,
        planned: candidates.length,
        sent: 0,
        preview: candidates.slice(0, 20).map((c) => ({ email: c.email, country: c.country })),
      });
    }

    // 3) Create promo_offers + enqueue email
    const expiresAt = new Date(Date.now() + windowHours * 3600 * 1000).toISOString();
    let sent = 0;
    let failed = 0;
    const errors: string[] = [];

    for (const c of candidates) {
      const country = (c.country || "AR").toUpperCase();
      const local = niceLocal(usdAmount, country);
      const localForDb = country === "AR" ? arsAmount : local.amount;
      const currencyForDb = country === "AR" ? "ARS" : local.currency;
      const token = crypto.randomUUID().replace(/-/g, "") + crypto.randomUUID().replace(/-/g, "").slice(0, 8);

      // Upsert offer
      const { data: offer, error: offerErr } = await admin
        .from("promo_offers")
        .upsert({
          campaign_id: campaignId,
          user_id: c.user_id,
          recipient_email: c.email,
          token,
          plan_id: "pro_monthly",
          country,
          currency: currencyForDb,
          usd_amount: usdAmount,
          local_amount: localForDb,
          expires_at: expiresAt,
          sent_at: new Date().toISOString(),
        }, { onConflict: "campaign_id,user_id" })
        .select("token, expires_at")
        .single();

      if (offerErr || !offer) {
        failed++;
        errors.push(`${c.email}: ${offerErr?.message}`);
        continue;
      }

      const checkoutUrl = `${APP_URL}/checkout?promo=${offer.token}`;
      const localDisplay = country === "AR"
        ? `$${new Intl.NumberFormat("es-AR", { maximumFractionDigits: 0 }).format(arsAmount)} ARS`
        : local.display;
      const usdDisplay = `$${usdAmount.toFixed(usdAmount < 10 ? 2 : 0)} USD`.replace(".00", "");

      const idempotencyKey = `promo-${campaignId}-${c.user_id}`;
      const firstName = c.full_name?.split(" ")[0] || c.email.split("@")[0];

      const emailResult = await sendAppEmail({
        templateName: "user-promo-24h",
        recipientEmail: c.email,
        idempotencyKey,
        templateData: {
          firstName,
          checkoutUrl,
          localDisplay,
          usdDisplay,
          expiresAt: offer.expires_at,
          businessName: c.business_name || undefined,
          recipientEmail: c.email,
          trackingId: idempotencyKey,
        },
      });

      if (!emailResult.ok) {
        failed++;
        errors.push(`${c.email}: ${emailResult.reason ?? "send_failed"}`);
      } else {
        sent++;
      }
    }

    return json({
      campaignId,
      planned: candidates.length,
      sent,
      failed,
      errors: errors.slice(0, 10),
    });
  } catch (e) {
    console.error("[dispatch-promo-campaign] error:", e);
    return json({ error: e instanceof Error ? e.message : "unknown" }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
