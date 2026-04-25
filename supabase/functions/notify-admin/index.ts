// notify-admin: envía notificaciones al administrador (info@vistaceo.com)
// usando Resend directamente. NUNCA envía al usuario final.
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const ADMIN_EMAIL = "info@vistaceo.com";
// Usamos el remitente de prueba de Resend para no depender de verificación DNS.
// Si en el futuro verificás vistaceo.com en Resend, cambiá a "VistaCEO <notify@vistaceo.com>".
const FROM = "VistaCEO Admin <onboarding@resend.dev>";

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

function escapeHtml(s: unknown): string {
  return String(s ?? "—")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function row(label: string, value: unknown): string {
  return `<tr>
    <td style="padding:8px 12px;border-bottom:1px solid #eee;color:#666;font-size:13px;width:160px;">${escapeHtml(label)}</td>
    <td style="padding:8px 12px;border-bottom:1px solid #eee;color:#111;font-size:14px;font-weight:500;">${escapeHtml(value)}</td>
  </tr>`;
}

function buildEmail(payload: Payload, timestamp: string): { subject: string; html: string } {
  if (payload.event === "user_signup") {
    const subject = `🆕 Nuevo usuario en VistaCEO — ${payload.email ?? "sin email"}`;
    const html = `
      <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;background:#f6f7f9;padding:24px;">
        <div style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #eee;">
          <div style="padding:20px 24px;background:#0a0a0a;color:#fff;">
            <div style="font-size:12px;letter-spacing:1px;opacity:0.7;">VISTACEO · ADMIN</div>
            <div style="font-size:18px;font-weight:600;margin-top:4px;">🆕 Nuevo registro de usuario</div>
          </div>
          <table style="width:100%;border-collapse:collapse;">
            ${row("Email", payload.email)}
            ${row("Nombre", payload.fullName)}
            ${row("Método", payload.authMethod === "google" ? "Google" : "Email/Password")}
            ${row("User ID", payload.userId)}
            ${row("Fecha", timestamp)}
          </table>
          <div style="padding:16px 24px;background:#fafafa;color:#888;font-size:12px;">
            Notificación automática — solo para administradores.
          </div>
        </div>
      </div>`;
    return { subject, html };
  }

  // setup_completed
  const subject = `✅ Setup completado — ${payload.businessName ?? payload.email ?? "negocio"}`;
  const html = `
    <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;background:#f6f7f9;padding:24px;">
      <div style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #eee;">
        <div style="padding:20px 24px;background:#0a0a0a;color:#fff;">
          <div style="font-size:12px;letter-spacing:1px;opacity:0.7;">VISTACEO · ADMIN</div>
          <div style="font-size:18px;font-weight:600;margin-top:4px;">✅ Onboarding completado</div>
        </div>
        <table style="width:100%;border-collapse:collapse;">
          ${row("Negocio", payload.businessName)}
          ${row("Email", payload.email)}
          ${row("Nombre", payload.fullName)}
          ${row("País", payload.countryCode)}
          ${row("Área", payload.areaId)}
          ${row("Business ID", payload.businessId)}
          ${row("User ID", payload.userId)}
          ${row("Fecha", timestamp)}
        </table>
        <div style="padding:16px 24px;background:#fafafa;color:#888;font-size:12px;">
          Notificación automática — solo para administradores.
        </div>
      </div>
    </div>`;
  return { subject, html };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!RESEND_API_KEY) throw new Error("RESEND_API_KEY no configurada");

    const payload = (await req.json()) as Payload;
    if (!payload?.event) throw new Error("Missing event");

    const timestamp = new Date().toLocaleString("es-AR", {
      timeZone: "America/Argentina/Buenos_Aires",
    });

    const { subject, html } = buildEmail(payload, timestamp);

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: FROM,
        to: [ADMIN_EMAIL],
        subject,
        html,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      console.error("[notify-admin] Resend error", res.status, data);
      throw new Error(`Resend ${res.status}: ${JSON.stringify(data)}`);
    }

    console.log("[notify-admin] sent", payload.event, "→", ADMIN_EMAIL, "id:", data.id);

    return new Response(JSON.stringify({ ok: true, id: data.id }), {
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
