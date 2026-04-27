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
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

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

    const res = await fetch(`${SUPABASE_URL}/functions/v1/send-transactional-email`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        apikey: SUPABASE_SERVICE_ROLE_KEY,
      },
      body: JSON.stringify({
        templateName,
        recipientEmail: "info@vistaceo.com",
        idempotencyKey,
        templateData: { ...payload, timestamp },
      }),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      console.error("[notify-admin] send-transactional-email failed", res.status, data);
      throw new Error(`send-transactional-email ${res.status}: ${JSON.stringify(data)}`);
    }

    console.log("[notify-admin] queued", payload.event, "→ info@vistaceo.com", data);

    return new Response(JSON.stringify({ ok: true, queued: true, data }), {
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
