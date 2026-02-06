import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const TEMPLATE_KEY = "email_02_setup_reminder_24h_v1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SetupReminderRequest {
  userId?: string;
  email?: string;
  fullName?: string;
  runJob?: boolean; // If true, runs the cron job logic
}

// VistaCEO Premium Design System
const BRAND = {
  gradientStart: "#298FDA",
  gradientMid: "#3B79D9",
  gradientEnd: "#5D73E1",
  backgroundDark: "#0B0F17",
  cardDark: "#0F1624",
  borderColor: "rgba(255,255,255,0.08)",
  textPrimary: "#FFFFFF",
  textSecondary: "rgba(255,255,255,0.82)",
  textMuted: "rgba(255,255,255,0.62)",
  warningAccent: "#F59E0B",
  // Email-safe hosted assets (absolute URLs required for email clients)
  logoUrl: "https://nlewrgmcawzcdazhfiyy.supabase.co/storage/v1/object/public/email-assets/vistaceo-logo-white.png?v=3",
};

function generateSetupReminderEmail(
  firstName: string,
  setupUrl: string,
  dashboardUrl: string,
): { html: string; text: string } {
  const utmBase = "utm_source=vistaceo&utm_medium=email&utm_campaign=email_02_setup_reminder";
  
  const setupUrlWithUtm = `${setupUrl}?${utmBase}&utm_content=cta_primary`;
  const dashboardUrlWithUtm = `${dashboardUrl}?${utmBase}&utm_content=cta_secondary`;

  const html = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Falta calibrar tu contexto</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

    body { margin: 0; padding: 0; background-color: ${BRAND.backgroundDark}; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
    table { border-spacing: 0; }
    td { padding: 0; }
    img { border: 0; outline: none; text-decoration: none; -ms-interpolation-mode: bicubic; display: block; }

    @media only screen and (max-width: 600px) {
      .container { width: 100% !important; padding: 16px !important; }
      .content { padding: 24px 20px !important; }
      .cta-btn { width: 100% !important; display: block !important; }
      .hero-title { font-size: 28px !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: ${BRAND.backgroundDark};">
  <!-- Preview Text -->
  <div style="display: none; max-height: 0; overflow: hidden; mso-hide: all;">
    Sin la configuración de tu negocio o servicio, la IA no puede personalizar tu cuenta. Completalo y activá la inteligencia suprema de tu CEO digital.
    ‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;
  </div>

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: ${BRAND.backgroundDark};">
    <tr>
      <td align="center" style="padding: 40px 0;">
        <!--[if mso]><table role="presentation" width="600" cellpadding="0" cellspacing="0" align="center"><tr><td><![endif]-->
        <table role="presentation" class="container" cellpadding="0" cellspacing="0" style="width: 100%; max-width: 600px; margin: 0 auto; background-color: ${BRAND.cardDark}; border-radius: 20px; border: 1px solid ${BRAND.borderColor}; overflow: hidden;">
          
          <!-- Header with Logo -->
          <tr>
            <td align="center" style="padding: 32px 20px 24px; border-bottom: 1px solid ${BRAND.borderColor};">
              <a href="https://vistaceo.com" target="_blank" style="text-decoration: none; display: inline-block;">
                <img src="${BRAND.logoUrl}" alt="VistaCEO® Latinoamérica" width="180" style="width: 180px; max-width: 180px; height: auto; display: block;" />
              </a>
            </td>
          </tr>

          <!-- Hero Section -->
          <tr>
            <td class="content" style="padding: 40px 40px 32px;">
              <!-- Warning Accent Line -->
              <div style="width: 60px; height: 4px; background: linear-gradient(135deg, ${BRAND.warningAccent}, ${BRAND.gradientEnd}); border-radius: 2px; margin-bottom: 24px;"></div>
              
              <h1 class="hero-title" style="margin: 0 0 16px; font-size: 32px; font-weight: 700; color: ${BRAND.textPrimary}; line-height: 1.2;">
                Falta calibrar tu contexto
              </h1>

              <p style="margin: 0 0 20px; font-size: 16px; color: ${BRAND.textSecondary}; line-height: 1.7;">
                <strong style="color: ${BRAND.textPrimary};">${firstName}</strong>, creaste tu cuenta pero aún no completaste la configuración inicial. Sin esta información, nuestra IA queda genérica y pierde la capacidad de darte recomendaciones personalizadas.
              </p>

              <p style="margin: 0 0 32px; font-size: 16px; color: ${BRAND.textSecondary}; line-height: 1.7;">
                Tomá 3 minutos para calibrar VistaCEO® a tu negocio y desbloqueá todo el potencial de tu CEO digital.
              </p>

              <!-- Benefits Card -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, rgba(245,158,11,0.08), rgba(93,115,225,0.08)); border-radius: 16px; border: 1px solid ${BRAND.borderColor};">
                <tr>
                  <td style="padding: 24px;">
                    <p style="margin: 0 0 16px; font-size: 14px; font-weight: 600; color: ${BRAND.warningAccent}; text-transform: uppercase; letter-spacing: 0.5px;">
                      Lo que desbloqueás con la configuración
                    </p>
                    <table role="presentation" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding: 8px 0; vertical-align: top;">
                          <span style="color: ${BRAND.gradientStart}; font-size: 16px; margin-right: 12px;">🎯</span>
                        </td>
                        <td style="padding: 8px 0;">
                          <span style="color: ${BRAND.textPrimary}; font-size: 15px;">Plan de acción personalizado para tu tipo de negocio</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; vertical-align: top;">
                          <span style="color: ${BRAND.gradientStart}; font-size: 16px; margin-right: 12px;">📊</span>
                        </td>
                        <td style="padding: 8px 0;">
                          <span style="color: ${BRAND.textPrimary}; font-size: 15px;">Métricas relevantes calibradas a tu industria</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; vertical-align: top;">
                          <span style="color: ${BRAND.gradientStart}; font-size: 16px; margin-right: 12px;">🔮</span>
                        </td>
                        <td style="padding: 8px 0;">
                          <span style="color: ${BRAND.textPrimary}; font-size: 15px;">Radar de prioridades inteligente</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; vertical-align: top;">
                          <span style="color: ${BRAND.gradientStart}; font-size: 16px; margin-right: 12px;">⚡</span>
                        </td>
                        <td style="padding: 8px 0;">
                          <span style="color: ${BRAND.textPrimary}; font-size: 15px;">Misiones guiadas adaptadas a tus objetivos</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- CTA Section -->
          <tr>
            <td style="padding: 0 40px 40px;">
              <!-- Primary CTA -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding-bottom: 16px;">
                    <a href="${setupUrlWithUtm}" target="_blank" class="cta-btn" style="display: inline-block; background: linear-gradient(135deg, ${BRAND.gradientStart}, ${BRAND.gradientEnd}); color: ${BRAND.textPrimary}; text-decoration: none; padding: 18px 48px; border-radius: 14px; font-size: 16px; font-weight: 600; min-width: 200px; text-align: center; box-shadow: 0 8px 24px rgba(41,143,218,0.3);">
                      Completar configuración →
                    </a>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding-bottom: 16px;">
                    <a href="${dashboardUrlWithUtm}" target="_blank" class="cta-btn" style="display: inline-block; background: transparent; color: ${BRAND.textSecondary}; text-decoration: none; padding: 14px 32px; border-radius: 12px; font-size: 14px; font-weight: 500; border: 1px solid ${BRAND.borderColor};">
                      Entrar al dashboard
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Fallback Link -->
              <p style="margin: 16px 0 0; font-size: 12px; color: ${BRAND.textMuted}; text-align: center; line-height: 1.6;">
                Si el botón no funciona, abrí este enlace:<br>
                <a href="${setupUrlWithUtm}" style="color: ${BRAND.gradientStart}; text-decoration: underline; word-break: break-all;">${setupUrlWithUtm}</a>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 40px; background-color: rgba(0,0,0,0.3); border-top: 1px solid ${BRAND.borderColor};">
              <p style="margin: 0 0 8px; font-size: 14px; color: ${BRAND.textSecondary}; text-align: center;">
                Respondé este email y te ayudamos a configurar tu cuenta.
              </p>
              <p style="margin: 0; font-size: 12px; color: ${BRAND.textMuted}; text-align: center;">
                <a href="mailto:info@vistaceo.com" style="color: ${BRAND.gradientStart}; text-decoration: none;">info@vistaceo.com</a>
              </p>
              <p style="margin: 16px 0 0; font-size: 11px; color: ${BRAND.textMuted}; text-align: center;">
                © ${new Date().getFullYear()} VistaCEO® Latinoamérica. Todos los derechos reservados.
              </p>
            </td>
          </tr>

        </table>
        <!--[if mso]></td></tr></table><![endif]-->
      </td>
    </tr>
  </table>
</body>
</html>
`;

  const text = `
Tu cuenta en VistaCEO® está casi lista...falta calibrar tu contexto.

Falta calibrar tu contexto

${firstName}, creaste tu cuenta pero aún no completaste la configuración inicial. Sin esta información, nuestra IA queda genérica y pierde la capacidad de darte recomendaciones personalizadas.

Tomá 3 minutos para calibrar VistaCEO® a tu negocio y desbloqueá todo el potencial de tu CEO digital.

Lo que desbloqueás con la configuración:
🎯 Plan de acción personalizado para tu tipo de negocio
📊 Métricas relevantes calibradas a tu industria
🔮 Radar de prioridades inteligente
⚡ Misiones guiadas adaptadas a tus objetivos

→ Completar configuración: ${setupUrlWithUtm}

→ Entrar al dashboard: ${dashboardUrlWithUtm}

---

Respondé este email y te ayudamos a configurar tu cuenta.
info@vistaceo.com

© ${new Date().getFullYear()} VistaCEO® Latinoamérica. Todos los derechos reservados.
`;

  return { html, text };
}

async function sendReminderToUser(
  supabase: any,
  resend: Resend,
  userId: string,
  email: string,
  fullName: string,
  APP_BASE_URL: string,
  DASHBOARD_PATH: string
): Promise<{ sent: boolean; reason?: string }> {
  // Check idempotency
  const { data: existingEvent } = await supabase
    .from("email_events")
    .select("id, status")
    .eq("user_id", userId)
    .eq("template_key", TEMPLATE_KEY)
    .single();

  if (existingEvent?.status === "sent") {
    return { sent: false, reason: "already_sent" };
  }

  // Create or update event record
  await supabase.from("email_events").upsert({
    user_id: userId,
    template_key: TEMPLATE_KEY,
    status: "pending",
    metadata: { email, fullName },
  }, { onConflict: "user_id,template_key" });

  const firstName = fullName?.split(" ")[0] || email.split("@")[0];
  const setupUrl = `${APP_BASE_URL}/setup`;
  const dashboardUrl = `${APP_BASE_URL}${DASHBOARD_PATH}`;

  const { html, text } = generateSetupReminderEmail(firstName, setupUrl, dashboardUrl);

  const emailResponse = await resend.emails.send({
    from: "VistaCEO® Latinoamérica <info@vistaceo.com>",
    replyTo: "info@vistaceo.com",
    to: [email],
    subject: "Tu cuenta está casi lista ⚠️ …falta calibrar tu contexto.",
    html,
    text,
  });

  // Update event as sent
  await supabase.from("email_events").update({
    status: "sent",
    provider_message_id: emailResponse.data?.id || null,
    sent_at: new Date().toISOString(),
  }).eq("user_id", userId).eq("template_key", TEMPLATE_KEY);

  console.log(`[Email] Sent ${TEMPLATE_KEY} to ${email}`);
  return { sent: true };
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
  const APP_BASE_URL = Deno.env.get("APP_BASE_URL") || "https://vistaceo.com";
  const DASHBOARD_PATH = Deno.env.get("DASHBOARD_PATH") || "/app";

  if (!RESEND_API_KEY) {
    console.log("[Email] RESEND_NOT_CONFIGURED - skipping");
    return new Response(
      JSON.stringify({ status: "skipped", reason: "RESEND_NOT_CONFIGURED" }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const resend = new Resend(RESEND_API_KEY);

  try {
    const body: SetupReminderRequest = await req.json().catch(() => ({}));

    // JOB MODE: Find all eligible users and send reminders
    if (body.runJob) {
      console.log("[Email Job] Running 24h setup reminder job...");

      const twentyFourHoursAgo = new Date();
      twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

      // Find users who:
      // 1. Created account >= 24h ago
      // 2. Have no business with setup_completed = true
      // 3. Haven't received this email yet
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("id, email, full_name, created_at")
        .lt("created_at", twentyFourHoursAgo.toISOString());

      if (profilesError) {
        console.error("[Email Job] Failed to fetch profiles:", profilesError);
        return new Response(
          JSON.stringify({ error: profilesError.message }),
          { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      let sentCount = 0;
      let skippedCount = 0;

      for (const profile of profiles || []) {
        // Check if user has completed setup
        const { data: businesses } = await supabase
          .from("businesses")
          .select("id, setup_completed")
          .eq("owner_id", profile.id)
          .eq("setup_completed", true)
          .limit(1);

        if (businesses && businesses.length > 0) {
          skippedCount++;
          continue; // User has completed setup, skip
        }

        try {
          const result = await sendReminderToUser(
            supabase,
            resend,
            profile.id,
            profile.email,
            profile.full_name || "",
            APP_BASE_URL,
            DASHBOARD_PATH
          );

          if (result.sent) {
            sentCount++;
          } else {
            skippedCount++;
          }
        } catch (err) {
          console.error(`[Email Job] Failed to send to ${profile.email}:`, err);
          skippedCount++;
        }
      }

      console.log(`[Email Job] Completed: ${sentCount} sent, ${skippedCount} skipped`);
      return new Response(
        JSON.stringify({ status: "completed", sent: sentCount, skipped: skippedCount }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // SINGLE USER MODE: Send to specific user
    const { userId, email, fullName } = body;

    if (!userId || !email) {
      return new Response(
        JSON.stringify({ error: "userId and email are required" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const result = await sendReminderToUser(
      supabase,
      resend,
      userId,
      email,
      fullName || "",
      APP_BASE_URL,
      DASHBOARD_PATH
    );

    return new Response(
      JSON.stringify({ success: result.sent, ...result }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );

  } catch (error: any) {
    console.error("[Email] Error:", error);
    return new Response(
      JSON.stringify({ error: error.message, status: "failed" }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
