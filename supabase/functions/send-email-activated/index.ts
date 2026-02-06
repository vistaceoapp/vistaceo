import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const TEMPLATE_KEY = "email_01_activated_configured_v1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ActivatedEmailRequest {
  userId: string;
  email: string;
  fullName: string;
  businessId?: string;
  businessName?: string;
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
  // Email-safe hosted assets (absolute URLs required for email clients)
  logoUrl: "https://nlewrgmcawzcdazhfiyy.supabase.co/storage/v1/object/public/email-assets/vistaceo-logo-white.png?v=3",
};

function generateActivatedEmail(
  firstName: string,
  dashboardUrl: string,
  setupUrl: string,
): { html: string; text: string } {
  const utmBase = "utm_source=vistaceo&utm_medium=email&utm_campaign=email_01_activated";
  
  const dashboardUrlWithUtm = `${dashboardUrl}?${utmBase}&utm_content=cta_primary`;
  const setupUrlWithUtm = `${setupUrl}?${utmBase}&utm_content=cta_secondary`;

  const html = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>VistaCEO® activado</title>
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
    .mobile-padding { padding-left: 24px !important; padding-right: 24px !important; }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: ${BRAND.backgroundDark}; width: 100%; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%;">
  <div style="display: none; max-height: 0; overflow: hidden; mso-hide: all;">
    La IA ya está calibrándose a tu contexto de negocio — prioridades más precisas y crecimiento más rápido.
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
                    <div style="width: 50px; height: 3px; background: linear-gradient(135deg, ${BRAND.gradientStart}, ${BRAND.gradientEnd}); border-radius: 2px;"></div>
                  </td>
                </tr>
                <tr>
                  <td style="font-size: 28px; font-weight: 700; color: ${BRAND.textPrimary}; padding-bottom: 8px; line-height: 1.2;">
                    Bienvenido
                  </td>
                </tr>
                <tr>
                  <td style="font-size: 17px; font-weight: 500; color: ${BRAND.textSecondary}; padding-bottom: 24px; line-height: 1.4;">
                    Tu CEO digital te está esperando
                  </td>
                </tr>
                <tr>
                  <td style="font-size: 15px; color: ${BRAND.textSecondary}; line-height: 1.7; padding-bottom: 16px;">
                    <strong style="color: ${BRAND.textPrimary};">${firstName}</strong>, acabás de activar la inteligencia suprema que toma el control de tu negocio. A partir de ahora, nuestra IA aprende día a día de tus decisiones, contexto y mercado para darte la dirección exacta hacia el crecimiento.
                  </td>
                </tr>
                <tr>
                  <td style="font-size: 15px; color: ${BRAND.textSecondary}; line-height: 1.7; padding-bottom: 28px;">
                    Ya no estarás solo: tenés un copiloto digital que analiza, prioriza y te guía con acciones concretas, las 24 horas.
                  </td>
                </tr>
              </table>

              <!-- BENEFITS CARD -->
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background: linear-gradient(135deg, rgba(41,143,218,0.1), rgba(93,115,225,0.08)); border-radius: 12px; border: 1px solid ${BRAND.borderColor};">
                <tr>
                  <td style="padding: 20px;">
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                      <tr>
                        <td style="font-size: 12px; font-weight: 600; color: ${BRAND.gradientStart}; text-transform: uppercase; letter-spacing: 0.5px; padding-bottom: 16px;">
                          TU PRÓXIMO PASO
                        </td>
                      </tr>
                      <tr>
                        <td style="font-size: 14px; color: ${BRAND.textPrimary}; padding: 6px 0;">
                          ✓ &nbsp;Explorá tu Radar de prioridades en el Dashboard
                        </td>
                      </tr>
                      <tr>
                        <td style="font-size: 14px; color: ${BRAND.textPrimary}; padding: 6px 0;">
                          ✓ &nbsp;Completá tu primera Misión guiada
                        </td>
                      </tr>
                      <tr>
                        <td style="font-size: 14px; color: ${BRAND.textPrimary}; padding: 6px 0;">
                          ✓ &nbsp;Mirá cómo la IA aprende de tu negocio
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
                          <a href="${dashboardUrlWithUtm}" target="_blank" style="display: block; padding: 16px 24px; color: #FFFFFF; font-size: 15px; font-weight: 600; text-decoration: none; text-align: center;">
                            Entrar al dashboard →
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
                          <a href="${setupUrlWithUtm}" target="_blank" style="display: block; padding: 14px 24px; color: ${BRAND.textSecondary}; font-size: 14px; font-weight: 500; text-decoration: none; text-align: center;">
                            Editar configuración
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="font-size: 11px; color: ${BRAND.textMuted}; text-align: center; line-height: 1.6; padding-top: 8px;">
                    Si el botón no funciona, copiá este enlace:<br>
                    <a href="${dashboardUrlWithUtm}" style="color: ${BRAND.gradientStart}; word-break: break-all;">${dashboardUrlWithUtm}</a>
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
                    ¿Tenés dudas? Respondé este email y te ayudamos.
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
VistaCEO® activado: tu inteligencia suprema ya está operativa

Bienvenido
Tu CEO digital te está esperando

${firstName}, acabás de activar la inteligencia suprema que toma el control de tu negocio. A partir de ahora, nuestra IA aprende día a día de tus decisiones, contexto y mercado para darte la dirección exacta hacia el crecimiento.

Ya no estarás solo: tenés un copiloto digital que analiza, prioriza y te guía con acciones concretas, las 24 horas.

Tu próximo paso:
✓ Explorá tu Radar de prioridades en el Dashboard
✓ Completá tu primera Misión guiada  
✓ Mirá cómo la IA aprende de tu negocio

→ Entrar al dashboard: ${dashboardUrlWithUtm}

→ Editar configuración: ${setupUrlWithUtm}

---

¿Tenés dudas? Respondé este email y te ayudamos.
info@vistaceo.com

© ${new Date().getFullYear()} VistaCEO® Latinoamérica. Todos los derechos reservados.
`;

  return { html, text };
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
  const APP_BASE_URL = Deno.env.get("APP_BASE_URL") || "https://vistaceo.com";
  const DASHBOARD_PATH = Deno.env.get("DASHBOARD_PATH") || "/app";

  // Validate required env vars
  if (!RESEND_API_KEY) {
    console.log("[Email] RESEND_NOT_CONFIGURED - skipping email");
    return new Response(
      JSON.stringify({ status: "skipped", reason: "RESEND_NOT_CONFIGURED" }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  try {
    const { userId, email, fullName, businessId }: ActivatedEmailRequest = await req.json();

    if (!userId || !email) {
      return new Response(
        JSON.stringify({ error: "userId and email are required" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Check idempotency - don't send duplicate
    const { data: existingEvent } = await supabase
      .from("email_events")
      .select("id, status")
      .eq("user_id", userId)
      .eq("template_key", TEMPLATE_KEY)
      .single();

    if (existingEvent?.status === "sent") {
      console.log(`[Email] Already sent ${TEMPLATE_KEY} to user ${userId}`);
      return new Response(
        JSON.stringify({ status: "skipped", reason: "already_sent" }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Create or update event record
    const { error: upsertError } = await supabase
      .from("email_events")
      .upsert({
        user_id: userId,
        business_id: businessId || null,
        template_key: TEMPLATE_KEY,
        status: "pending",
        metadata: { email, fullName },
      }, { onConflict: "user_id,template_key" });

    if (upsertError) {
      console.error("[Email] Failed to create event:", upsertError);
    }

    const firstName = fullName?.split(" ")[0] || email.split("@")[0];
    const dashboardUrl = `${APP_BASE_URL}${DASHBOARD_PATH}`;
    const setupUrl = `${APP_BASE_URL}/setup`;

    const { html, text } = generateActivatedEmail(firstName, dashboardUrl, setupUrl);

    const resend = new Resend(RESEND_API_KEY);
    const emailResponse = await resend.emails.send({
      from: "VistaCEO® Latinoamérica <info@vistaceo.com>",
      replyTo: "info@vistaceo.com",
      to: [email],
      subject: "¡Cuenta creada! ✅ CEO activado: tu inteligencia suprema ya está operativa",
      html,
      text,
    });

    console.log(`[Email] Sent ${TEMPLATE_KEY} to ${email}:`, emailResponse);

    // Update event as sent
    await supabase
      .from("email_events")
      .update({
        status: "sent",
        provider_message_id: emailResponse.data?.id || null,
        sent_at: new Date().toISOString(),
      })
      .eq("user_id", userId)
      .eq("template_key", TEMPLATE_KEY);

    return new Response(
      JSON.stringify({ success: true, status: "sent", ...emailResponse }),
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
