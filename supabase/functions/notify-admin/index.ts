// notify-admin: thin compatibility wrapper that forwards admin notifications
// to the Lovable Emails transactional system (send-transactional-email).
// Keeps the same external contract so existing callers don't need updates.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const ADMIN_EMAIL = "info@vistaceo.com";

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
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    const payload = (await req.json()) as Payload;
    if (!payload?.event) throw new Error("Missing event");

    const timestamp = new Date().toLocaleString("es-AR", {
      timeZone: "America/Argentina/Buenos_Aires",
    });

    let templateName: string;
    let templateData: Record<string, unknown>;
    let idempotencyKey: string;

    if (payload.event === "user_signup") {
      templateName = "admin-user-signup";
      templateData = {
        email: payload.email,
        fullName: payload.fullName,
        authMethod: payload.authMethod,
        userId: payload.userId,
        timestamp,
      };
      idempotencyKey = `admin-signup-${payload.userId ?? payload.email ?? crypto.randomUUID()}`;
    } else if (payload.event === "setup_completed") {
      templateName = "admin-setup-completed";
      templateData = {
        email: payload.email,
        fullName: payload.fullName,
        businessName: payload.businessName,
        businessId: payload.businessId,
        countryCode: payload.countryCode,
        areaId: payload.areaId,
        userId: payload.userId,
        timestamp,
      };
      idempotencyKey = `admin-setup-${payload.businessId ?? payload.userId ?? crypto.randomUUID()}`;
    } else {
      throw new Error(`Unknown event: ${payload.event}`);
    }

    const { data, error } = await supabase.functions.invoke("send-transactional-email", {
      body: {
        templateName,
        recipientEmail: ADMIN_EMAIL,
        idempotencyKey,
        templateData,
      },
    });

    if (error) throw error;

    return new Response(JSON.stringify({ ok: true, forwarded: true, data }), {
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
