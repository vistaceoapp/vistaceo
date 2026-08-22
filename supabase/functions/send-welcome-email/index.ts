// send-welcome-email — envía el email de bienvenida (template user-welcome).
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
    if (!email || !email.includes("@")) {
      return new Response(JSON.stringify({ ok: false, error: "invalid_email" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const firstName = fullName?.split(" ")[0] || email.split("@")[0];

    const result = await sendAppEmail({
      templateName: "user-welcome",
      recipientEmail: email,
      idempotencyKey: `user-welcome-${email}`,
      templateData: {
        firstName,
        setupUrl: `${APP_BASE_URL}/setup`,
        trackingId: `wel-${email}`,
        recipientEmail: email,
      },
    });

    if (!result.ok) throw new Error(result.reason || "send_failed");

    return new Response(JSON.stringify({ ok: true, sent: result.sent, reason: result.reason }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error("[send-welcome-email] error", err);
    return new Response(JSON.stringify({ ok: false, error: err?.message ?? String(err) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
