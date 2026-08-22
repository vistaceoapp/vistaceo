import { sendAppEmail } from "../_shared/transactional-email-templates/send-app-email.ts";

// notify-admin: delega al sistema transaccional oficial usando los templates
// admin-user-signup y admin-setup-completed (React Email premium).
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type EventType = "user_signup" | "setup_completed";

interface Payload {
  event: EventType;
  email?: string;
  fullName?: string;
  authMethod?: "email" | "google";
  businessName?: string;
  businessId?: string;
  countryCode?: string;
  areaId?: string;
  userId?: string;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const payload = (await req.json()) as Payload;
    if (!payload?.event) throw new Error("Missing event");

    const timestamp = new Date().toLocaleString("es-AR", {
      timeZone: "America/Argentina/Buenos_Aires",
    });

    const templateName =
      payload.event === "user_signup" ? "admin-user-signup" : "admin-setup-completed";

    const idempotencyKey =
      payload.event === "user_signup"
        ? `admin-signup-${payload.userId ?? payload.email ?? crypto.randomUUID()}`
        : `admin-setup-${payload.businessId ?? payload.userId ?? crypto.randomUUID()}`;

    const result = await sendAppEmail({
      templateName,
      recipientEmail: "info@vistaceo.com",
      idempotencyKey,
      templateData: { ...payload, timestamp },
    });

    if (!result.ok) {
      console.error("[notify-admin] send failed", result.reason, result.details);
      throw new Error(`send failed: ${result.reason ?? "unknown"}`);
    }

    console.log("[notify-admin] processed", payload.event, "→ info@vistaceo.com", result.sent);

    return new Response(JSON.stringify({ ok: true, sent: result.sent, reason: result.reason }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error("[notify-admin] error", err);
    return new Response(
      JSON.stringify({ ok: false, error: err?.message ?? String(err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
