// send-email-activated
// Thin wrapper: forwards to send-transactional-email.
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const APP_BASE_URL = Deno.env.get("APP_BASE_URL") || "https://www.vistaceo.com";

    const body = await req.json().catch(() => ({}));
    const email = (body.email || "").trim().toLowerCase();
    const fullName = (body.fullName || "").trim();
    const businessName = (body.businessName || "").trim();
    const businessId = body.businessId || body.userId || crypto.randomUUID();

    if (!email || !email.includes("@")) {
      return new Response(JSON.stringify({ ok: false, error: "invalid_email" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const firstName = fullName?.split(" ")[0] || email.split("@")[0];

    const res = await fetch(`${SUPABASE_URL}/functions/v1/send-transactional-email`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        apikey: SUPABASE_SERVICE_ROLE_KEY,
      },
      body: JSON.stringify({
        templateName: "user-activated",
        recipientEmail: email,
        idempotencyKey: `user-activated-${businessId}`,
        templateData: {
          firstName,
          businessName,
          dashboardUrl: `${APP_BASE_URL}/app`,
          trackingId: `act-${businessId}`,
          recipientEmail: email,
        },
      }),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      console.error("[send-email-activated] forward failed", res.status, data);
      throw new Error(`forward ${res.status}: ${JSON.stringify(data)}`);
    }

    console.log("[send-email-activated] queued →", email);
    return new Response(JSON.stringify({ ok: true, queued: true }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error("[send-email-activated] error", err);
    return new Response(JSON.stringify({ ok: false, error: err?.message ?? String(err) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
