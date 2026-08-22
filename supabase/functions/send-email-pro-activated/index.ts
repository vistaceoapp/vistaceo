// send-email-pro-activated — confirma activación Pro (template user-pro-activated).
import { sendAppEmail } from "../_shared/transactional-email-templates/send-app-email.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const APP_BASE_URL = Deno.env.get("APP_BASE_URL") || "https://www.vistaceo.com";

    const body = await req.json().catch(() => ({}));
    const email = (body.email || "").trim().toLowerCase();
    const fullName = (body.fullName || "").trim();
    const planLabel = body.planLabel || body.planId || "VISTACEO Pro";
    const subscriptionId = body.subscriptionId || body.userId || crypto.randomUUID();

    if (!email || !email.includes("@")) {
      return new Response(JSON.stringify({ ok: false, error: "invalid_email" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const firstName = fullName?.split(" ")[0] || email.split("@")[0];

    const result = await sendAppEmail({
      templateName: "user-pro-activated",
      recipientEmail: email,
      idempotencyKey: `user-pro-activated-${subscriptionId}`,
      templateData: {
        firstName,
        planLabel,
        dashboardUrl: `${APP_BASE_URL}/app`,
        trackingId: `pro-${subscriptionId}`,
        recipientEmail: email,
      },
    });

    if (!result.ok) throw new Error(result.reason || "send_failed");

    console.log("[send-email-pro-activated] processed →", email, result.sent);
    return new Response(JSON.stringify({ ok: true, sent: result.sent, reason: result.reason }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error("[send-email-pro-activated] error", err);
    return new Response(JSON.stringify({ ok: false, error: err?.message ?? String(err) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
