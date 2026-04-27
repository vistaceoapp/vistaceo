// notify-admin: delega al sistema transaccional oficial usando los templates
// admin-user-signup y admin-setup-completed (React Email premium).
import { createClient } from "npm:@supabase/supabase-js@2";

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
    const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;

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

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const { data, error } = await supabase.functions.invoke("send-transactional-email", {
      body: {
        templateName,
        recipientEmail: "info@vistaceo.com",
        idempotencyKey,
        templateData: { ...payload, timestamp },
      },
    });

    if (error) {
      console.error("[notify-admin] invoke error", error);
      throw new Error(error.message || "send-transactional-email failed");
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
