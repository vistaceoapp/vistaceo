import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const ADMIN_EMAIL = "info@vistaceo.com";
const FROM = "VistaCEO Alerts <onboarding@resend.dev>";

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

const html = (title: string, rows: Array<[string, string | undefined]>, accent: string) => `
<!DOCTYPE html>
<html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f5f5f7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f7;padding:40px 16px;">
    <tr><td align="center">
      <table width="100%" style="max-width:560px;background:#ffffff;border-radius:18px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.04);">
        <tr><td style="padding:28px 32px 16px 32px;border-bottom:1px solid #f0f0f2;">
          <div style="display:inline-block;padding:6px 12px;border-radius:999px;background:${accent}15;color:${accent};font-size:12px;font-weight:600;letter-spacing:0.3px;text-transform:uppercase;">VistaCEO · Notificación</div>
          <h1 style="margin:14px 0 4px 0;font-size:22px;color:#111;font-weight:700;letter-spacing:-0.3px;">${title}</h1>
          <p style="margin:0;font-size:13px;color:#86868b;">${new Date().toLocaleString("es-AR", { timeZone: "America/Argentina/Buenos_Aires" })}</p>
        </td></tr>
        <tr><td style="padding:20px 32px 28px 32px;">
          <table width="100%" cellpadding="0" cellspacing="0" style="font-size:14px;color:#1d1d1f;">
            ${rows
              .filter(([, v]) => v && v.trim())
              .map(
                ([k, v]) => `
              <tr>
                <td style="padding:10px 0;border-bottom:1px solid #f5f5f7;color:#86868b;width:130px;font-size:12.5px;text-transform:uppercase;letter-spacing:0.4px;">${k}</td>
                <td style="padding:10px 0;border-bottom:1px solid #f5f5f7;color:#1d1d1f;font-weight:500;">${v}</td>
              </tr>`
              )
              .join("")}
          </table>
        </td></tr>
        <tr><td style="padding:0 32px 28px 32px;">
          <p style="margin:0;font-size:12px;color:#a1a1a6;line-height:1.5;">Este es un aviso interno automático de VistaCEO. Respondé este email solo si necesitás contactar al usuario.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const apiKey = Deno.env.get("RESEND_API_KEY");
    if (!apiKey) throw new Error("RESEND_API_KEY not configured");
    const resend = new Resend(apiKey);

    const payload = (await req.json()) as Payload;
    if (!payload?.event) throw new Error("Missing event");

    let subject = "";
    let title = "";
    let accent = "#0071e3";
    let rows: Array<[string, string | undefined]> = [];

    if (payload.event === "user_signup") {
      subject = `🆕 Nuevo usuario: ${payload.email ?? "sin email"}`;
      title = "Nuevo usuario registrado";
      accent = "#0071e3";
      rows = [
        ["Email", payload.email],
        ["Nombre", payload.fullName],
        ["Método", payload.authMethod === "google" ? "Google" : "Email + contraseña"],
        ["User ID", payload.userId],
      ];
    } else if (payload.event === "setup_completed") {
      subject = `✅ Setup completado: ${payload.businessName ?? "negocio"} (${payload.email ?? "—"})`;
      title = "Setup completado · Usuario activo";
      accent = "#34c759";
      rows = [
        ["Negocio", payload.businessName],
        ["Email", payload.email],
        ["Nombre", payload.fullName],
        ["País", payload.countryCode],
        ["Rubro", payload.areaId],
        ["Business ID", payload.businessId],
        ["User ID", payload.userId],
      ];
    } else {
      throw new Error(`Unknown event: ${payload.event}`);
    }

    const result = await resend.emails.send({
      from: FROM,
      to: [ADMIN_EMAIL],
      subject,
      html: html(title, rows, accent),
    });

    return new Response(JSON.stringify({ ok: true, result }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("[notify-admin] Error:", message);
    return new Response(JSON.stringify({ ok: false, error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
