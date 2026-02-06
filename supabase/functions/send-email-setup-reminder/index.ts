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
    body { margin: 0; padding: 0; background-color: ${BRAND.backgroundDark}; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; -webkit-font-smoothing: antialiased; }
    table { border-spacing: 0; mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    td { padding: 0; }
    img { border: 0; outline: none; text-decoration: none; -ms-interpolation-mode: bicubic; display: block; }
    a { color: ${BRAND.gradientStart}; }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: ${BRAND.backgroundDark}; width: 100%; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%;">
  <div style="display: none; max-height: 0; overflow: hidden; mso-hide: all;">
    Sin la configuración de tu negocio, la IA no puede personalizar tu cuenta. Completalo y activá tu CEO digital.
  </div>

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: ${BRAND.backgroundDark};">
    <tr>
      <td align="center" style="padding: 24px 16px;">
        <!--[if mso]><table role="presentation" width="560" cellpadding="0" cellspacing="0" border="0" align="center"><tr><td><![endif]-->
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="width: 100%; max-width: 560px; margin: 0 auto; background-color: ${BRAND.cardDark}; border-radius: 16px; border: 1px solid ${BRAND.borderColor};">
          
          <!-- HEADER -->
          <tr>
            <td style="padding: 32px 24px; text-align: center; border-bottom: 1px solid ${BRAND.borderColor};">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                  <td align="center">
                    <img src="${BRAND.logoUrl}" alt="VistaCEO" width="160" height="40" style="display: block; width: 160px; max-width: 160px; height: auto; margin: 0 auto;" />
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- CONTENT -->
          <tr>
            <td style="padding: 32px 24px;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                  <td style="padding-bottom: 20px;">
                    <div style="width: 50px; height: 3px; background: linear-gradient(135deg, ${BRAND.warningAccent}, ${BRAND.gradientEnd}); border-radius: 2px;"></div>
                  </td>
                </tr>
                <tr>
                  <td style="font-size: 26px; font-weight: 700; color: ${BRAND.textPrimary}; padding-bottom: 16px; line-height: 1.2;">
                    Falta calibrar tu contexto
                  </td>
                </tr>
                <tr>
                  <td style="font-size: 15px; color: ${BRAND.textSecondary}; line-height: 1.7; padding-bottom: 16px;">
                    <strong style="color: ${BRAND.textPrimary};">${firstName}</strong>, creaste tu cuenta pero aún no completaste la configuración inicial. Sin esta información, nuestra IA queda genérica y pierde la capacidad de darte recomendaciones personalizadas.
                  </td>
                </tr>
                <tr>
                  <td style="font-size: 15px; color: ${BRAND.textSecondary}; line-height: 1.7; padding-bottom: 28px;">
                    Tomá 3 minutos para calibrar VistaCEO® a tu negocio y desbloqueá todo el potencial de tu CEO digital.
                  </td>
                </tr>
              </table>

              <!-- BENEFITS CARD -->
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background: linear-gradient(135deg, rgba(245,158,11,0.08), rgba(93,115,225,0.06)); border-radius: 12px; border: 1px solid ${BRAND.borderColor};">
                <tr>
                  <td style="padding: 20px;">
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                      <tr>
                        <td style="font-size: 12px; font-weight: 600; color: ${BRAND.warningAccent}; text-transform: uppercase; letter-spacing: 0.5px; padding-bottom: 16px;">
                          LO QUE DESBLOQUEÁS CON LA CONFIGURACIÓN
                        </td>
                      </tr>
                      <tr>
                        <td style="font-size: 14px; color: ${BRAND.textPrimary}; padding: 6px 0;">
                          🎯 &nbsp;Plan de acción personalizado para tu tipo de negocio
                        </td>
                      </tr>
                      <tr>
                        <td style="font-size: 14px; color: ${BRAND.textPrimary}; padding: 6px 0;">
                          📊 &nbsp;Métricas relevantes calibradas a tu industria
                        </td>
                      </tr>
                      <tr>
                        <td style="font-size: 14px; color: ${BRAND.textPrimary}; padding: 6px 0;">
                          🔮 &nbsp;Radar de prioridades inteligente
                        </td>
                      </tr>
                      <tr>
                        <td style="font-size: 14px; color: ${BRAND.textPrimary}; padding: 6px 0;">
                          ⚡ &nbsp;Misiones guiadas adaptadas a tus objetivos
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- CTA SECTION -->
          <tr>
            <td style="padding: 0 24px 32px;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                  <td align="center" style="padding-bottom: 12px;">
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                      <tr>
                        <td align="center" style="background: linear-gradient(135deg, ${BRAND.gradientStart}, ${BRAND.gradientEnd}); border-radius: 12px;">
                          <a href="${setupUrlWithUtm}" target="_blank" style="display: block; padding: 16px 24px; color: #FFFFFF; font-size: 15px; font-weight: 600; text-decoration: none; text-align: center;">
                            Completar configuración →
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding-bottom: 16px;">
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                      <tr>
                        <td align="center" style="border: 1px solid ${BRAND.borderColor}; border-radius: 10px;">
                          <a href="${dashboardUrlWithUtm}" target="_blank" style="display: block; padding: 14px 24px; color: ${BRAND.textSecondary}; font-size: 14px; font-weight: 500; text-decoration: none; text-align: center;">
                            Entrar al dashboard
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="font-size: 11px; color: ${BRAND.textMuted}; text-align: center; line-height: 1.6; padding-top: 8px;">
                    Si el botón no funciona, copiá este enlace:<br>
                    <a href="${setupUrlWithUtm}" style="color: ${BRAND.gradientStart}; word-break: break-all;">${setupUrlWithUtm}</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td style="padding: 24px; background-color: rgba(0,0,0,0.25); border-top: 1px solid ${BRAND.borderColor}; text-align: center;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                  <td style="font-size: 13px; color: ${BRAND.textSecondary}; padding-bottom: 8px;">
                    Respondé este email y te ayudamos a configurar tu cuenta.
                  </td>
                </tr>
                <tr>
                  <td style="font-size: 12px; color: ${BRAND.textMuted};">
                    <a href="mailto:info@vistaceo.com" style="color: ${BRAND.gradientStart}; text-decoration: none;">info@vistaceo.com</a>
                  </td>
                </tr>
                <tr>
                  <td style="font-size: 11px; color: ${BRAND.textMuted}; padding-top: 16px;">
                    © ${new Date().getFullYear()} VistaCEO® Latinoamérica
                  </td>
                </tr>
              </table>
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
